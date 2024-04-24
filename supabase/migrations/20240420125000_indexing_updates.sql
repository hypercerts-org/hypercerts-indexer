CREATE OR REPLACE FUNCTION get_attestations_for_claim(claim_id uuid)
    RETURNS TABLE
            (
                id                   uuid,
                supported_schemas_id uuid,
                attestation_uid      text,
                chain_id             numeric,
                contract_address     text,
                token_id             numeric,
                recipient_address    text,
                attester_address     text,
                attestation          jsonb,
                decoded_attestation  jsonb,
                block_timestamp      numeric
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT a.*
        FROM attestations a
                 JOIN supported_schemas ss ON a.supported_schemas_id = ss.id
                 JOIN contracts c ON ss.chain_id = c.chain_id
                 JOIN claims cl ON c.id = cl.contracts_id
        WHERE cl.id = claim_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_unattested_claims()
    RETURNS TABLE
            (
                id                          uuid,
                contracts_id                uuid,
                token_id                    numeric,
                hypercert_id                text,
                creation_block_timestamp    numeric,
                last_block_update_timestamp numeric,
                owner_address               text,
                value                       numeric,
                units                       numeric,
                uri                         text,
                type                        token_type
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT c.*
        FROM claims c
        WHERE NOT EXISTS (SELECT 1
                          FROM attestations a
                                   JOIN supported_schemas ss ON a.supported_schemas_id = ss.id
                                   JOIN contracts co ON ss.chain_id = co.chain_id
                          WHERE co.id = c.contracts_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_attested_claims()
    RETURNS TABLE
            (
                id                          uuid,
                contracts_id                uuid,
                token_id                    numeric,
                hypercert_id                text,
                creation_block_timestamp    numeric,
                last_block_update_timestamp numeric,
                owner_address               text,
                value                       numeric,
                units                       numeric,
                uri                         text,
                type                        token_type
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT c.*
        FROM claims c
        WHERE EXISTS (SELECT 1
                      FROM attestations a
                               JOIN supported_schemas ss ON a.supported_schemas_id = ss.id
                               JOIN contracts co ON ss.chain_id = co.chain_id
                      WHERE co.id = c.contracts_id);
END;
$$ LANGUAGE plpgsql;