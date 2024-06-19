create view claimable_fractions_with_proofs as
select halr.id,
       token_id,
       leaf,
       entry,
       user_address,
       claimed,
       proof,
       ald.root,
       halr.units,
       claims.hypercert_id,
       claims.units as total_units
from claims
         join public.hypercert_allow_lists hal on claims.id = hal.claims_id
         join public.hypercert_allow_list_records halr on hal.id = halr.hypercert_allow_lists_id
         join public.allow_list_data ald on ald.id = hal.allow_list_data_id;