-- create function title_description(books) returns text as $$
-- select $1.title || ' ' || $1.description;
-- $$ language sql immutable;

create function name_description(hypercerts) returns record as
$$
select $1.name || ' ' || $1.description;
$$ language sql immutable;

create function work_impact_scopes(hypercerts) returns record as
$$
select $1.work_scope || $1.impact_scope;
$$ language sql immutable;
--
-- create function name_description_work_impact_scopes(hypercerts) returns record as
-- $$
-- select $1.name || ' ' || $1.description || ' ' || $1.work_scope || ' ' || $1.impact_scope;
-- $$ language sql immutable;
--
-- create function work_timeframe(hypercerts) returns record as
-- $$
-- select $1.work_timeframe_from || ' ' || $1.work_timeframe_to;
-- $$ language sql immutable;
--
-- create function impact_timeframe(hypercerts) returns record as
-- $$
-- select $1.impact_timeframe_from || ' ' || $1.impact_timeframe_to;
-- $$ language sql immutable;