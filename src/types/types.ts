export type IndexerConfig = {
  eventName?: string;
  batchSize?: bigint;
};

export type EventToFetch = {
  contracts_id: string;
  contract_address: string;
  events_id: string;
  event_name: string;
  abi: string;
  last_block_indexed: bigint;
  contract_slug: string;
  start_block: bigint;
};

export type NewAllowList = {
  contracts_id: string;
  token_id: bigint | string;
  root: string;
};
