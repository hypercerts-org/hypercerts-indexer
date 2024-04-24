create table contracts
(
    id               uuid primary key default gen_random_uuid(),
    chain_id         numeric(78, 0) not null,
    contract_address text           not null,
    start_block      numeric(78, 0),
    UNIQUE (chain_id, contract_address)
);

create table events
(
    id   uuid primary key default gen_random_uuid(),
    name text not null,
    abi  text not null,
    UNIQUE (abi)
);

create table contract_events
(
    id                 uuid primary key default gen_random_uuid(),
    contract_id        uuid not null references contracts (id),
    event_id           uuid not null references events (id),
    last_block_indexed numeric(78, 0),
    UNIQUE (contract_id, event_id)
);

create type token_type as enum ('claim', 'fraction');

create table claims
(
    id                          uuid primary key default gen_random_uuid(),
    contracts_id                uuid           not null references contracts (id),
    token_id                    numeric(78, 0) not null,
    hypercert_id                text,
    creation_block_timestamp    numeric(78, 0),
    last_block_update_timestamp numeric(78, 0),
    owner_address               text,
    value                       numeric(78, 0),
    units                       numeric(78, 0),
    uri                         text,
    type                        token_type,
    UNIQUE (contracts_id, token_id)
);

create index idx_claims_hypercert_id on claims (hypercert_id);
create index idx_claims_uri ON claims (uri);

comment on table public.claims is e'@graphql({"totalCount": {"enabled": true}})';

create table fractions
(
    id                          uuid primary key default gen_random_uuid(),
    claims_id                   uuid           not null references claims (id),
    token_id                    numeric(78, 0) not null,
    hypercert_id                text,
    creation_block_timestamp    numeric(78, 0),
    last_block_update_timestamp numeric(78, 0),
    owner_address               text,
    value                       numeric(78, 0),
    units                       numeric(78, 0),
    type                        token_type,
    UNIQUE (claims_id, token_id)
);

create index idx_fractions_claim_id on fractions (claims_id);
create index idx_fractions_owner_address on fractions (owner_address);

comment on table public.fractions is e'@graphql({"totalCount": {"enabled": true}})';

create table metadata
(
    id                    uuid primary key default gen_random_uuid(),
    name                  text,
    description           text,
    image                 text,
    external_url          text,
    work_scope            text[],
    work_timeframe_from   numeric(78, 0),
    work_timeframe_to     numeric(78, 0),
    impact_scope          text[],
    impact_timeframe_from numeric(78, 0),
    impact_timeframe_to   numeric(78, 0),
    contributors          text[],
    rights                text[],
    uri                   text,
    properties            jsonb,
    allow_list_uri        text,
    UNIQUE (uri)
);

comment on table public.metadata is e'@graphql({"totalCount": {"enabled": true}})';

create index idx_metadata_uri ON metadata (uri);

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

create table allow_list_data
(
    id     uuid primary key default gen_random_uuid(),
    uri    text,
    root   text,
    data   jsonb,
    parsed bool,
    UNIQUE (uri, root)
);

CREATE INDEX idx_allow_list_data_uri ON allow_list_data (uri);
CREATE INDEX idx_metadata_allow_list_uri ON metadata (allow_list_uri);

comment on table public.allow_list_data is e'@graphql({"totalCount": {"enabled": true}})';

create table hypercert_allow_lists
(
    id                 uuid primary key default gen_random_uuid(),
    claims_id          uuid not null references claims (id),
    allow_list_data_id uuid not null references allow_list_data (id),
    UNIQUE (claims_id, allow_list_data_id)
);

comment on table public.hypercert_allow_lists is e'@graphql({"totalCount": {"enabled": true}})';

create table allow_list_records
(
    id               uuid primary key default gen_random_uuid(),
    hc_allow_list_id uuid           not null references hypercert_allow_lists (id),
    user_address     text           not null,
    units            numeric(78, 0) not null,
    entry            numeric(78, 0) not null,
    UNIQUE (hc_allow_list_id, user_address, units, entry)
);

comment on table public.allow_list_records is e'@graphql({"totalCount": {"enabled": true}})';

