CREATE OR REPLACE FUNCTION get_or_create_claim(p_contracts_id UUID, p_token_id numeric(78, 0))
    RETURNS claims
    LANGUAGE plpgsql
AS
$$
DECLARE
    result claims%ROWTYPE;
BEGIN
    -- Try to fetch the claim
    SELECT c.*
    INTO result
    FROM claims c
    WHERE c.contracts_id = p_contracts_id
      AND c.token_id = p_token_id;

    -- If the claim is found, return it
    IF FOUND THEN
        RETURN result;
    ELSE
        -- If the claim is not found, create a new one
        INSERT INTO claims (contracts_id, token_id)
        VALUES (p_contracts_id, p_token_id)
        RETURNING * INTO result;

        -- Return the newly created claim
        RETURN result;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION generate_hypercert_id_fraction()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.hypercert_id := (SELECT CONCAT(chain_id::text, '-', contract_address, '-', NEW.token_id::text)
                         FROM claims
                                  JOIN contracts ON contracts.id = claims.contracts_id
                         WHERE claims.id = NEW.claims_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hypercert_id_fraction
    BEFORE INSERT OR UPDATE
    ON fractions
    FOR EACH ROW
EXECUTE FUNCTION generate_hypercert_id_fraction();

CREATE OR REPLACE FUNCTION generate_hypercert_id_claim()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.hypercert_id := (SELECT CONCAT(chain_id::text, '-', contract_address, '-', NEW.token_id::text)
                         FROM contracts
                         WHERE id = NEW.contracts_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hypercert_id_claim
    BEFORE INSERT OR UPDATE
    ON claims
    FOR EACH ROW
EXECUTE FUNCTION generate_hypercert_id_claim();

create type transfer_units_type as
(
    claim_id          uuid,
    from_token_id     numeric(78, 0),
    to_token_id       numeric(78, 0),
    block_timestamp   numeric(78, 0),
    units_transferred numeric(78, 0)
);

CREATE OR REPLACE FUNCTION transfer_units_batch(p_transfers transfer_units_type[])
    RETURNS void
    LANGUAGE plpgsql
AS
$$
DECLARE
    transfer         transfer_units_type;
    from_token_units numeric(78, 0);
    to_token_units   numeric(78, 0);
    p_contracts_id   uuid;
BEGIN
    FOR transfer IN SELECT * FROM unnest(p_transfers)
        LOOP
            IF transfer.from_token_id != 0 THEN
                SELECT fractions.units, claims.contracts_id
                INTO from_token_units, p_contracts_id
                FROM fractions
                         JOIN claims ON fractions.claims_id = claims.id
                WHERE fractions.token_id = transfer.from_token_id
                  AND claims_id = transfer.claim_id;

                IF NOT FOUND THEN
                    RAISE 'from_token_id does not exist in fractions table';
                END IF;

                IF from_token_units >= transfer.units_transferred THEN
                    UPDATE fractions
                    SET units                       = units - transfer.units_transferred,
                        last_block_update_timestamp = transfer.block_timestamp
                    WHERE claims_id = transfer.claim_id
                      AND token_id = transfer.from_token_id;
                ELSE
                    RAISE 'Insufficient units in from_token_id';
                END IF;
            END IF;

            -- Try to fetch the current units of to_token_id
            SELECT fractions.units
            INTO to_token_units
            FROM fractions
            WHERE fractions.token_id = transfer.to_token_id
              AND fractions.claims_id = transfer.claim_id;

            -- If to_token_id exists, update its units
            IF FOUND THEN
                UPDATE fractions
                SET units                       = to_token_units + transfer.units_transferred,
                    last_block_update_timestamp = transfer.block_timestamp
                WHERE fractions.claims_id = transfer.claim_id
                  AND fractions.token_id = transfer.to_token_id;
            ELSE
                -- If to_token_id does not exist, create it with the provided amount of units
                INSERT INTO fractions (claims_id, token_id, units, last_block_update_timestamp)
                VALUES (transfer.claim_id, transfer.to_token_id, transfer.units_transferred,
                        transfer.block_timestamp);
            END IF;
        END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION get_missing_metadata_uris()
    RETURNS TABLE
            (
                missing_uri text
            )
AS
$$
DECLARE
    metadata_uris text[];
BEGIN
    -- Fetch the uri values from the metadata table
    SELECT ARRAY_AGG(uri) INTO metadata_uris FROM metadata;

    -- If metadataUris is empty, return all uri values from the hypercert_tokens table
    IF metadata_uris IS NULL THEN
        RETURN QUERY SELECT uri FROM claims;
    ELSE
        -- Fetch the uri values from the hypercert_tokens table that are not in the metadataUris
        RETURN QUERY SELECT uri FROM claims WHERE uri != ALL (metadata_uris);
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE hc_allow_list_root_type AS
(
    contract_id UUID,
    token_id    numeric(78, 0),
    root        TEXT
);

CREATE OR REPLACE FUNCTION store_hypercert_allow_list_roots(p_hc_allow_list_roots hc_allow_list_root_type[])
    RETURNS VOID AS
$$
DECLARE
    input    hc_allow_list_root_type;
    claim_id UUID;
BEGIN
    FOREACH input IN ARRAY p_hc_allow_list_roots
        LOOP
            -- Fetch the hypercert_token_id
            SELECT id
            INTO claim_id

            FROM claims
            WHERE contracts_id = input.contract_id
              AND token_id = input.token_id;

            -- If hypercert_token_id is not found, insert a new one
            IF NOT FOUND THEN
                INSERT INTO claims (contracts_id, token_id)
                VALUES (input.contract_id, input.token_id)
                RETURNING id INTO claim_id;
            END IF;

            -- Insert a new row into hypercert_allow_lists
            INSERT INTO hypercert_allow_lists (claims_id, root)
            VALUES (claim_id, input.root)
            ON CONFLICT (claims_id) DO NOTHING;
        END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_allow_list_uri()
    RETURNS TRIGGER AS
$$
BEGIN
    -- Check if the allow_list_uri is not null or empty
    IF NEW.allow_list_uri IS NOT NULL AND NEW.allow_list_uri != '' THEN
        -- Check if the allow_list_uri already exists in the allow_list_data table
        IF NOT EXISTS (SELECT 1 FROM allow_list_data WHERE uri = NEW.allow_list_uri) THEN
            -- If it doesn't exist, insert it
            INSERT INTO allow_list_data (uri) VALUES (NEW.allow_list_uri);
        END IF;
    END IF;

    -- Return the new row to indicate success
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insert_allow_list_uri_trigger
    BEFORE INSERT OR UPDATE
    ON metadata
    FOR EACH ROW
EXECUTE FUNCTION insert_allow_list_uri();

CREATE TYPE fraction_type AS
(
    claims_id                   UUID,
    token_id                    NUMERIC(78, 0),
    creation_block_timestamp    NUMERIC(78, 0),
    last_block_update_timestamp NUMERIC(78, 0),
    owner_address               TEXT,
    value                       NUMERIC(78, 0)
);

CREATE OR REPLACE FUNCTION store_fraction(
    _fractions fraction_type[]
)
    RETURNS VOID
    LANGUAGE plpgsql
AS
$$
DECLARE
    _fraction fraction_type;
BEGIN
    -- Loop over the array to store each record
    FOR _fraction IN SELECT * FROM unnest(_fractions)
        LOOP
            -- Check if an entry for claims_id and token_id exists in fractions
            IF EXISTS (SELECT 1
                       FROM fractions
                       WHERE claims_id = _fraction.claims_id
                         AND token_id = _fraction.token_id) THEN
                -- If it exists, update last_block_update_timestamp, owner_address, and value
                UPDATE fractions
                SET last_block_update_timestamp = _fraction.last_block_update_timestamp,
                    owner_address               = _fraction.owner_address,
                    value                       = _fraction.value
                WHERE claims_id = _fraction.claims_id
                  AND token_id = _fraction.token_id;
            ELSE
                -- If it does not exist, insert a new row
                INSERT INTO fractions (claims_id, token_id, creation_block_timestamp, last_block_update_timestamp,
                                       owner_address, value)
                VALUES (_fraction.claims_id,
                        _fraction.token_id,
                        _fraction.creation_block_timestamp,
                        _fraction.last_block_update_timestamp,
                        _fraction.owner_address,
                        _fraction.value);
            END IF;
        END LOOP;
END;
$$;

create function claim_attestation_count(claims) returns bigint as $$
select count(*) from attestations where attestations.claims_id = $1.id;
$$ stable language sql;