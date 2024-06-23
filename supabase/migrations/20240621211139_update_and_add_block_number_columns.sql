drop view if exists "public"."claimable_fractions_with_proofs";

drop view if exists "public"."hypercert_allow_list_records_with_token_id";

drop view if exists "public"."hypercert_allowlists_with_claim";

create or replace view "public"."claimable_fractions_with_proofs" as
SELECT halr.id,
       claims.token_id,
       halr.leaf,
       halr.entry,
       halr.user_address,
       halr.claimed,
       halr.proof,
       ald.root,
       halr.units,
       claims.hypercert_id,
       claims.units AS total_units
FROM (((claims
    JOIN hypercert_allow_lists hal ON ((claims.id = hal.claims_id)))
    JOIN hypercert_allow_list_records halr ON ((hal.id = halr.hypercert_allow_lists_id)))
    JOIN allow_list_data ald ON ((ald.id = hal.allow_list_data_id)));


create or replace view "public"."hypercert_allowlists_with_claim" as
SELECT hal.id AS hypercert_allow_list_id,
       c.id   AS claim_id,
       c.hypercert_id,
       c.creation_block_number
FROM (hypercert_allow_lists hal
    JOIN claims c ON ((c.id = hal.claims_id)));

alter type transfer_units_type
    add attribute block_number numeric(78, 0);

alter type transfer_fractions_type
    add attribute block_number numeric(78, 0);

CREATE OR REPLACE FUNCTION transfer_units_batch(p_transfers transfer_units_type[])
    RETURNS void
    LANGUAGE plpgsql
AS
$$
DECLARE
    transfer transfer_units_type;
    row      fractions%ROWTYPE;
BEGIN

    -- Create an intermediate table

    CREATE TEMPORARY TABLE IF NOT EXISTS intermediate_fractions AS TABLE fractions WITH NO DATA;

    -- Add a unique constraint on token_id and claims_id
    ALTER TABLE intermediate_fractions
        ADD CONSTRAINT unique_token_claim UNIQUE (token_id, claims_id);

    -- Parse all the transfers into the intermediate table
    FOR transfer IN SELECT * FROM unnest(p_transfers)
        LOOP

            DECLARE
                from_token fractions%ROWTYPE := NULL;
                to_token   fractions%ROWTYPE := NULL;
            BEGIN
                -- HANDLE FROM TOKEN
                -- Check if a matching record exists in the fractions table
                IF transfer.from_token_id > 0 THEN
                    -- if token doesn't exist in fractions insert into intermediate_fractions table and select as from_token
                    IF EXISTS (SELECT 1
                               FROM fractions
                               WHERE token_id = transfer.from_token_id
                                 AND claims_id = transfer.claim_id) THEN
                        -- TODO fix double parsing of transfer.unit_transferred
                        -- if token exists in fractions select as from_token and insert into intermediate_fractions table
                        -- select existing record as from_token
                        SELECT *
                        INTO from_token
                        FROM fractions
                        WHERE token_id = transfer.from_token_id
                          AND claims_id = transfer.claim_id FOR UPDATE;

                        -- Insert from_token in the intermediate_fractions table
                        INSERT INTO intermediate_fractions (claims_id, token_id, units, creation_block_timestamp,
                                                            last_update_block_timestamp, creation_block_number,
                                                            last_update_block_number)
                        VALUES (from_token.claims_id, from_token.token_id,
                                from_token.units,
                                from_token.creation_block_timestamp,
                                transfer.block_timestamp, from_token.creation_block_number,
                                transfer.block_number)
                        ON CONFLICT (token_id, claims_id) DO NOTHING;
                    END IF;

                    IF NOT EXISTS (SELECT 1
                                   FROM fractions
                                   WHERE token_id = transfer.from_token_id
                                     AND claims_id = transfer.claim_id) THEN
                        -- if to_token doesn't exist in fractions insert and select as from_token
                        -- insert into intermediate_fractions table
                        INSERT INTO intermediate_fractions (claims_id, token_id, creation_block_timestamp, units,
                                                            last_update_block_timestamp, creation_block_number,
                                                            last_update_block_number)
                        -- units is 0 because this is a new entry
                        VALUES (transfer.claim_id, transfer.from_token_id, transfer.block_timestamp, 0,
                                transfer.block_timestamp, transfer.block_number, transfer.block_number)
                        ON CONFLICT (token_id, claims_id) DO NOTHING;

                        -- select as from_token
                        SELECT *
                        INTO from_token
                        FROM intermediate_fractions
                        WHERE token_id = transfer.from_token_id
                          AND claims_id = transfer.claim_id FOR UPDATE;
                    END IF;

                    IF from_token IS NULL
                    THEN
                        RAISE EXCEPTION 'from_token is null';
                    END IF;
                END IF;

                -- HANDLE TO TOKEN
                -- Check if a matching record exists in the fractions table
                IF transfer.to_token_id != 0 THEN
                    -- if token doesn't exist in fractions insert into intermediate_fractions table and select as to_token
                    IF EXISTS (SELECT 1
                               FROM fractions
                               WHERE token_id = transfer.to_token_id
                                 AND claims_id = transfer.claim_id) THEN
                        -- if token exists in fractions select as to_token and insert into intermediate_fractions table
                        -- select existing record as from_token
                        SELECT *
                        INTO to_token
                        FROM fractions
                        WHERE token_id = transfer.to_token_id
                          AND claims_id = transfer.claim_id FOR UPDATE;

                        -- Insert from_token in the intermediate_fractions table
                        INSERT INTO intermediate_fractions (claims_id, token_id, units, creation_block_timestamp,
                                                            last_update_block_timestamp, creation_block_number,
                                                            last_update_block_number)
                        VALUES (to_token.claims_id, to_token.token_id,
                                to_token.units,
                                to_token.creation_block_timestamp,
                                transfer.block_timestamp,
                                to_token.creation_block_number,
                                transfer.block_number)
                        ON CONFLICT (token_id, claims_id) DO NOTHING;
                    END IF;

                    IF NOT EXISTS (SELECT 1
                                   FROM fractions
                                   WHERE token_id = transfer.to_token_id
                                     AND claims_id = transfer.claim_id) THEN
                        -- if to_token doesn't exist in fractions insert and select as to_token
                        -- insert into intermediate_fractions table
                        INSERT INTO intermediate_fractions (claims_id, token_id, creation_block_timestamp,
                                                            last_update_block_timestamp, creation_block_number,
                                                            last_update_block_number)
                        VALUES (transfer.claim_id, transfer.to_token_id, transfer.block_timestamp,
                                transfer.block_timestamp, transfer.block_number, transfer.block_number)
                        ON CONFLICT (token_id, claims_id) DO NOTHING;

                        -- select as from_token
                        SELECT *
                        INTO to_token
                        FROM intermediate_fractions
                        WHERE token_id = transfer.to_token_id
                          AND claims_id = transfer.claim_id FOR UPDATE;
                    END IF;

                    IF to_token IS NULL
                    THEN
                        RAISE EXCEPTION 'to_token is null';
                    END IF;
                END IF;

                -- Update units for from token in intermediate_fractions table if from_token_id is not 0
                IF from_token.token_id > 0 THEN
                    -- update units of from_token
                    UPDATE intermediate_fractions
                    SET units = COALESCE(from_token.units, 0) - transfer.units_transferred
                    WHERE token_id = transfer.from_token_id
                      AND claims_id = transfer.claim_id;
                END IF;

                -- Update units for to token in intermediate_fractions table if to_token_id is not 0
                IF to_token.token_id > 0 THEN
                    -- sum units of to_token if not null
                    IF (to_token.units IS NOT NULL) THEN
                        UPDATE intermediate_fractions
                        SET units = units + transfer.units_transferred
                        WHERE token_id = transfer.to_token_id
                          AND claims_id = transfer.claim_id;
                    END IF;

                    -- declare units of to_token if null
                    IF (to_token.units IS NULL) THEN
                        -- update units of to_token
                        UPDATE intermediate_fractions
                        SET units = transfer.units_transferred
                        WHERE token_id = transfer.to_token_id
                          AND claims_id = transfer.claim_id;
                    END IF;
                END IF;
            END;
        END LOOP;

    -- if any row in intermediate_fractions has units < 0, then throw exception
    FOR row IN SELECT * FROM intermediate_fractions
        LOOP
            IF row.units IS NULL THEN
                RAISE EXCEPTION 'units cannot be less null: %', row;
            END IF;
            INSERT INTO fractions (claims_id, token_id, units, creation_block_timestamp, last_update_block_timestamp,
                                   creation_block_number, last_update_block_number)
            VALUES (row.claims_id, row.token_id, row.units, row.creation_block_timestamp,
                    row.last_update_block_timestamp, row.creation_block_number, row.last_update_block_number)
            ON CONFLICT (token_id, claims_id)
                DO UPDATE SET units                       = row.units,
                              creation_block_number       = COALESCE(fractions.creation_block_number, row.creation_block_number),
                              creation_block_timestamp    = COALESCE(fractions.creation_block_timestamp,
                                                                     row.creation_block_timestamp),
                              last_update_block_timestamp = COALESCE(row.creation_block_timestamp,
                                                                     fractions.last_update_block_timestamp),
                              last_update_block_number    = COALESCE(row.last_update_block_number, fractions.last_update_block_number),
                              value                       = COALESCE(fractions.value, row.value);
        END LOOP;

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
                                   last_update_block_timestamp, creation_block_number, last_update_block_number)
            VALUES (transfer.claims_id, transfer.token_id, transfer.value, transfer.to_owner_address,
                    transfer.block_timestamp, transfer.block_timestamp, transfer.block_number, transfer.block_number)
            ON CONFLICT (token_id, claims_id)
                DO UPDATE SET owner_address               = transfer.to_owner_address,
                              creation_block_number       = COALESCE(fractions.creation_block_number, transfer.block_number),
                              creation_block_timestamp    = COALESCE(fractions.creation_block_timestamp,
                                                                     transfer.block_timestamp),
                              last_update_block_timestamp = COALESCE(transfer.block_timestamp,
                                                                     fractions.last_update_block_timestamp),
                              last_update_block_number    = COALESCE(transfer.block_number, fractions.last_update_block_number),
                              value                       = COALESCE(fractions.value, transfer.value);
        END LOOP;
END;
$$;




