create or replace view "public"."hypercert_allow_list_records_with_token_id" as
SELECT halr.id,
       claims.token_id,
       halr.leaf,
       halr.entry,
       halr.user_address,
       halr.claimed
FROM ((claims
    JOIN hypercert_allow_lists hal ON ((claims.id = hal.claims_id)))
    JOIN hypercert_allow_list_records halr ON ((hal.id = halr.hypercert_allow_lists_id)));
