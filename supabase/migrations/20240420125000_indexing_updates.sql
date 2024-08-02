CREATE OR REPLACE FUNCTION set_claim_id_on_insert()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.claims_id := get_or_create_claim(NEW.chain_id, NEW.contract_address, NEW.token_id, NEW.creation_block_number,
                                         NEW.creation_block_timestamp, NEW.last_update_block_number,
                                         NEW.last_update_block_timestamp);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_claim_id
    BEFORE INSERT
    ON attestations
    FOR EACH ROW
EXECUTE FUNCTION set_claim_id_on_insert();