import { ParserContext } from "@/indexer/LogParser.js";

export type IndexerConfig = {
  chain_id: number;
  delay: number;
  batchSize: bigint;
  context: ParserContext;
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
