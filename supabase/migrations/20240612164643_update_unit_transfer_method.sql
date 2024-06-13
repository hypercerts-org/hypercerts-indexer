CREATE OR REPLACE FUNCTION transfer_units_batch(p_transfers transfer_units_type[])
    RETURNS void
    LANGUAGE plpgsql
AS
$$
DECLARE
    transfer   transfer_units_type;
    from_token fractions%ROWTYPE;
    to_token   fractions%ROWTYPE;
    row        fractions%ROWTYPE;
BEGIN

    -- Create an intermediate table

    CREATE TEMPORARY TABLE IF NOT EXISTS intermediate_fractions AS TABLE fractions WITH NO DATA;

    -- Add a unique constraint on token_id and claims_id
    ALTER TABLE intermediate_fractions
        ADD CONSTRAINT unique_token_claim UNIQUE (token_id, claims_id);

    -- Parse all the transfers into the intermediate table
    FOR transfer IN SELECT * FROM unnest(p_transfers)
        LOOP
            -- Assert claim_id and token_id in transfer is not null else throw
            IF transfer.claim_id IS NULL OR transfer.from_token_id IS NULL OR transfer.to_token_id IS NULL THEN
                RAISE EXCEPTION 'claim_id % , from_token_id %, to_token_id % cannot be null', transfer.claim_id, transfer.from_token_id, transfer.to_token_id;
            END IF;

            -- Check if a matching record exists in the fractions table
            IF EXISTS (SELECT 1
                       FROM fractions
                       WHERE token_id = transfer.from_token_id
                         AND claims_id = transfer.claim_id) THEN
                SELECT *
                INTO from_token
                FROM fractions
                WHERE token_id = transfer.from_token_id
                  AND claims_id = transfer.claim_id FOR UPDATE;

                -- Insert or update the record in the intermediate_fractions table
                INSERT INTO intermediate_fractions (claims_id, token_id, units, creation_block_timestamp,
                                                    last_block_update_timestamp)
                VALUES (from_token.claims_id, from_token.token_id,
                           -- units could be null, so we need to coalesce it to 0
                        COALESCE(from_token.units, 0),
                        from_token.creation_block_timestamp,
                        from_token.last_block_update_timestamp)
                ON CONFLICT (token_id, claims_id) DO NOTHING;
            END IF;

            -- get or create to_token
            IF EXISTS (SELECT 1
                       FROM fractions
                       WHERE token_id = transfer.to_token_id
                         AND claims_id = transfer.claim_id) THEN
                SELECT *
                INTO to_token
                FROM fractions
                WHERE token_id = transfer.to_token_id
                  AND claims_id = transfer.claim_id FOR UPDATE;

                INSERT INTO intermediate_fractions (claims_id, token_id, units, creation_block_timestamp,
                                                    last_block_update_timestamp)
                VALUES (to_token.claims_id, to_token.token_id, COALESCE(to_token.units, 0),
                        to_token.creation_block_timestamp, to_token.last_block_update_timestamp)
                ON CONFLICT (token_id, claims_id) DO NOTHING;

            ELSE
                INSERT INTO intermediate_fractions (claims_id, token_id, creation_block_timestamp, units,
                                                    last_block_update_timestamp)
                VALUES (transfer.claim_id, transfer.to_token_id, transfer.block_timestamp, 0, transfer.block_timestamp);

                SELECT *
                INTO to_token
                FROM intermediate_fractions
                WHERE token_id = transfer.to_token_id
                  AND claims_id = transfer.claim_id FOR UPDATE;
            END IF;

            -- Update from_token units if tokenId is not 0
            IF transfer.from_token_id != 0 THEN
                INSERT INTO intermediate_fractions (claims_id, token_id, units, last_block_update_timestamp)
                VALUES (transfer.claim_id, transfer.from_token_id,
                        COALESCE(from_token.units, 0) - transfer.units_transferred, transfer.block_timestamp)
                ON CONFLICT (token_id, claims_id)
                    DO UPDATE SET units                       = from_token.units - transfer.units_transferred,
                                  last_block_update_timestamp = transfer.block_timestamp;
            END IF;

            -- Update to_token units if tokenId is not 0
            IF transfer.to_token_id != 0 THEN
                INSERT INTO intermediate_fractions (claims_id, token_id, units, last_block_update_timestamp)
                VALUES (transfer.claim_id, transfer.to_token_id, to_token.units + transfer.units_transferred,
                        transfer.block_timestamp)
                ON CONFLICT (token_id, claims_id)
                    DO UPDATE SET units                       = to_token.units +
                                                                transfer.units_transferred,
                                  last_block_update_timestamp = transfer.block_timestamp;
            END IF;

        END LOOP;

    -- Delete tokens with token_id 0 from intermediate table
    DELETE
    from intermediate_fractions
    WHERE token_id = 0;

    -- TODO handle upsert from intermediate table to fractions table
    INSERT INTO fractions (claims_id, token_id, units, last_block_update_timestamp)
    SELECT claims_id, token_id, units, last_block_update_timestamp
    FROM intermediate_fractions
    ON CONFLICT (token_id, claims_id)
        DO UPDATE SET units                       = EXCLUDED.units,
                      last_block_update_timestamp = EXCLUDED.last_block_update_timestamp;

    -- Drop the intermediate table
    DROP TABLE intermediate_fractions;

END;
$$;

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
            INSERT INTO fractions (claims_id, token_id, value, owner_address, creation_block_timestamp,
                                   last_block_update_timestamp)
            VALUES (transfer.claims_id, transfer.token_id, transfer.value, transfer.to_owner_address,
                    transfer.block_timestamp, transfer.block_timestamp)
            ON CONFLICT (token_id, claims_id)
                DO UPDATE SET claims_id                   = transfer.claims_id,
                              owner_address               = transfer.to_owner_address,
                              creation_block_timestamp    = COALESCE(fractions.creation_block_timestamp,
                                                                     transfer.block_timestamp),
                              last_block_update_timestamp = COALESCE(transfer.block_timestamp,
                                                                     fractions.last_block_update_timestamp),
                              value                       = COALESCE(fractions.value, transfer.value);
        END LOOP;
END;
$$;