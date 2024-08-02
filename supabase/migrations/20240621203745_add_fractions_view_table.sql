create or replace view fractions_view as
select f.id,
       f.claims_id,
       f.token_id,
       f.fraction_id,
       c.hypercert_id,
       f.creation_block_timestamp,
       f.creation_block_number,
       f.last_update_block_timestamp,
       f.last_update_block_number,
       f.owner_address,
       f.value,
       f.units
from fractions f
         join public.claims c on f.claims_id = c.id;