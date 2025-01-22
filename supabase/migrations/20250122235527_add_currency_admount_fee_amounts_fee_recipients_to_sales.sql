alter table "public"."sales" add column "currency_amount" numeric(78, 0) not null default '0'::numeric(78, 0);

alter table "public"."sales" add column "fee_amounts" numeric(78, 0)[] not null default '{}'::numeric(78, 0)[];

alter table "public"."sales" add column "fee_recipients" text[] not null default '{}'::text[];