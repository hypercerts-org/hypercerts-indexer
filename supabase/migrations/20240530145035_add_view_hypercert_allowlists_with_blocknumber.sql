create or replace view "public"."hypercert_allowlists_with_claim" as
SELECT hal.id AS hypercert_allow_list_id,
       c.id   AS claim_id,
       c.hypercert_id,
       c.creation_block_number
FROM (hypercert_allow_lists hal
    JOIN claims c ON ((c.id = hal.claims_id)));