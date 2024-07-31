CREATE OR REPLACE FUNCTION get_or_create_claim(p_chain_id numeric, p_contract_address text, p_token_id numeric,
                                               p_creation_block_number numeric, p_creation_block_timestamp numeric,
                                               p_last_update_block_number numeric,
                                               p_last_update_block_timestamp numeric)
    RETURNS uuid AS
$$
DECLARE
    _claim_id uuid;
BEGIN
    SELECT cl.id
    INTO _claim_id
    FROM claims cl
             JOIN contracts ON cl.contracts_id = contracts.id
    WHERE contracts.chain_id = p_chain_id
      AND contracts.contract_address = p_contract_address
      AND cl.token_id = p_token_id;

    IF _claim_id IS NULL THEN
        INSERT INTO claims (contracts_id, token_id, creation_block_number, creation_block_timestamp,
                            last_update_block_number, last_update_block_timestamp)
        SELECT c.id,
               p_token_id,
               p_creation_block_number,
               p_creation_block_timestamp,
               p_last_update_block_number,
               p_last_update_block_timestamp
        FROM contracts c
        WHERE c.chain_id = p_chain_id
          AND c.contract_address = p_contract_address
        ON CONFLICT (contracts_id, token_id) DO UPDATE SET last_update_block_number = p_last_update_block_number
        WHERE FALSE
        RETURNING id INTO _claim_id;
    END IF;

    RETURN _claim_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_or_create_hypercert_allow_list(p_claim_id uuid, p_allow_list_data_uri text)
    RETURNS uuid AS
$$
DECLARE
    _hypercert_allow_list_id uuid;
BEGIN
    SELECT hal.id
    INTO _hypercert_allow_list_id
    FROM hypercert_allow_lists hal
    WHERE hal.claims_id = p_claim_id
      AND hal.allow_list_data_uri = p_allow_list_data_uri;

    IF _hypercert_allow_list_id IS NULL THEN
        INSERT INTO hypercert_allow_lists (claims_id, allow_list_data_uri)
        VALUES (p_claim_id, p_allow_list_data_uri)
        RETURNING id INTO _hypercert_allow_list_id;
    END IF;

    RETURN _hypercert_allow_list_id;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER update_hypercert_id_fraction
    BEFORE INSERT OR UPDATE
    ON fractions
    FOR EACH ROW
EXECUTE FUNCTION generate_hypercert_id_fraction();

CREATE OR REPLACE FUNCTION generate_hypercert_id_claim()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.hypercert_id := (SELECT CONCAT(chain_id::text, '-', contract_address, '-', NEW.token_id::text)
                         FROM contracts
                         WHERE id = NEW.contracts_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hypercert_id_claim
    BEFORE INSERT OR UPDATE
    ON claims
    FOR EACH ROW
EXECUTE FUNCTION generate_hypercert_id_claim();

create function claim_attestation_count(claims) returns bigint as
$$
select count(*)
from attestations
where attestations.claims_id = $1.id;
$$ stable language sql;