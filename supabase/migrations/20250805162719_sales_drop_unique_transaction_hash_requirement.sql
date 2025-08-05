-- Drop the unique constraint first
alter table "public"."sales"
    drop constraint "sales_transactionHash_key";