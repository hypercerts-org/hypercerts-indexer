alter table supported_schemas
    drop constraint supported_schemas_chain_id_eas_schema_id_key;

alter table supported_schemas
    rename column eas_schema_id to uid;

alter table supported_schemas
    add constraint supported_schemas_chain_id_uid_key unique (chain_id, uid);

drop index idx_supported_schemas_eas_schema_id;

create index idx_supported_schemas_uid
    on supported_schemas (uid);