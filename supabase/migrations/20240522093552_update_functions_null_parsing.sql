CREATE OR REPLACE FUNCTION check_uri_and_insert_into_metadata()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.uri IS NOT NULL AND NOT EXISTS (SELECT 1 FROM metadata WHERE uri = NEW.uri) THEN
        INSERT INTO metadata (uri) VALUES (NEW.uri);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;