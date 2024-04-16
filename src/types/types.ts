export type IndexerConfig = {
  eventName?: string;
  batchSize?: bigint;
};

export type NewClaim = {
  creator_address: string;
  contract_address: string;
  token_id: bigint;
  block_timestamp: bigint;
  units: bigint;
  uri: string;
};

export type NewTransfer = {
  contracts_id: string;
  token_id: bigint;
  block_timestamp: bigint;
  value: bigint;
  owner_address: string;
  type: "claim" | "fraction";
};

export type NewUnitTransfer = {
  contracts_id: string;
  from_token_id: bigint;
  to_token_id: bigint;
  block_timestamp: bigint;
  units: bigint;
};

export type NewAllowList = {
  contracts_id: string;
  token_id: bigint;
  root: string;
};
