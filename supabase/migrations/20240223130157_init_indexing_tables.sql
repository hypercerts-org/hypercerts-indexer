create table hypercert_contracts
(
    id                 uuid primary key default gen_random_uuid(),
    chain_id           numeric(78, 0) not null,
    contract_address   text           not null,
    last_block_indexed numeric(78, 0),
    UNIQUE (chain_id, contract_address)
);

create table hypercerts
(
    id                     uuid primary key default gen_random_uuid(),
    hypercert_contracts_id uuid           not null references hypercert_contracts (id),
    claim_id               numeric(78, 0) not null,
    name                   text,
    description            text,
    image                  text,
    external_url           text,
    work_scope             text[],
    work_timeframe_from    numeric(78, 0),
    work_timeframe_to      numeric(78, 0),
    impact_scope           text[],
    impact_timeframe_from  numeric(78, 0),
    impact_timeframe_to    numeric(78, 0),
    contributors           text[],
    rights                 text[],
    uri                    text,
    properties             jsonb,
    block_timestamp        numeric(78, 0) not null,
    UNIQUE (hypercert_contracts_id, claim_id)
);

comment on table public.hypercerts is e'@graphql({"totalCount": {"enabled": true}})';


create table supported_schemas
(
    id                 uuid primary key default gen_random_uuid(),
    chain_id           numeric(78, 0) not null,
    eas_schema_id      text           not null,
    schema             text,
    resolver           text,
    revocable          boolean,
    last_block_indexed numeric(78, 0),
    UNIQUE (chain_id, eas_schema_id)
);

create table attestations
(
    id                   uuid primary key default gen_random_uuid(),
    supported_schemas_id uuid           not null references supported_schemas (id),
    attestation_uid      text           not null,
    chain_id             numeric(78, 0),
    contract_address     text,
    token_id             numeric(78, 0),
    recipient_address    text           not null,
    attester_address     text           not null,
    attestation          jsonb          not null,
    decoded_attestation  jsonb          not null,
    block_timestamp      numeric(78, 0) not null,
    UNIQUE (supported_schemas_id, attestation_uid)
);

comment on table public.attestations is e'@graphql({"totalCount": {"enabled": true}})';
