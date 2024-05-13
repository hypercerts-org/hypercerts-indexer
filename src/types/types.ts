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

export type NewClaim = {
  contracts_id: string;
  creator_address: string;
  contract_address: string;
  token_id: bigint;
  block_timestamp: bigint;
  units: bigint;
  uri: string;
};

export type NewTransfer = {
  contracts_id: string;
  contract_address: string;
  token_id: bigint;
  block_timestamp: bigint;
  block_number: bigint;
  value: bigint;
  owner_address: string;
  type: "claim" | "fraction";
};

export type NewUnitTransfer = {
  contracts_id: string;
  contract_address: string;
  from_token_id: bigint;
  to_token_id: bigint;
  block_timestamp: bigint;
  units: bigint;
};

export type NewAllowList = {
  contracts_id: string;
  token_id: bigint | string;
  root: string;
};
