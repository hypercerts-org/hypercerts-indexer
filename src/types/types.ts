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

export type LeafClaimed = {
  contracts_id: string;
  creator_address: string;
  contract_address: string;
  creation_block_number: bigint;
  creation_block_timestamp: bigint;
  token_id: bigint;
  leaf: string;
};

export type NewAllowList = {
  contracts_id: string;
  token_id: bigint | string;
  root: string;
};
