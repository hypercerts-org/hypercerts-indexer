import { LogParserContext } from "@/indexer/processLogs.js";

export type IndexerConfig = {
  batchSize?: bigint;
  context: LogParserContext;
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
