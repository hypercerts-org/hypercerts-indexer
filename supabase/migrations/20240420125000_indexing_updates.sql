CREATE OR REPLACE FUNCTION check_uri_and_insert_into_metadata()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM metadata WHERE uri = NEW.uri) THEN
        INSERT INTO metadata (uri) VALUES (NEW.uri);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_uri_before_insert
    BEFORE INSERT
    ON claims
    FOR EACH ROW
EXECUTE FUNCTION check_uri_and_insert_into_metadata();

CREATE OR REPLACE FUNCTION get_or_create_claim(p_chain_id numeric, p_contract_address text, p_token_id numeric)
    RETURNS uuid AS
$$
DECLARE
    _claim_id uuid;
BEGIN
    SELECT cl.id
    INTO _claim_id
    FROM claims cl
             JOIN contracts ON cl.contracts_id = contracts.id
    WHERE contracts.chain_id = p_chain_id
      AND contracts.contract_address = p_contract_address
      AND cl.token_id = p_token_id;

    IF _claim_id IS NULL THEN
        INSERT INTO contracts (chain_id, contract_address)
        VALUES (p_chain_id, p_contract_address)
        ON CONFLICT (chain_id, contract_address) DO NOTHING;

        INSERT INTO claims (contracts_id, token_id)
        SELECT c.id, p_token_id
        FROM contracts c
        WHERE c.chain_id = p_chain_id
          AND c.contract_address = p_contract_address
        ON CONFLICT (contracts_id, token_id) DO NOTHING
        RETURNING id INTO _claim_id;
    END IF;

    RETURN _claim_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_claim_id_on_insert()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.claims_id := get_or_create_claim(NEW.chain_id, NEW.contract_address, NEW.token_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_claim_id
    BEFORE INSERT
    ON attestations
    FOR EACH ROW
EXECUTE FUNCTION set_claim_id_on_insert();

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
        RETURN QUERY SELECT uri FROM metadata WHERE metadata.parsed = FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_unparsed_hypercert_allow_lists()
    RETURNS TABLE
            (
                claim_id   uuid,
                al_data_id uuid,
                data       jsonb
            )
    LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT c.id AS claim_id, ad.id AS al_data_id, ad.data AS data
        FROM claims c
                 INNER JOIN metadata m ON c.uri = m.uri
                 INNER JOIN allow_list_data ad ON ad.uri = m.allow_list_uri
        WHERE m.allow_list_uri IS NOT NULL
          AND ad.parsed = true
          AND NOT EXISTS (SELECT 1
                          FROM hypercert_allow_lists
                          WHERE claims_id = c.id
                            AND allow_list_data_id = ad.id);
END;
$$;

CREATE OR REPLACE FUNCTION store_allow_list_records(
    _claims_id UUID,
    _allow_list_data_id UUID,
    _records JSON[]
)
    RETURNS VOID
    LANGUAGE plpgsql
AS
$$
DECLARE
    _hypercert_allow_lists_id UUID;
    _record                   JSON;
BEGIN
    -- Check if an entry for claims_id and allow_list_data_id exists in hypercert_allow_lists
    SELECT id
    INTO _hypercert_allow_lists_id
    FROM hypercert_allow_lists
    WHERE claims_id = _claims_id
      AND allow_list_data_id = _allow_list_data_id;

    -- If not, create one
    IF _hypercert_allow_lists_id IS NULL THEN
        INSERT INTO hypercert_allow_lists (claims_id, allow_list_data_id, parsed)
        VALUES (_claims_id, _allow_list_data_id, false)
        RETURNING id INTO _hypercert_allow_lists_id;
    END IF;

    -- Loop over the array to store each record
    FOR _record IN SELECT * FROM unnest(_records)
        LOOP
            INSERT INTO hypercert_allow_list_records (hypercert_allow_lists_id, user_address, units, entry)
            VALUES (_hypercert_allow_lists_id, (_record ->> 'user_address')::text, (_record ->> 'units')::numeric,
                    (_record ->> 'entry')::numeric);
        END LOOP;

    -- Set hypercert_allow_lists.parsed to true
    UPDATE hypercert_allow_lists
    SET parsed = true
    WHERE id = _hypercert_allow_lists_id;
END;
$$

