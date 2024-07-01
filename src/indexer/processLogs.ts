import { Block, Log } from "viem";

export type ParserContext = {
  event_name: string;
  chain_id: bigint | number;
  events_id: string;
  contracts_id: string;
  block: Block;
};

export interface ParserMethod<T> {
  (params: { log: unknown; context: ParserContext }): Promise<T>;
}

export interface StorageMethod<T> {
  (params: { data: T | T[]; context: ParserContext }): Promise<void>;
}

export interface LogParser<T> {
  log: Log;
  parsingMethod: ParserMethod<T>;
  storageMethod: StorageMethod<T>;
  context: ParserContext;
}

export const processLogs = async <T>({
  log,
  parsingMethod,
  storageMethod,
  context,
}: LogParser<T>) => {
  // Process each chunk one by one
  try {
    const parsed = await parsingMethod({ log, context });
    await storageMethod({ data: parsed, context });
  } catch (error) {
    // TODO more refined error handling
    console.error(`[processLogs] Error processing logs: ${error}`);
  }
};
