export type LogParserContext = {
  event_name: string;
  chain_id: bigint | number;
  events_id: string;
  contracts_id: string;
};

export interface ParserMethod<T> {
  (params: { log: unknown; context: LogParserContext }): Promise<T>;
}

export interface StorageMethod<T> {
  (params: { data: T | T[]; context: LogParserContext }): Promise<void>;
}

export interface LogParser<T> {
  log: unknown;
  parsingMethod: ParserMethod<T>;
  storageMethod: StorageMethod<T>;
  context: LogParserContext;
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
