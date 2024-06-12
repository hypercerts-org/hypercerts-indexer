CREATE OR REPLACE FUNCTION transfer_units_batch(p_transfers transfer_units_type[])
    RETURNS void
    LANGUAGE plpgsql
AS
$$
DECLARE
    transfer   transfer_units_type;
    from_token fractions%ROWTYPE;
    to_token   fractions%ROWTYPE;
BEGIN
    FOR transfer IN SELECT * FROM unnest(p_transfers)
        LOOP

            -- get or create from_token
            IF EXISTS (SELECT 1
                       FROM fractions
                       WHERE fractions.token_id = transfer.from_token_id
                         AND fractions.claims_id = transfer.claim_id) THEN
                SELECT *
                INTO from_token
                FROM fractions
                WHERE fractions.token_id = transfer.from_token_id
                  AND fractions.claims_id = transfer.claim_id
                    FOR UPDATE;
            ELSE
                INSERT INTO fractions (claims_id, token_id, creation_block_timestamp,
                                       last_block_update_timestamp)
                VALUES (transfer.claim_id, transfer.from_token_id,
                        transfer.block_timestamp,
                        transfer.block_timestamp);
                SELECT *
                INTO from_token
                FROM fractions
                WHERE fractions.token_id = transfer.from_token_id
                  AND fractions.claims_id = transfer.claim_id
                    FOR UPDATE;
            END IF;

            -- get or create to_token
            IF EXISTS (SELECT 1
                       FROM fractions
                       WHERE fractions.token_id = transfer.to_token_id
                         AND fractions.claims_id = transfer.claim_id) THEN
                SELECT *
                INTO to_token
                FROM fractions
                WHERE fractions.token_id = transfer.to_token_id
                  AND fractions.claims_id = transfer.claim_id
                    FOR UPDATE;
            ELSE
                INSERT INTO fractions (claims_id, token_id, creation_block_timestamp,
                                       last_block_update_timestamp)
                VALUES (transfer.claim_id, transfer.to_token_id,
                        transfer.block_timestamp,
                        transfer.block_timestamp);
                SELECT *
                INTO to_token
                FROM fractions
                WHERE fractions.token_id = transfer.to_token_id
                  AND fractions.claims_id = transfer.claim_id
                    FOR UPDATE;
            END IF;

            -- update from_token; unless it's token_id 0, in which case it's a mint
            IF transfer.from_token_id != 0 THEN
                IF COALESCE(from_token.units, 0) - transfer.units_transferred < 0 THEN
                    RAISE EXCEPTION 'Insufficient units in from_token_id %', transfer.from_token_id;
                END IF;
                UPDATE fractions
                SET units                       = COALESCE(units, 0) - transfer.units_transferred,
                    last_block_update_timestamp = transfer.block_timestamp
                WHERE fractions.token_id = transfer.from_token_id
                  AND fractions.claims_id = transfer.claim_id;
            END IF;

            -- update to_token; unless it's token_id 0, in which case it's a burn
            IF transfer.to_token_id != 0 AND transfer.from_token_id != 0 THEN
                UPDATE fractions
                SET units                       = units + transfer.units_transferred,
                    last_block_update_timestamp = transfer.block_timestamp
                WHERE fractions.token_id = transfer.to_token_id
                  AND fractions.claims_id = transfer.claim_id;
            END IF;

            -- workaround because COALESCE resulted in double addition
            -- update to_token; unless it's token_id 0, in which case it's a burn
            IF transfer.to_token_id != 0 AND transfer.from_token_id = 0 THEN
                UPDATE fractions
                SET units                       = transfer.units_transferred,
                    last_block_update_timestamp = transfer.block_timestamp
                WHERE fractions.token_id = transfer.to_token_id
                  AND fractions.claims_id = transfer.claim_id;
            END IF;

            -- if we've made it this far, we've successfully updated the tokens
            -- if from_token_id is 0, remove it from the DB
            IF transfer.from_token_id = 0 THEN
                DELETE
                FROM fractions
                WHERE fractions.token_id = transfer.from_token_id
                  AND fractions.claims_id = transfer.claim_id;
            END IF;

            -- if to_token_id is 0, remove it from the DB
            IF transfer.to_token_id = 0 THEN
                DELETE
                FROM fractions
                WHERE fractions.token_id = transfer.to_token_id
                  AND fractions.claims_id = transfer.claim_id;
            END IF;

        END LOOP;
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