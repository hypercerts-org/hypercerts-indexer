create table hypercerts (
    id uuid primary key default gen_random_uuid(),
    chain_id bigint,
    contract_address text,
    token_id bigint,
    name text,
    description text,
    image text,
    external_url text,
    work_scope text [],
    work_timeframe_from timestamp,
    work_timeframe_to timestamp,
    impact_scope text [],
    impact_timeframe_from timestamp,
    impact_timeframe_to timestamp,
    contributors text [],
    rights text [],
    cid text
);