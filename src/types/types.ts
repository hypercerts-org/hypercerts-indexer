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

export type NewTransfer = {
  contracts_id: string;
  contract_address: string;
  token_id: bigint;
  block_timestamp: bigint;
  block_number: bigint;
  value: bigint;
  from_owner_address: string;
  to_owner_address: string;
  type: "claim" | "fraction";
};

export type NewUnitTransfer = {
  contracts_id: string;
  contract_address: string;
  from_token_id: bigint;
  to_token_id: bigint;
  last_update_block_timestamp: bigint;
  last_update_block_number: bigint;
  units: bigint;
};

export type NewAllowList = {
  contracts_id: string;
  token_id: bigint | string;
  root: string;
};
