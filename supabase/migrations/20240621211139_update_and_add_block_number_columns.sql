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
       claims.units AS total_units,
       hal.id as hypercert_allow_lists_id
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

DROP FUNCTION transfer_fractions_batch(p_transfers transfer_fractions_type[]);
DROP FUNCTION transfer_units_batch(p_transfers transfer_units_type[]);

DROP TYPE transfer_fractions_type;
DROP TYPE transfer_units_type;




