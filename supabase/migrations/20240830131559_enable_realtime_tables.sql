-- remove the supabase_realtime publication
drop
    publication if exists supabase_realtime;

-- re-create the supabase_realtime publication with no tables
create publication supabase_realtime;

-- add a table called 'messages' to the publication
-- (update this to match your tables)
alter
    publication supabase_realtime add table allow_list_data;
alter
    publication supabase_realtime add table attestations;
alter
    publication supabase_realtime add table claims;
alter
    publication supabase_realtime add table fractions;
alter
    publication supabase_realtime add table hypercert_allow_list_records;
alter
    publication supabase_realtime add table hypercert_allow_lists;
alter
    publication supabase_realtime add table metadata;
alter
    publication supabase_realtime add table sales;
