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

CREATE OR REPLACE FUNCTION get_unparsed_hypercert_allow_lists()
    RETURNS TABLE
            (
                claim_id   uuid,
                al_data_id uuid,
                data       jsonb
            )
    LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT c.id AS claim_id, ad.id AS al_data_id, ad.data AS data
        FROM claims c
                 INNER JOIN metadata m ON c.uri = m.uri
                 INNER JOIN allow_list_data ad ON ad.uri = m.allow_list_uri
        WHERE m.allow_list_uri IS NOT NULL
          AND ad.parsed = true
          AND NOT EXISTS (SELECT 1
                          FROM hypercert_allow_lists
                          WHERE claims_id = c.id
                            AND allow_list_data_id = ad.id);
END;
$$;
