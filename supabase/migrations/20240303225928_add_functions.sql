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
    FOREACH transfer IN ARRAY p_transfers
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
                VALUES (transfer.claim_id, transfer.to_token_id, COALESCE(transfer.units_transferred, 0),
                        transfer.block_timestamp);
            END IF;
        END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION search_contract_events(p_chain numeric, p_event text)
    RETURNS TABLE
            (
                id                 uuid,
                contract_id        uuid,
                contract_address   text,
                start_block        numeric(78, 0),
                event_name         text,
                event_abi          text,
                last_block_indexed numeric(78, 0)
            )
    LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT contract_events.id,
               contract_events.contract_id,
               contracts.contract_address,
               contracts.start_block,
               events.name,
               events.abi,
               contract_events.last_block_indexed
        FROM contract_events
                 INNER JOIN contracts ON contract_events.contract_id = contracts.id
                 INNER JOIN events ON contract_events.event_id = events.id
        WHERE contracts.chain_id = p_chain
          AND events.name = p_event;
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

CREATE OR REPLACE FUNCTION find_missing_allow_list_uris_and_roots()
    RETURNS TABLE
            (
                allow_list_id   uuid,
                allow_list_uri  text,
                allow_list_root text
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT a.id, m.allow_list_uri, a.root
        FROM hypercert_allow_lists h
                 JOIN claims c ON h.claims_id = c.id
                 JOIN metadata m ON c.uri = m.uri
                 JOIN allow_list_data a ON h.allow_list_data_id = a.id
        WHERE m.allow_list_uri IS NOT NULL
          AND a.uri IS NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE allow_list_data_type AS
(
    contract_id UUID,
    token_id    numeric(78, 0),
    root        TEXT
);

CREATE OR REPLACE FUNCTION store_allow_list_data_and_hypercert_allow_list_batch(p_allow_list_data allow_list_data_type[])
    RETURNS VOID AS
$$
DECLARE
    input             allow_list_data_type;
    claim_id          UUID;
    new_allow_list_id UUID;
BEGIN
    FOREACH input IN ARRAY p_allow_list_data
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

            -- Try to insert a new row into allow_list_data
            WITH ins AS (
                INSERT INTO allow_list_data (root)
                    VALUES (input.root)
                    ON CONFLICT (root) DO NOTHING
                    RETURNING id)

            -- If insertion was successful, get the new ID
            SELECT id
            FROM ins
            UNION ALL
            -- If insertion failed due to conflict, get the existing ID
            SELECT id
            FROM allow_list_data
            WHERE root = input.root
            LIMIT 1
            INTO new_allow_list_id;

            -- Insert a new row into hypercert_allow_lists
            INSERT INTO hypercert_allow_lists (claims_id, allow_list_data_id)
            VALUES (claim_id, new_allow_list_id)
            ON CONFLICT (claims_id, allow_list_data_id) DO NOTHING;
        END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_allow_list_data_parsed()
    RETURNS TRIGGER AS
$$
BEGIN
    -- Update the parsed column in the allow_list_data table
    UPDATE hypercert_allow_lists
    SET parsed = TRUE
    WHERE id = NEW.hc_allow_list_id;

    -- Return the new row to indicate success
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parsed
    AFTER INSERT OR UPDATE
    ON allow_list_records
    FOR EACH ROW
EXECUTE FUNCTION update_allow_list_data_parsed();
