create or replace view "public"."claimable_fractions_with_proofs" as
SELECT halr.id,
       halr.hypercert_allow_lists_id,
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
from claims
         join public.hypercert_allow_lists hal on claims.id = hal.claims_id
         join public.hypercert_allow_list_records halr on hal.id = halr.hypercert_allow_lists_id
         join public.allow_list_data ald on ald.uri = hal.allow_list_data_uri;;