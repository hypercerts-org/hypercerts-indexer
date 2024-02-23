create table hypercerts (
    id uuid default gen_random_uuid(),
    chain_id numeric(78, 0) not null,
    contract_address text not null,
    token_id numeric(78, 0) not null,
    name text,
    description text,
    image text,
    external_url text,
    work_scope text [],
    work_timeframe_from numeric(78, 0),
    work_timeframe_to numeric(78, 0),
    impact_scope text [],
    impact_timeframe_from numeric(78, 0),
    impact_timeframe_to numeric(78, 0),
    contributors text [],
    rights text [],
    cid text,
    PRIMARY KEY (chain_id, contract_address, token_id)
);

create table lastBlockIndexed (
    chain_id numeric(78, 0),
    contract_address text,
    block_number numeric(78, 0),
    PRIMARY KEY (chain_id, contract_address)
);