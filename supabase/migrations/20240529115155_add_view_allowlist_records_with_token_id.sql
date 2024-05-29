create view hypercert_allow_list_records_with_token_id as
select halr.id, token_id, leaf, entry, user_address, claimed
from claims
         join public.hypercert_allow_lists hal on claims.id = hal.claims_id
         join public.hypercert_allow_list_records halr on hal.id = halr.hypercert_allow_lists_id;