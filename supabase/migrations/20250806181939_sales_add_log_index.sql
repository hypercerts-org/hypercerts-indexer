alter table sales add column log_index integer;

alter table sales add constraint sales_log_index_unique unique (transaction_hash, log_index);