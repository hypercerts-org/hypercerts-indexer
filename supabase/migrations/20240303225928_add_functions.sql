CREATE OR REPLACE FUNCTION generate_hypercert_id()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.hypercert_id := (SELECT CONCAT(chain_id::text, '-', contract_address, '-', NEW.token_id::text)
                         FROM contracts
                         WHERE id = NEW.contracts_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hypercert_id
    BEFORE INSERT OR UPDATE
    ON hypercert_tokens
    FOR EACH ROW
EXECUTE FUNCTION generate_hypercert_id();

CREATE OR REPLACE FUNCTION store_claim(
    p_contracts_id uuid,
    p_token_id numeric(78, 0),
    p_block_timestamp numeric(78, 0),
    p_creator text,
    p_type token_type,
    p_units numeric(78, 0),
    p_uri text
)
    RETURNS uuid
    LANGUAGE plpgsql
AS
$$
DECLARE
    hypercert_token_id uuid;
BEGIN
    -- Insert into hypercert_tokens table and store the inserted id in a variable
    WITH ins AS (
        INSERT INTO hypercert_tokens (contracts_id, token_id, creation_block_timestamp,
                                      last_block_update_timestamp, type, units, uri)
            VALUES (p_contracts_id, p_token_id, p_block_timestamp, p_block_timestamp, p_type, p_units, p_uri)
            RETURNING id)
    SELECT id
    INTO hypercert_token_id
    FROM ins;

    -- Return the id of the newly inserted row in the hypercert_metadata table
    RETURN hypercert_token_id;
EXCEPTION
    WHEN others THEN
        RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION upsert_hypercert_token(
    p_contracts_id uuid,
    p_token_id numeric(78, 0),
    p_creation_block_timestamp numeric(78, 0),
    p_last_block_update_timestamp numeric(78, 0),
    p_owner_address text,
    p_value numeric(78, 0),
    p_type token_type
)
    RETURNS void
    LANGUAGE plpgsql
AS
$$
BEGIN
    -- Try to update the record
    UPDATE hypercert_tokens
    SET creation_block_timestamp    = p_creation_block_timestamp,
        last_block_update_timestamp = p_last_block_update_timestamp,
        owner_address               = p_owner_address,
        value                       = COALESCE(value, 0) + p_value, -- add p_value to the existing value
        type                        = p_type
    WHERE contracts_id = p_contracts_id
      AND token_id = p_token_id;

    -- If no record was updated, insert a new one
    IF NOT FOUND THEN
        INSERT INTO hypercert_tokens (contracts_id, token_id, creation_block_timestamp,
                                      last_block_update_timestamp, owner_address, value, type)
        VALUES (p_contracts_id, p_token_id, p_creation_block_timestamp,
                p_last_block_update_timestamp, p_owner_address, p_value, p_type);
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION update_owner_address(p_contracts_id uuid, p_token_id numeric(78, 0), p_owner_address text,
                                                p_last_block_update_timestamp numeric(78, 0))
    RETURNS void
    LANGUAGE plpgsql
AS
$$
BEGIN
    UPDATE hypercert_tokens
    SET owner_address               = p_owner_address,
        last_block_update_timestamp = p_last_block_update_timestamp
    WHERE contracts_id = p_contracts_id
      AND token_id = p_token_id;
END;
$$;

CREATE OR REPLACE FUNCTION transfer_units(
    p_contracts_id uuid,
    p_from_token_id numeric(78, 0),
    p_to_token_id numeric(78, 0),
    p_block_timestamp numeric(78, 0),
    p_units_transferred numeric(78, 0)
)
    RETURNS void
    LANGUAGE plpgsql
AS
$$
DECLARE
    from_token_units numeric(78, 0);
    to_token_units   numeric(78, 0);
BEGIN
    IF p_from_token_id != 0 THEN
        -- Get the current units of from_token_id
        SELECT units
        INTO from_token_units
        FROM hypercert_tokens
        WHERE contracts_id = p_contracts_id
          AND token_id = p_from_token_id;

        -- If from_token_id does not exist, raise an exception
        IF NOT FOUND THEN
            RAISE 'from_token_id does not exist in hypercert_tokens table';
        END IF;
    END IF;

    -- Get the current units of to_token_id
    SELECT units
    INTO to_token_units
    FROM hypercert_tokens
    WHERE contracts_id = p_contracts_id
      AND token_id = p_to_token_id;

    -- If to_token_id does not exist, raise an exception
    IF NOT FOUND THEN
        RAISE 'to_token_id does not exist in hypercert_tokens table';
    END IF;

    -- If from_token_id is not 0 and has enough units, subtract units
    IF p_from_token_id != 0 THEN
        IF from_token_units >= p_units_transferred THEN
            UPDATE hypercert_tokens
            SET units                       = units - p_units_transferred,
                last_block_update_timestamp = p_block_timestamp
            WHERE contracts_id = p_contracts_id
              AND token_id = p_from_token_id;
        ELSE
            RAISE 'Insufficient units in from_token_id';
        END IF;
    END IF;


    -- If to_token_id does not exist, create it
    INSERT INTO hypercert_tokens (contracts_id, token_id, last_block_update_timestamp)
    VALUES (p_contracts_id, p_to_token_id, p_block_timestamp)
    ON CONFLICT (contracts_id, token_id) DO NOTHING;

    -- Add units to to_token_id
    UPDATE hypercert_tokens
    SET units                       = COALESCE(to_token_units, 0) + p_units_transferred,
        last_block_update_timestamp = p_block_timestamp
    WHERE contracts_id = p_contracts_id
      AND token_id = p_to_token_id;

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
        RETURN QUERY SELECT uri FROM hypercert_tokens;
    ELSE
        -- Fetch the uri values from the hypercert_tokens table that are not in the metadataUris
        RETURN QUERY SELECT uri FROM hypercert_tokens WHERE uri != ALL (metadata_uris);
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
                 JOIN hypercert_tokens t ON h.hypercert_tokens_id = t.id
                 JOIN metadata m ON t.uri = m.uri
                 JOIN allow_list_data a ON h.allow_list_id = a.id
        WHERE m.allow_list_uri IS NOT NULL
          AND a.uri IS NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION store_allow_list_data_and_hypercert_allow_list(p_contract_id UUID, p_token_id numeric(78, 0), p_root TEXT)
    RETURNS VOID AS
$$
DECLARE
    hypercert_token_id UUID;
    new_allow_list_id  UUID;
BEGIN
    -- Fetch the hypercert_token_id
    SELECT id
    INTO hypercert_token_id
    FROM hypercert_tokens
    WHERE contracts_id = p_contract_id
      AND token_id = p_token_id;

    -- If hypercert_token_id is not found, insert a new one
    IF NOT FOUND THEN
        INSERT INTO hypercert_tokens (contracts_id, token_id)
        VALUES (p_contract_id, p_token_id)
        RETURNING id INTO hypercert_token_id;
    END IF;

    -- Insert a new row into allow_list_data and get the id
    INSERT INTO allow_list_data (root) VALUES (p_root) RETURNING id INTO new_allow_list_id;

    -- Insert a new row into hypercert_allow_lists
    INSERT INTO hypercert_allow_lists (hypercert_tokens_id, allow_list_id)
    VALUES (hypercert_token_id, new_allow_list_id);
END;
$$ LANGUAGE plpgsql;