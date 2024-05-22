CREATE OR REPLACE FUNCTION check_uri_and_insert_into_metadata()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.uri IS NOT NULL AND NOT EXISTS (SELECT 1 FROM metadata WHERE uri = NEW.uri) THEN
        INSERT INTO metadata (uri) VALUES (NEW.uri);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION transfer_units_batch(p_transfers transfer_units_type[])
    RETURNS void
    LANGUAGE plpgsql
AS
$$
DECLARE
    transfer   transfer_units_type;
    from_token fractions%ROWTYPE;
BEGIN
    FOR transfer IN SELECT * FROM unnest(p_transfers)
        LOOP
            -- handle from token state change
            IF transfer.from_token_id != 0 THEN
                IF EXISTS (SELECT 1
                           FROM fractions
                           WHERE fractions.token_id = transfer.from_token_id
                             AND fractions.claims_id = transfer.claim_id) THEN
                    -- If from_token_id exists, update its units, when units would be less than 0, throw an error
                    SELECT *
                    INTO from_token
                    FROM fractions
                    WHERE fractions.token_id = transfer.from_token_id
                      AND fractions.claims_id = transfer.claim_id
                        FOR UPDATE;

                    IF from_token.units - transfer.units_transferred < 0 THEN
                        RAISE EXCEPTION 'Insufficient units in from_token_id %', transfer.from_token_id;
                    END IF;

                    UPDATE from_token
                    SET units                       = units - transfer.units_transferred,
                        last_block_update_timestamp = transfer.block_timestamp
                    WHERE fractions.token_id = transfer.to_token_id
                      AND fractions.claims_id = transfer.claim_id;
                ELSE
                    -- If to_token_id does not exist, create it but do not update its units
                    INSERT INTO fractions (claims_id, token_id, creation_block_timestamp,
                                           last_block_update_timestamp)
                    VALUES (transfer.claim_id, transfer.to_token_id,
                            transfer.block_timestamp,
                            transfer.block_timestamp);
                END IF;
            END IF;

            -- handle to token state change
            IF EXISTS (SELECT 1
                       FROM fractions
                       WHERE fractions.token_id = transfer.to_token_id
                         AND fractions.claims_id = transfer.claim_id) THEN
                -- If to_token_id exists, update its units
                UPDATE fractions
                SET units                       = units + transfer.units_transferred,
                    last_block_update_timestamp = transfer.block_timestamp
                WHERE fractions.token_id = transfer.to_token_id
                  AND fractions.claims_id = transfer.claim_id;
            ELSE
                -- If to_token_id does not exist, create it with the provided amount of units
                INSERT INTO fractions (claims_id, token_id, units, creation_block_timestamp,
                                       last_block_update_timestamp)
                VALUES (transfer.claim_id, transfer.to_token_id, transfer.units_transferred, transfer.block_timestamp,
                        transfer.block_timestamp);
            END IF;
        END LOOP;
END;
$$;

create type transfer_fractions_type as
(
    claims_id          uuid,
    token_id           numeric(78, 0),
    from_owner_address text,
    to_owner_address   text,
    block_timestamp    numeric(78, 0),
    value              numeric(78, 0)
);

CREATE OR REPLACE FUNCTION transfer_fractions_batch(p_transfers transfer_fractions_type[])
    RETURNS void
    LANGUAGE plpgsql
AS
$$
DECLARE
    transfer transfer_fractions_type;
BEGIN
    FOR transfer IN SELECT * FROM unnest(p_transfers)
        LOOP
            IF EXISTS (SELECT 1
                       FROM fractions
                       WHERE fractions.token_id = transfer.token_id
                         AND fractions.claims_id = transfer.claims_id) THEN
                -- If to_token_id exists, update its units
                UPDATE fractions
                SET claims_id                   = transfer.claims_id,
                    owner_address               = transfer.to_owner_address,
                    creation_block_timestamp    = COALESCE(creation_block_timestamp, transfer.block_timestamp),
                    last_block_update_timestamp = COALESCE(transfer.block_timestamp, last_block_update_timestamp),
                    value                       = COALESCE(value, transfer.value)
                WHERE fractions.token_id = transfer.token_id
                  AND fractions.claims_id = transfer.claims_id;
            ELSE
                -- If to_token_id does not exist, create it with the provided amount of units
                INSERT INTO fractions (claims_id, token_id, value, owner_address, creation_block_timestamp,
                                       last_block_update_timestamp)
                VALUES (transfer.claims_id, transfer.token_id, transfer.value, transfer.to_owner_address,
                        transfer.block_timestamp,
                        transfer.block_timestamp);
            END IF;
        END LOOP;
END;
$$;