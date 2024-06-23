alter table fractions
    rename column hypercert_id to fraction_id;

CREATE OR REPLACE FUNCTION generate_hypercert_id_fraction()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.fraction_id := (SELECT CONCAT(chain_id::text, '-', contract_address, '-', NEW.token_id::text)
                        FROM claims
                                 JOIN contracts ON contracts.id = claims.contracts_id
                        WHERE claims.id = NEW.claims_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create view fractions_view as
select f.id,
       f.claims_id,
       f.token_id,
       f.fraction_id,
       c.hypercert_id,
       f.creation_block_timestamp,
       f.creation_block_number,
       f.last_update_block_number,
       f.last_update_block_timestamp,
       f.owner_address,
       f.value,
       f.units
from fractions f
         join public.claims c on f.claims_id = c.id;