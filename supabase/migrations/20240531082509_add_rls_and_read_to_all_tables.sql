-- Grant only read access to all public tables
DO
$$
    DECLARE
        p_table_name text;
    BEGIN
        FOR p_table_name IN
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
            LOOP
                EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', p_table_name);
                EXECUTE format('CREATE POLICY "Enable read access for all users" ON %I FOR SELECT TO PUBLIC;',
                               p_table_name);
            END LOOP;
    end;
$$
