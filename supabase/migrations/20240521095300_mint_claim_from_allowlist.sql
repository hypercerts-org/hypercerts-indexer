alter table "public"."hypercert_allow_list_records" add column "claimed" boolean not null default false;

alter table "public"."hypercert_allow_list_records" add column "leaf" text not null default '';

alter table "public"."hypercert_allow_list_records" add column "proof" jsonb not null default '{}'::jsonb;