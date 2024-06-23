create table "public"."sales"
(
    id                         uuid primary key default gen_random_uuid(),
    "creation_block_number"    numeric(78, 0)   not null,
    "creation_block_timestamp" numeric(78, 0)   not null,
    "buyer"                    text             not null,
    "seller"                   text             not null,
    "strategy_id"              numeric(78, 0)   not null,
    "currency"                 text             not null,
    "collection"               text             not null,
    "item_ids"                 numeric(78, 0)[] not null,
    "hypercert_id"             text             not null,
    "amounts"                  numeric(78, 0)[] not null,
    "transaction_hash"         text             not null
);


alter table "public"."sales"
    enable row level security;

CREATE UNIQUE INDEX "sales_transactionHash_key" ON public.sales USING btree ("transaction_hash");

alter table "public"."sales"
    add constraint "sales_transactionHash_key" UNIQUE using index "sales_transactionHash_key";


create policy "Enable read access for all users"
    on "public"."sales"
    as permissive
    for select
    to public
    using (true);

