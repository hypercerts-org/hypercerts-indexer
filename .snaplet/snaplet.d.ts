//#region structure
type JsonPrimitive = null | number | string | boolean;
type Nested<V> = V | { [s: string]: V | Nested<V> } | Array<V | Nested<V>>;
type Json = Nested<JsonPrimitive>;
type Enum_auth_aal_level = 'aal1' | 'aal2' | 'aal3';
type Enum_auth_code_challenge_method = 'plain' | 's256';
type Enum_auth_factor_status = 'unverified' | 'verified';
type Enum_auth_factor_type = 'totp' | 'webauthn';
type Enum_auth_one_time_token_type = 'confirmation_token' | 'email_change_token_current' | 'email_change_token_new' | 'phone_change_token' | 'reauthentication_token' | 'recovery_token';
type Enum_net_request_status = 'ERROR' | 'PENDING' | 'SUCCESS';
type Enum_pgsodium_key_status = 'default' | 'expired' | 'invalid' | 'valid';
type Enum_pgsodium_key_type = 'aead-det' | 'aead-ietf' | 'auth' | 'generichash' | 'hmacsha256' | 'hmacsha512' | 'kdf' | 'secretbox' | 'secretstream' | 'shorthash' | 'stream_xchacha20';
type Enum_realtime_action = 'DELETE' | 'ERROR' | 'INSERT' | 'TRUNCATE' | 'UPDATE';
type Enum_realtime_equality_op = 'eq' | 'gt' | 'gte' | 'in' | 'lt' | 'lte' | 'neq';
interface Table_net_http_response {
  id: number | null;
  status_code: number | null;
  content_type: string | null;
  headers: Json | null;
  content: string | null;
  timed_out: boolean | null;
  error_msg: string | null;
  created: string;
}
interface Table_public_allow_list_data {
  id: string;
  uri: string | null;
  root: string | null;
  data: Json | null;
  parsed: boolean | null;
}
interface Table_public_attestations {
  id: string;
  supported_schemas_id: string;
  uid: string;
  chain_id: number | null;
  contract_address: string | null;
  token_id: number | null;
  claims_id: string | null;
  recipient: string;
  attester: string;
  attestation: Json;
  data: Json;
  block_timestamp: number;
}
interface Table_auth_audit_log_entries {
  instance_id: string | null;
  id: string;
  payload: Json | null;
  created_at: string | null;
  ip_address: string;
}
interface Table_realtime_broadcasts {
  id: number;
  channel_id: number;
  inserted_at: string;
  updated_at: string;
}
interface Table_storage_buckets {
  id: string;
  name: string;
  owner: string | null;
  created_at: string | null;
  updated_at: string | null;
  public: boolean | null;
  avif_autodetection: boolean | null;
  file_size_limit: number | null;
  allowed_mime_types: string[] | null;
  owner_id: string | null;
}
interface Table_realtime_channels {
  id: number;
  name: string;
  inserted_at: string;
  updated_at: string;
}
interface Table_public_claims {
  id: string;
  contracts_id: string;
  token_id: number;
  hypercert_id: string | null;
  block_number: number | null;
  owner_address: string | null;
  value: number | null;
  units: number | null;
  uri: string | null;
  creator_address: string | null;
}
interface Table_public_contract_events {
  contracts_id: string;
  events_id: string;
  last_block_indexed: number | null;
}
interface Table_public_contracts {
  id: string;
  chain_id: number;
  contract_address: string;
  start_block: number | null;
}
interface Table_public_events {
  id: string;
  name: string;
  abi: string;
}
interface Table_auth_flow_state {
  id: string;
  user_id: string | null;
  auth_code: string;
  code_challenge_method: Enum_auth_code_challenge_method;
  code_challenge: string;
  provider_type: string;
  provider_access_token: string | null;
  provider_refresh_token: string | null;
  created_at: string | null;
  updated_at: string | null;
  authentication_method: string;
  auth_code_issued_at: string | null;
}
interface Table_public_fractions {
  id: string;
  claims_id: string;
  token_id: number;
  hypercert_id: string | null;
  creation_block_timestamp: number | null;
  last_block_update_timestamp: number | null;
  owner_address: string | null;
  value: number | null;
  units: number | null;
}
interface Table_supabase_functions_hooks {
  id: number;
  hook_table_id: number;
  hook_name: string;
  created_at: string;
  request_id: number | null;
}
interface Table_net_http_request_queue {
  id: number;
  method: string;
  url: string;
  headers: Json;
  body: string | null;
  timeout_milliseconds: number;
}
interface Table_public_hypercert_allow_list_records {
  id: string;
  hypercert_allow_lists_id: string;
  user_address: string;
  units: number;
  entry: number;
  claimed: boolean;
  leaf: string;
  proof: Json;
}
interface Table_public_hypercert_allow_lists {
  id: string;
  claims_id: string;
  allow_list_data_id: string | null;
  root: string | null;
  parsed: boolean | null;
}
interface Table_auth_identities {
  provider_id: string;
  user_id: string;
  identity_data: Json;
  provider: string;
  last_sign_in_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  id: string;
}
interface Table_auth_instances {
  id: string;
  uuid: string | null;
  raw_base_config: string | null;
  created_at: string | null;
  updated_at: string | null;
}
interface Table_pgsodium_key {
  id: string;
  status: Enum_pgsodium_key_status | null;
  created: string;
  expires: string | null;
  key_type: Enum_pgsodium_key_type | null;
  key_id: number | null;
  key_context: string | null;
  name: string | null;
  associated_data: string | null;
  raw_key: string | null;
  raw_key_nonce: string | null;
  parent_key: string | null;
  comment: string | null;
  user_data: string | null;
}
interface Table_public_metadata {
  id: string;
  name: string | null;
  description: string | null;
  image: string | null;
  external_url: string | null;
  work_scope: string[] | null;
  work_timeframe_from: number | null;
  work_timeframe_to: number | null;
  impact_scope: string[] | null;
  impact_timeframe_from: number | null;
  impact_timeframe_to: number | null;
  contributors: string[] | null;
  rights: string[] | null;
  uri: string | null;
  properties: Json | null;
  allow_list_uri: string | null;
  parsed: boolean | null;
}
interface Table_auth_mfa_amr_claims {
  session_id: string;
  created_at: string;
  updated_at: string;
  authentication_method: string;
  id: string;
}
interface Table_auth_mfa_challenges {
  id: string;
  factor_id: string;
  created_at: string;
  verified_at: string | null;
  ip_address: string;
}
interface Table_auth_mfa_factors {
  id: string;
  user_id: string;
  friendly_name: string | null;
  factor_type: Enum_auth_factor_type;
  status: Enum_auth_factor_status;
  created_at: string;
  updated_at: string;
  secret: string | null;
}
interface Table_storage_migrations {
  id: number;
  name: string;
  hash: string;
  executed_at: string | null;
}
interface Table_supabase_functions_migrations {
  version: string;
  inserted_at: string;
}
interface Table_storage_objects {
  id: string;
  bucket_id: string | null;
  name: string | null;
  owner: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_accessed_at: string | null;
  metadata: Json | null;
  version: string | null;
  owner_id: string | null;
}
interface Table_auth_one_time_tokens {
  id: string;
  user_id: string;
  token_type: Enum_auth_one_time_token_type;
  token_hash: string;
  relates_to: string;
  created_at: string;
  updated_at: string;
}
interface Table_realtime_presences {
  id: number;
  channel_id: number;
  inserted_at: string;
  updated_at: string;
}
interface Table_auth_refresh_tokens {
  instance_id: string | null;
  id: number;
  token: string | null;
  user_id: string | null;
  revoked: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  parent: string | null;
  session_id: string | null;
}
interface Table_storage_s_3_multipart_uploads {
  id: string;
  in_progress_size: number;
  upload_signature: string;
  bucket_id: string;
  key: string;
  version: string;
  owner_id: string | null;
  created_at: string;
}
interface Table_storage_s_3_multipart_uploads_parts {
  id: string;
  upload_id: string;
  size: number;
  part_number: number;
  bucket_id: string;
  key: string;
  etag: string;
  owner_id: string | null;
  version: string;
  created_at: string;
}
interface Table_auth_saml_providers {
  id: string;
  sso_provider_id: string;
  entity_id: string;
  metadata_xml: string;
  metadata_url: string | null;
  attribute_mapping: Json | null;
  created_at: string | null;
  updated_at: string | null;
  name_id_format: string | null;
}
interface Table_auth_saml_relay_states {
  id: string;
  sso_provider_id: string;
  request_id: string;
  for_email: string | null;
  redirect_to: string | null;
  created_at: string | null;
  updated_at: string | null;
  flow_state_id: string | null;
}
interface Table_auth_schema_migrations {
  version: string;
}
interface Table_realtime_schema_migrations {
  version: number;
  inserted_at: string | null;
}
interface Table_supabase_migrations_schema_migrations {
  version: string;
  statements: string[] | null;
  name: string | null;
}
interface Table_vault_secrets {
  id: string;
  name: string | null;
  description: string;
  secret: string;
  key_id: string | null;
  nonce: string | null;
  created_at: string;
  updated_at: string;
}
interface Table_auth_sessions {
  id: string;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
  factor_id: string | null;
  aal: Enum_auth_aal_level | null;
  not_after: string | null;
  refreshed_at: string | null;
  user_agent: string | null;
  ip: string | null;
  tag: string | null;
}
interface Table_auth_sso_domains {
  id: string;
  sso_provider_id: string;
  domain: string;
  created_at: string | null;
  updated_at: string | null;
}
interface Table_auth_sso_providers {
  id: string;
  resource_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}
interface Table_realtime_subscription {
  id: number;
  subscription_id: string;
  /**
  * We couldn't determine the type of this column. The type might be coming from an unknown extension
  * or be specific to your database. Please if it's a common used type report this issue so we can fix it!
  * Otherwise, please manually type this column by casting it to the correct type.
  * @example
  * Here is a cast example for copycat use:
  * ```
  * copycat.scramble(row.unknownColumn as string)
  * ```
  */
  entity: unknown;
  /**
  * We couldn't determine the type of this column. The type might be coming from an unknown extension
  * or be specific to your database. Please if it's a common used type report this issue so we can fix it!
  * Otherwise, please manually type this column by casting it to the correct type.
  * @example
  * Here is a cast example for copycat use:
  * ```
  * copycat.scramble(row.unknownColumn as string)
  * ```
  */
  filters: unknown[];
  claims: Json;
  created_at: string;
}
interface Table_public_supported_schemas {
  id: string;
  chain_id: number;
  uid: string;
  schema: string | null;
  resolver: string | null;
  revocable: boolean | null;
  last_block_indexed: number | null;
}
interface Table_auth_users {
  instance_id: string | null;
  id: string;
  aud: string | null;
  role: string | null;
  email: string | null;
  encrypted_password: string | null;
  email_confirmed_at: string | null;
  invited_at: string | null;
  confirmation_token: string | null;
  confirmation_sent_at: string | null;
  recovery_token: string | null;
  recovery_sent_at: string | null;
  email_change_token_new: string | null;
  email_change: string | null;
  email_change_sent_at: string | null;
  last_sign_in_at: string | null;
  raw_app_meta_data: Json | null;
  raw_user_meta_data: Json | null;
  is_super_admin: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  phone_change: string | null;
  phone_change_token: string | null;
  phone_change_sent_at: string | null;
  email_change_token_current: string | null;
  email_change_confirm_status: number | null;
  banned_until: string | null;
  reauthentication_token: string | null;
  reauthentication_sent_at: string | null;
  is_sso_user: boolean;
  deleted_at: string | null;
  is_anonymous: boolean;
}
interface Schema_analytics {

}
interface Schema_realtime {

}
interface Schema_auth {
  audit_log_entries: Table_auth_audit_log_entries;
  flow_state: Table_auth_flow_state;
  identities: Table_auth_identities;
  instances: Table_auth_instances;
  mfa_amr_claims: Table_auth_mfa_amr_claims;
  mfa_challenges: Table_auth_mfa_challenges;
  mfa_factors: Table_auth_mfa_factors;
  one_time_tokens: Table_auth_one_time_tokens;
  refresh_tokens: Table_auth_refresh_tokens;
  saml_providers: Table_auth_saml_providers;
  saml_relay_states: Table_auth_saml_relay_states;
  schema_migrations: Table_auth_schema_migrations;
  sessions: Table_auth_sessions;
  sso_domains: Table_auth_sso_domains;
  sso_providers: Table_auth_sso_providers;
  users: Table_auth_users;
}
interface Schema_extensions {

}
interface Schema_graphql {

}
interface Schema_graphql_public {

}
interface Schema_net {
  _http_response: Table_net_http_response;
  http_request_queue: Table_net_http_request_queue;
}
interface Schema_pgsodium {
  key: Table_pgsodium_key;
}
interface Schema_pgsodium_masks {

}
interface Schema_public {
  allow_list_data: Table_public_allow_list_data;
  attestations: Table_public_attestations;
  claims: Table_public_claims;
  contract_events: Table_public_contract_events;
  contracts: Table_public_contracts;
  events: Table_public_events;
  fractions: Table_public_fractions;
  hypercert_allow_list_records: Table_public_hypercert_allow_list_records;
  hypercert_allow_lists: Table_public_hypercert_allow_lists;
  metadata: Table_public_metadata;
  supported_schemas: Table_public_supported_schemas;
}
interface Schema_realtime {
  broadcasts: Table_realtime_broadcasts;
  channels: Table_realtime_channels;
  presences: Table_realtime_presences;
  schema_migrations: Table_realtime_schema_migrations;
  subscription: Table_realtime_subscription;
}
interface Schema_storage {
  buckets: Table_storage_buckets;
  migrations: Table_storage_migrations;
  objects: Table_storage_objects;
  s3_multipart_uploads: Table_storage_s_3_multipart_uploads;
  s3_multipart_uploads_parts: Table_storage_s_3_multipart_uploads_parts;
}
interface Schema_supabase_functions {
  hooks: Table_supabase_functions_hooks;
  migrations: Table_supabase_functions_migrations;
}
interface Schema_supabase_migrations {
  schema_migrations: Table_supabase_migrations_schema_migrations;
}
interface Schema_vault {
  secrets: Table_vault_secrets;
}
interface Database {
  _analytics: Schema__analytics;
  _realtime: Schema__realtime;
  auth: Schema_auth;
  extensions: Schema_extensions;
  graphql: Schema_graphql;
  graphql_public: Schema_graphql_public;
  net: Schema_net;
  pgsodium: Schema_pgsodium;
  pgsodium_masks: Schema_pgsodium_masks;
  public: Schema_public;
  realtime: Schema_realtime;
  storage: Schema_storage;
  supabase_functions: Schema_supabase_functions;
  supabase_migrations: Schema_supabase_migrations;
  vault: Schema_vault;
}
interface Extension {
  extensions: "pg_net" | "pg_stat_statements" | "pgcrypto" | "pgjwt" | "uuid-ossp";
  graphql: "pg_graphql";
  pgsodium: "pgsodium";
  vault: "supabase_vault";
}
interface Tables_relationships {
  "public.allow_list_data": {
    parent: {

    };
    children: {
       hypercert_allow_lists_allow_list_data_id_fkey: "public.hypercert_allow_lists";
       metadata_allow_list_uri_fkey: "public.metadata";
    };
    parentDestinationsTables:  | {};
    childDestinationsTables: "public.hypercert_allow_lists" | "public.metadata" | {};
    
  };
  "public.attestations": {
    parent: {
       attestations_claims_id_fkey: "public.claims";
       attestations_supported_schemas_id_fkey: "public.supported_schemas";
    };
    children: {

    };
    parentDestinationsTables: "public.claims" | "public.supported_schemas" | {};
    childDestinationsTables:  | {};
    
  };
  "realtime.broadcasts": {
    parent: {
       broadcasts_channel_id_fkey: "realtime.channels";
    };
    children: {

    };
    parentDestinationsTables: "realtime.channels" | {};
    childDestinationsTables:  | {};
    
  };
  "storage.buckets": {
    parent: {

    };
    children: {
       objects_bucketId_fkey: "storage.objects";
       s3_multipart_uploads_bucket_id_fkey: "storage.s3_multipart_uploads";
       s3_multipart_uploads_parts_bucket_id_fkey: "storage.s3_multipart_uploads_parts";
    };
    parentDestinationsTables:  | {};
    childDestinationsTables: "storage.objects" | "storage.s3_multipart_uploads" | "storage.s3_multipart_uploads_parts" | {};
    
  };
  "realtime.channels": {
    parent: {

    };
    children: {
       broadcasts_channel_id_fkey: "realtime.broadcasts";
       presences_channel_id_fkey: "realtime.presences";
    };
    parentDestinationsTables:  | {};
    childDestinationsTables: "realtime.broadcasts" | "realtime.presences" | {};
    
  };
  "public.claims": {
    parent: {
       claims_contracts_id_fkey: "public.contracts";
       claims_uri_fkey: "public.metadata";
    };
    children: {
       attestations_claims_id_fkey: "public.attestations";
       fractions_claims_id_fkey: "public.fractions";
       hypercert_allow_lists_claims_id_fkey: "public.hypercert_allow_lists";
    };
    parentDestinationsTables: "public.contracts" | "public.metadata" | {};
    childDestinationsTables: "public.attestations" | "public.fractions" | "public.hypercert_allow_lists" | {};
    
  };
  "public.contract_events": {
    parent: {
       contract_events_contracts_id_fkey: "public.contracts";
       contract_events_events_id_fkey: "public.events";
    };
    children: {

    };
    parentDestinationsTables: "public.contracts" | "public.events" | {};
    childDestinationsTables:  | {};
    
  };
  "public.contracts": {
    parent: {

    };
    children: {
       claims_contracts_id_fkey: "public.claims";
       contract_events_contracts_id_fkey: "public.contract_events";
    };
    parentDestinationsTables:  | {};
    childDestinationsTables: "public.claims" | "public.contract_events" | {};
    
  };
  "public.events": {
    parent: {

    };
    children: {
       contract_events_events_id_fkey: "public.contract_events";
    };
    parentDestinationsTables:  | {};
    childDestinationsTables: "public.contract_events" | {};
    
  };
  "auth.flow_state": {
    parent: {

    };
    children: {
       saml_relay_states_flow_state_id_fkey: "auth.saml_relay_states";
    };
    parentDestinationsTables:  | {};
    childDestinationsTables: "auth.saml_relay_states" | {};
    
  };
  "public.fractions": {
    parent: {
       fractions_claims_id_fkey: "public.claims";
    };
    children: {

    };
    parentDestinationsTables: "public.claims" | {};
    childDestinationsTables:  | {};
    
  };
  "public.hypercert_allow_list_records": {
    parent: {
       hypercert_allow_list_records_hypercert_allow_lists_id_fkey: "public.hypercert_allow_lists";
    };
    children: {

    };
    parentDestinationsTables: "public.hypercert_allow_lists" | {};
    childDestinationsTables:  | {};
    
  };
  "public.hypercert_allow_lists": {
    parent: {
       hypercert_allow_lists_allow_list_data_id_fkey: "public.allow_list_data";
       hypercert_allow_lists_claims_id_fkey: "public.claims";
    };
    children: {
       hypercert_allow_list_records_hypercert_allow_lists_id_fkey: "public.hypercert_allow_list_records";
    };
    parentDestinationsTables: "public.allow_list_data" | "public.claims" | {};
    childDestinationsTables: "public.hypercert_allow_list_records" | {};
    
  };
  "auth.identities": {
    parent: {
       identities_user_id_fkey: "auth.users";
    };
    children: {

    };
    parentDestinationsTables: "auth.users" | {};
    childDestinationsTables:  | {};
    
  };
  "pgsodium.key": {
    parent: {
       key_parent_key_fkey: "pgsodium.key";
    };
    children: {
       key_parent_key_fkey: "pgsodium.key";
       secrets_key_id_fkey: "vault.secrets";
    };
    parentDestinationsTables: "pgsodium.key" | {};
    childDestinationsTables: "pgsodium.key" | "vault.secrets" | {};
    
  };
  "public.metadata": {
    parent: {
       metadata_allow_list_uri_fkey: "public.allow_list_data";
    };
    children: {
       claims_uri_fkey: "public.claims";
    };
    parentDestinationsTables: "public.allow_list_data" | {};
    childDestinationsTables: "public.claims" | {};
    
  };
  "auth.mfa_amr_claims": {
    parent: {
       mfa_amr_claims_session_id_fkey: "auth.sessions";
    };
    children: {

    };
    parentDestinationsTables: "auth.sessions" | {};
    childDestinationsTables:  | {};
    
  };
  "auth.mfa_challenges": {
    parent: {
       mfa_challenges_auth_factor_id_fkey: "auth.mfa_factors";
    };
    children: {

    };
    parentDestinationsTables: "auth.mfa_factors" | {};
    childDestinationsTables:  | {};
    
  };
  "auth.mfa_factors": {
    parent: {
       mfa_factors_user_id_fkey: "auth.users";
    };
    children: {
       mfa_challenges_auth_factor_id_fkey: "auth.mfa_challenges";
    };
    parentDestinationsTables: "auth.users" | {};
    childDestinationsTables: "auth.mfa_challenges" | {};
    
  };
  "storage.objects": {
    parent: {
       objects_bucketId_fkey: "storage.buckets";
    };
    children: {

    };
    parentDestinationsTables: "storage.buckets" | {};
    childDestinationsTables:  | {};
    
  };
  "auth.one_time_tokens": {
    parent: {
       one_time_tokens_user_id_fkey: "auth.users";
    };
    children: {

    };
    parentDestinationsTables: "auth.users" | {};
    childDestinationsTables:  | {};
    
  };
  "realtime.presences": {
    parent: {
       presences_channel_id_fkey: "realtime.channels";
    };
    children: {

    };
    parentDestinationsTables: "realtime.channels" | {};
    childDestinationsTables:  | {};
    
  };
  "auth.refresh_tokens": {
    parent: {
       refresh_tokens_session_id_fkey: "auth.sessions";
    };
    children: {

    };
    parentDestinationsTables: "auth.sessions" | {};
    childDestinationsTables:  | {};
    
  };
  "storage.s3_multipart_uploads": {
    parent: {
       s3_multipart_uploads_bucket_id_fkey: "storage.buckets";
    };
    children: {
       s3_multipart_uploads_parts_upload_id_fkey: "storage.s3_multipart_uploads_parts";
    };
    parentDestinationsTables: "storage.buckets" | {};
    childDestinationsTables: "storage.s3_multipart_uploads_parts" | {};
    
  };
  "storage.s3_multipart_uploads_parts": {
    parent: {
       s3_multipart_uploads_parts_bucket_id_fkey: "storage.buckets";
       s3_multipart_uploads_parts_upload_id_fkey: "storage.s3_multipart_uploads";
    };
    children: {

    };
    parentDestinationsTables: "storage.buckets" | "storage.s3_multipart_uploads" | {};
    childDestinationsTables:  | {};
    
  };
  "auth.saml_providers": {
    parent: {
       saml_providers_sso_provider_id_fkey: "auth.sso_providers";
    };
    children: {

    };
    parentDestinationsTables: "auth.sso_providers" | {};
    childDestinationsTables:  | {};
    
  };
  "auth.saml_relay_states": {
    parent: {
       saml_relay_states_flow_state_id_fkey: "auth.flow_state";
       saml_relay_states_sso_provider_id_fkey: "auth.sso_providers";
    };
    children: {

    };
    parentDestinationsTables: "auth.flow_state" | "auth.sso_providers" | {};
    childDestinationsTables:  | {};
    
  };
  "vault.secrets": {
    parent: {
       secrets_key_id_fkey: "pgsodium.key";
    };
    children: {

    };
    parentDestinationsTables: "pgsodium.key" | {};
    childDestinationsTables:  | {};
    
  };
  "auth.sessions": {
    parent: {
       sessions_user_id_fkey: "auth.users";
    };
    children: {
       mfa_amr_claims_session_id_fkey: "auth.mfa_amr_claims";
       refresh_tokens_session_id_fkey: "auth.refresh_tokens";
    };
    parentDestinationsTables: "auth.users" | {};
    childDestinationsTables: "auth.mfa_amr_claims" | "auth.refresh_tokens" | {};
    
  };
  "auth.sso_domains": {
    parent: {
       sso_domains_sso_provider_id_fkey: "auth.sso_providers";
    };
    children: {

    };
    parentDestinationsTables: "auth.sso_providers" | {};
    childDestinationsTables:  | {};
    
  };
  "auth.sso_providers": {
    parent: {

    };
    children: {
       saml_providers_sso_provider_id_fkey: "auth.saml_providers";
       saml_relay_states_sso_provider_id_fkey: "auth.saml_relay_states";
       sso_domains_sso_provider_id_fkey: "auth.sso_domains";
    };
    parentDestinationsTables:  | {};
    childDestinationsTables: "auth.saml_providers" | "auth.saml_relay_states" | "auth.sso_domains" | {};
    
  };
  "public.supported_schemas": {
    parent: {

    };
    children: {
       attestations_supported_schemas_id_fkey: "public.attestations";
    };
    parentDestinationsTables:  | {};
    childDestinationsTables: "public.attestations" | {};
    
  };
  "auth.users": {
    parent: {

    };
    children: {
       identities_user_id_fkey: "auth.identities";
       mfa_factors_user_id_fkey: "auth.mfa_factors";
       one_time_tokens_user_id_fkey: "auth.one_time_tokens";
       sessions_user_id_fkey: "auth.sessions";
    };
    parentDestinationsTables:  | {};
    childDestinationsTables: "auth.identities" | "auth.mfa_factors" | "auth.one_time_tokens" | "auth.sessions" | {};
    
  };
}
//#endregion

//#region select
type SelectedTable = { id: string; schema: string; table: string };

type SelectDefault = {
  /**
   * Define the "default" behavior to use for the tables in the schema.
   * If true, select all tables in the schema.
   * If false, select no tables in the schema.
   * If "structure", select only the structure of the tables in the schema but not the data.
   * @defaultValue true
   */
  $default?: SelectObject;
};

type DefaultKey = keyof SelectDefault;

type SelectObject = boolean | "structure";

type ExtensionsSelect<TSchema extends keyof Database> =
  TSchema extends keyof Extension
    ? {
        /**
         * Define if you want to select the extension data.
         * @defaultValue false
         */
        $extensions?:
          | boolean
          | {
              [TExtension in Extension[TSchema]]?: boolean;
            };
      }
    : {};

type SelectConfig = SelectDefault & {
  [TSchema in keyof Database]?:
    | SelectObject
    | (SelectDefault &
        ExtensionsSelect<TSchema> & {
          [TTable in keyof Database[TSchema]]?: SelectObject;
        });
};

// Apply the __default key if it exists to each level of the select config (schemas and tables)
type ApplyDefault<TSelectConfig extends SelectConfig> = {
  [TSchema in keyof Database]-?: {
    [TTable in keyof Database[TSchema]]-?: TSelectConfig[TSchema] extends SelectObject
      ? TSelectConfig[TSchema]
      : TSelectConfig[TSchema] extends Record<any, any>
      ? TSelectConfig[TSchema][TTable] extends SelectObject
        ? TSelectConfig[TSchema][TTable]
        : TSelectConfig[TSchema][DefaultKey] extends SelectObject
        ? TSelectConfig[TSchema][DefaultKey]
        : TSelectConfig[DefaultKey] extends SelectObject
        ? TSelectConfig[DefaultKey]
        : true
      : TSelectConfig[DefaultKey] extends SelectObject
      ? TSelectConfig[DefaultKey]
      : true;
  };
};

type ExtractValues<T> = T extends object ? T[keyof T] : never;

type GetSelectedTable<TSelectSchemas extends SelectConfig> = ExtractValues<
  ExtractValues<{
    [TSchema in keyof TSelectSchemas]: {
      [TTable in keyof TSelectSchemas[TSchema] as TSelectSchemas[TSchema][TTable] extends true
        ? TTable
        : never]: TSchema extends string
        ? TTable extends string
          ? { id: `${TSchema}.${TTable}`; schema: TSchema; table: TTable }
          : never
        : never;
    };
  }>
>;
//#endregion

//#region transform
type TransformMode = "auto" | "strict" | "unsafe" | undefined;


type TransformOptions<TTransformMode extends TransformMode> = {
  /**
   * The type for defining the transform mode.
   *
   * There are three modes available:
   *
   * - "auto" - Automatically transform the data for any columns, tables or schemas that have not been specified in the config
   * - "strict" - In this mode, Snaplet expects a transformation to be given in the config for every column in the database. If any columns have not been provided in the config, Snaplet will not capture the snapshot, but instead tell you which columns, tables, or schemas have not been given
   * - "unsafe" - This mode copies over values without any transformation. If a transformation is given for a column in the config, the transformation will be used instead
   * @defaultValue "unsafe"
   */
  $mode?: TTransformMode;
  /**
   * If true, parse JSON objects during transformation.
   * @defaultValue false
   */
  $parseJson?: boolean;
};

// This type is here to turn a Table with scalars values (string, number, etc..) for columns into a Table
// with either scalar values or a callback function that returns the scalar value
type ColumnWithCallback<TSchema extends keyof Database, TTable extends keyof Database[TSchema]> = {
  [TColumn in keyof Database[TSchema][TTable]]:
    Database[TSchema][TTable][TColumn] |
    ((ctx: {
      row: Database[TSchema][TTable];
      value: Database[TSchema][TTable][TColumn];
    }) => Database[TSchema][TTable][TColumn])
};

type DatabaseWithCallback = {
  [TSchema in keyof Database]: {
    [TTable in keyof Database[TSchema]]:
      | ((ctx: {
          row: Database[TSchema][TTable];
          rowIndex: number;
        }) => ColumnWithCallback<TSchema, TTable>)
      | ColumnWithCallback<TSchema, TTable>
  };
};

type SelectDatabase<TSelectedTable extends SelectedTable> = {
  [TSchema in keyof DatabaseWithCallback as TSchema extends NonNullable<TSelectedTable>["schema"]
    ? TSchema
    : never]: {
    [TTable in keyof DatabaseWithCallback[TSchema] as TTable extends Extract<
      TSelectedTable,
      { schema: TSchema }
    >["table"]
      ? TTable
      : never]: DatabaseWithCallback[TSchema][TTable];
  };
};

type PartialTransform<T> = T extends (...args: infer P) => infer R
  ? (...args: P) => Partial<R>
  : Partial<T>;

type IsNever<T> = [T] extends [never] ? true : false;

type TransformConfig<
  TTransformMode extends TransformMode,
  TSelectedTable extends SelectedTable
> = TransformOptions<TTransformMode> &
  (IsNever<TSelectedTable> extends true
    ? never
    : SelectDatabase<TSelectedTable> extends infer TSelectedDatabase
    ? TTransformMode extends "strict"
      ? TSelectedDatabase
      : {
          [TSchema in keyof TSelectedDatabase]?: {
            [TTable in keyof TSelectedDatabase[TSchema]]?: PartialTransform<
              TSelectedDatabase[TSchema][TTable]
            >;
          };
        }
    : never);
//#endregion

//#region subset
type NonEmptyArray<T> = [T, ...T[]];

/**
 * Represents an exclusive row limit percent.
 */
type ExclusiveRowLimitPercent =
| {
  percent?: never;
  /**
   * Represents a strict limit of the number of rows captured on target
   */
  rowLimit: number
}
| {
  /**
   * Represents a random percent to be captured on target (1-100)
   */
  percent: number;
  rowLimit?: never
}

// Get the type of a target in the config.subset.targets array
type SubsetTarget<TSelectedTable extends SelectedTable> = {
  /**
   * The ID of the table to target
   */
  table: TSelectedTable["id"];
  /**
   * The order on which your target will be filtered useful with rowLimit parameter
   *
   * @example
   * orderBy: `"User"."createdAt" desc`
   */
  orderBy?: string;
} & (
  | {
    /**
     * The where filter to be applied on the target
     *
     * @example
     * where: `"_prisma_migrations"."name" IN ('migration1', 'migration2')`
     */
    where: string
  } & Partial<ExclusiveRowLimitPercent>
  | {
    /**
     * The where filter to be applied on the target
     */
    where?: string
  } & ExclusiveRowLimitPercent
);

type GetSelectedTableChildrenKeys<TTable extends keyof Tables_relationships> = keyof Tables_relationships[TTable]['children']
type GetSelectedTableParentKeys<TTable extends keyof Tables_relationships> = keyof Tables_relationships[TTable]['parent']
type GetRelationDestinationKey<TTable extends keyof Tables_relationships> = Tables_relationships[TTable]['parentDestinationsTables'] | Tables_relationships[TTable]['childDestinationsTables']
type GetSelectedTableRelationsKeys<TTable extends keyof Tables_relationships> = GetSelectedTableChildrenKeys<TTable> | GetSelectedTableParentKeys<TTable> | GetRelationDestinationKey<TTable>
type SelectedTablesWithRelationsIds<TSelectedTable extends SelectedTable['id']> = TSelectedTable extends keyof Tables_relationships ? TSelectedTable : never

/**
 * Represents the options to choose the followNullableRelations of subsetting.
 */
type FollowNullableRelationsOptions<TSelectedTable extends SelectedTable> =
  // Type can be a global boolean definition
  boolean
  // Or can be a mix of $default and table specific definition
  | {
      $default: boolean |
      {
        [Key in GetSelectedTableRelationsKeys<SelectedTablesWithRelationsIds<TSelectedTable["id"]>> | '$default']?:  boolean
      }
    } & ({
  // If it's a table specific definition and the table has relationships
  [TTable in SelectedTablesWithRelationsIds<TSelectedTable["id"]>]?:
    // It's either a boolean or a mix of $default and relationship specific definition
    boolean |
    {
      [Key in GetSelectedTableRelationsKeys<TTable> | '$default']?:  boolean
    }
});


/**
 * Represents the options to choose the maxCyclesLoop of subsetting.
 */
type MaxCyclesLoopOptions<TSelectedTable extends SelectedTable> =
// Type can be a global number definition
number
// Or can be a mix of $default and table specific definition
| {
    $default: number |
    {
      [Key in GetSelectedTableRelationsKeys<SelectedTablesWithRelationsIds<TSelectedTable["id"]>> | '$default']?:  number
    }
  } & ({
  // If it's a table specific definition and the table has relationships
  [TTable in SelectedTablesWithRelationsIds<TSelectedTable["id"]>]?:
    // It's either a number or a mix of $default and relationship specific definition
    number |
    {
      [Key in GetSelectedTableRelationsKeys<TTable> | '$default']?:  number
    }
});


/**
 * Represents the options to choose the maxChildrenPerNode of subsetting.
 */
type MaxChildrenPerNodeOptions<TSelectedTable extends SelectedTable> =
// Type can be a global number definition
number
// Or can be a mix of $default and table specific definition
| {
    $default: number |
    {
      [Key in GetSelectedTableRelationsKeys<SelectedTablesWithRelationsIds<TSelectedTable["id"]>> | '$default']?:  number
    }
  } & ({
  // If it's a table specific definition and the table has relationships
  [TTable in SelectedTablesWithRelationsIds<TSelectedTable["id"]>]?:
    // It's either a number or a mix of $default and relationship specific definition
    number |
    {
      [Key in GetSelectedTableRelationsKeys<TTable> | '$default']?:  number
    }
});

/**
 * Represents the configuration for subsetting the snapshot.
 */
type SubsetConfig<TSelectedTable extends SelectedTable> = {
  /**
   * Specifies whether subsetting is enabled.
   *  @defaultValue true
   */
  enabled?: boolean;

  /**
   * Specifies the version of the subsetting algorithm
   *
   * @defaultValue "3"
   * @deprecated
   */
  version?: "1" | "2" | "3";

  /**
   * Specifies whether to eagerly load related tables.
   * @defaultValue false
   */
  eager?: boolean;

  /**
   * Specifies whether to keep tables that are not connected to any other tables.
   * @defaultValue false
   */
  keepDisconnectedTables?: boolean;

  /**
   * Specifies whether to follow nullable relations.
   * @defaultValue false
   */
  followNullableRelations?: FollowNullableRelationsOptions<TSelectedTable>;

  /**
   *  Specifies the maximum number of children per node.
   *  @defaultValue unlimited
   */
  maxChildrenPerNode?: MaxChildrenPerNodeOptions<TSelectedTable>;

  /**
   * Specifies the maximum number of cycles in a loop.
   * @defaultValue 10
   */
  maxCyclesLoop?: MaxCyclesLoopOptions<TSelectedTable>;

  /**
   * Specifies the root targets for subsetting. Must be a non-empty array
   */
  targets: NonEmptyArray<SubsetTarget<TSelectedTable>>;

  /**
   * Specifies the task sorting algorithm.
   * By default, the algorithm will not sort the tasks.
   */
  taskSortAlgorithm?: "children" | "idsCount";

  /**
   * Specifies whether to consider all targets collectively ('together'),
   * or one target at a time ('sequential') when the traversal algorithm is
   * determining the next steps.
   *
   * By default, the 'together' will be used.
   */
  traversalMode?: "sequential" | "together";
}
//#endregion


  //#region introspect
  type VirtualForeignKey<
    TTFkTable extends SelectedTable,
    TTargetTable extends SelectedTable
  > =
  {
    fkTable: TTFkTable['id'];
    targetTable: TTargetTable['id'];
    keys: NonEmptyArray<
      {
        // TODO: Find a way to strongly type this to provide autocomplete when writing the config
        /**
         * The column name present in the fkTable that is a foreign key to the targetTable
         */
        fkColumn: string;
        /**
         * The column name present in the targetTable that is a foreign key to the fkTable
         */
        targetColumn: string;
      }
    >
  }

  type IntrospectConfig<TSelectedTable extends SelectedTable> = {
    /**
     * Allows you to declare virtual foreign keys that are not present as foreign keys in the database.
     * But are still used and enforced by the application.
     */
    virtualForeignKeys?: Array<VirtualForeignKey<TSelectedTable, TSelectedTable>>;
  }
  //#endregion

type Validate<T, Target> = {
  [K in keyof T]: K extends keyof Target ? T[K] : never;
};

type TypedConfig<
  TSelectConfig extends SelectConfig,
  TTransformMode extends TransformMode
> =  GetSelectedTable<
  ApplyDefault<TSelectConfig>
> extends SelectedTable
  ? {
    /**
     * Parameter to configure the generation of data.
     * {@link https://docs.snaplet.dev/core-concepts/seed}
     */
      seed?: {
        alias?: import("./snaplet-client").Alias;
        fingerprint?: import("./snaplet-client").Fingerprint;
      }
    /**
     * Parameter to configure the inclusion/exclusion of schemas and tables from the snapshot.
     * {@link https://docs.snaplet.dev/reference/configuration#select}
     */
      select?: Validate<TSelectConfig, SelectConfig>;
      /**
       * Parameter to configure the transformations applied to the data.
       * {@link https://docs.snaplet.dev/reference/configuration#transform}
       */
      transform?: TransformConfig<TTransformMode, GetSelectedTable<ApplyDefault<TSelectConfig>>>;
      /**
       * Parameter to capture a subset of the data.
       * {@link https://docs.snaplet.dev/reference/configuration#subset}
       */
      subset?: SubsetConfig<GetSelectedTable<ApplyDefault<TSelectConfig>>>;

      /**
       * Parameter to augment the result of the introspection of your database.
       * {@link https://docs.snaplet.dev/references/data-operations/introspect}
       */
      introspect?: IntrospectConfig<GetSelectedTable<ApplyDefault<TSelectConfig>>>;
    }
  : never;

declare module "snaplet" {
  class JsonNull {}
  type JsonClass = typeof JsonNull;
  /**
   * Use this value to explicitely set a json or jsonb column to json null instead of the database NULL value.
   */
  export const jsonNull: InstanceType<JsonClass>;
  /**
  * Define the configuration for Snaplet capture process.
  * {@link https://docs.snaplet.dev/reference/configuration}
  */
  export function defineConfig<
    TSelectConfig extends SelectConfig,
    TTransformMode extends TransformMode = undefined
  >(
    config: TypedConfig<TSelectConfig, TTransformMode>
  ): TypedConfig<TSelectConfig, TTransformMode>;
}