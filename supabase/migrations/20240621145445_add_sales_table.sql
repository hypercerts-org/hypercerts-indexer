create table "public"."sales"
(
    "created_at"      timestamp with time zone not null default now(),
    "buyer"           text                     not null,
    "seller"          text                     not null,
    "strategy_id"     numeric                  not null,
    "currency"        text                     not null,
    "collection"      text                     not null,
    "itemIds"         numeric[]                not null,
    "hypercert_id"    text                     not null,
    "amounts"         numeric[]                not null,
    "transactionHash" text                     not null
);


alter table "public"."sales"
    enable row level security;

alter table "public"."contracts"
    add column "contract_slug" text not null default '';

alter table "public"."events"
    add column "contract_slug" text not null default '';

CREATE UNIQUE INDEX sales_pkey ON public.sales USING btree ("transactionHash");

CREATE UNIQUE INDEX "sales_transactionHash_key" ON public.sales USING btree ("transactionHash");

alter table "public"."sales"
    add constraint "sales_pkey" PRIMARY KEY using index "sales_pkey";

alter table "public"."sales"
    add constraint "sales_transactionHash_key" UNIQUE using index "sales_transactionHash_key";


create policy "Enable read access for all users"
    on "public"."sales"
    as permissive
    for select
    to public
    using (true);

