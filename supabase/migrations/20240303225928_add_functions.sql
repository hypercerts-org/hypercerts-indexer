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

create function claim_attestation_count(claims) returns bigint as
$$
select count(*)
from attestations
where attestations.claims_id = $1.id;
$$ stable language sql;