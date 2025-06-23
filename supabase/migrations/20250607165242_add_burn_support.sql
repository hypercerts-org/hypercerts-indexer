alter table "public"."fractions" add column "burned" boolean not null default false;

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
       f.units,
       f.burned
from fractions f
         join public.claims c on f.claims_id = c.id;

create or replace view claims_view as
select
	c.id as id,
	c.contracts_id as contracts_id,
	c.token_id as token_id,
	c.hypercert_id as hypercert_id,
	c.owner_address as owner_address,
	c.creator_address as creator_address,
	c.value as value,
	c.units as units,
	c.uri as uri,
	c.creation_block_number as creation_block_number,
	c.creation_block_timestamp as creation_block_timestamp,
	c.last_update_block_number as last_update_block_number,
	c.last_update_block_timestamp as last_update_block_timestamp,
	c.attestations_count as attestations_count,
	c.sales_count as sales_count,
	f.burned as burned
from
	claims as c
join (
	select
		f.claims_id,
		bool_and(f.burned) as burned
	from
		fractions f
	group by
		f.claims_id
) f on
	c.id = f.claims_id