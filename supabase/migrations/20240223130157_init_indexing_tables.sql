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
    contracts_id       uuid not null references contracts,
    events_id          uuid not null references events,
    last_block_indexed numeric(78, 0),
    primary key (contracts_id, events_id)
);

create table claims
(
    id                          uuid primary key default gen_random_uuid(),
    contracts_id                uuid           not null references contracts (id),
    token_id                    numeric(78, 0) not null,
    hypercert_id                text,
    owner_address               text,
    value                       numeric(78, 0),
    units                       numeric(78, 0),
    uri                         text,
    creation_block_number       numeric(78, 0) not null,
    creation_block_timestamp    numeric(78, 0) not null,
    last_update_block_number    numeric(78, 0) not null,
    last_update_block_timestamp numeric(78, 0) not null,
    UNIQUE (contracts_id, token_id)
);

create table fractions
(
    id                          uuid primary key default gen_random_uuid(),
    claims_id                   uuid           not null references claims (id),
    token_id                    numeric(78, 0) not null,
    hypercert_id                text,
    owner_address               text,
    value                       numeric(78, 0),
    units                       numeric(78, 0),
    creation_block_number       numeric(78, 0) not null,
    creation_block_timestamp    numeric(78, 0) not null,
    last_update_block_number    numeric(78, 0) not null,
    last_update_block_timestamp numeric(78, 0) not null,
    UNIQUE (claims_id, token_id)
);

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
    parsed                bool             default false,
    UNIQUE (uri)
);


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
    id                          uuid primary key default gen_random_uuid(),
    supported_schemas_id        uuid           not null references supported_schemas (id),
    attestation_uid             text           not null,
    chain_id                    numeric(78, 0),
    contract_address            text,
    token_id                    numeric(78, 0),
    claims_id                   uuid,
    recipient_address           text           not null,
    attester_address            text           not null,
    attestation                 jsonb          not null,
    decoded_attestation         jsonb          not null,
    creation_block_number       numeric(78, 0) not null,
    creation_block_timestamp    numeric(78, 0) not null,
    last_update_block_number    numeric(78, 0) not null,
    last_update_block_timestamp numeric(78, 0) not null,
    UNIQUE (supported_schemas_id, attestation_uid)
);

create table allow_list_data
(
    id     uuid primary key default gen_random_uuid(),
    uri    text,
    root   text,
    data   jsonb,
    parsed bool,
    UNIQUE (uri)
);

create table hypercert_allow_lists
(
    id                 uuid not null primary key default gen_random_uuid(),
    claims_id          uuid not null references claims (id),
    allow_list_data_id uuid references allow_list_data (id),
    root               text,
    parsed             bool,
    unique (claims_id)
);

create table hypercert_allow_list_records
(
    id                       uuid primary key default gen_random_uuid(),
    hypercert_allow_lists_id uuid           not null references hypercert_allow_lists (id),
    user_address             text           not null,
    units                    numeric(78, 0) not null,
    entry                    numeric(78, 0) not null,
    UNIQUE (hypercert_allow_lists_id, user_address, units, entry)
);

alter table attestations
    add foreign key (claims_id) references claims (id);

alter table claims
    add foreign key (uri) references metadata (uri);

alter table metadata
    add foreign key (allow_list_uri) references allow_list_data (uri);

comment on table public.allow_list_data is e'@graphql({"totalCount": {"enabled": true}})';
comment on table public.hypercert_allow_list_records is e'@graphql({"totalCount": {"enabled": true}})';
comment on table public.attestations is e'@graphql({"totalCount": {"enabled": true}})';
comment on table public.claims is e'@graphql({"totalCount": {"enabled": true}})';
comment on table public.contract_events is e'@graphql({"totalCount": {"enabled": true}})';
comment on table public.contracts is e'@graphql({"totalCount": {"enabled": true}})';
comment on table public.fractions is e'@graphql({"totalCount": {"enabled": true}})';
comment on table public.hypercert_allow_lists is e'@graphql({"totalCount": {"enabled": true}})';
comment on table public.metadata is e'@graphql({"totalCount": {"enabled": true}})';

create index idx_allow_list_data_uri ON allow_list_data (uri);
create index idx_claims_hypercert_id on claims (hypercert_id);
create index idx_claims_uri ON claims (uri);
create index idx_fractions_claim_id on fractions (claims_id);
create index idx_fractions_owner_address on fractions (owner_address);
create index idx_metadata_allow_list_uri ON metadata (allow_list_uri);
create index idx_metadata_uri ON metadata (uri);
create index idx_supported_schemas_eas_schema_id ON supported_schemas (eas_schema_id);
create index idx_supported_schemas_chain_id ON supported_schemas (chain_id);
create index idx_attestations_attestation_uid ON attestations (attestation_uid);

