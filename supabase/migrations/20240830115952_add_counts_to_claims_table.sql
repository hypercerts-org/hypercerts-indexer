-- Add counts to claims table

ALTER TABLE claims
    ADD COLUMN attestations_count INTEGER DEFAULT 0;
ALTER TABLE claims
    ADD COLUMN sales_count INTEGER DEFAULT 0;

-- Update counts for each existing claim

UPDATE claims
SET attestations_count = (SELECT COUNT(*)
                          FROM attestations
                          WHERE claims.id = attestations.claims_id);

UPDATE claims
SET sales_count = (SELECT COUNT(*)
                   FROM sales
                   WHERE sales.hypercert_id = claims.hypercert_id);

-- Create triggers to update counts when records are inserted, updated, or deleted

-- Attestations
CREATE OR REPLACE FUNCTION update_attestations_count()
    RETURNS TRIGGER AS
$$
BEGIN
    UPDATE claims
    SET attestations_count = (SELECT COUNT(*) FROM attestations WHERE claims.id = attestations.claims_id)
    WHERE claims.id = NEW.claims_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_attestations_count
    AFTER INSERT OR UPDATE OR DELETE
    ON attestations
    FOR EACH ROW
EXECUTE FUNCTION update_attestations_count();

-- Sales

CREATE OR REPLACE FUNCTION update_sales_count()
    RETURNS TRIGGER AS
$$
BEGIN
    UPDATE claims
    SET sales_count = (SELECT COUNT(*) FROM sales WHERE claims.hypercert_id = sales.hypercert_id)
    WHERE hypercert_id = NEW.hypercert_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_sales_count
    AFTER INSERT OR UPDATE OR DELETE
    ON sales
    FOR EACH ROW
EXECUTE FUNCTION update_sales_count();