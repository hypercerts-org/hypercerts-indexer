import { Block } from "chainsauce";
import { Tables } from "@/types/database.types.js";

export type ParserContext = {
  event_name: string;
  chain_id: bigint | number;
  events_id: string;
  contracts_id: string;
  block: Block;
  schema?: Tables<"supported_schemas">;
  dataFetcher?: (args: { uri: string }) => Promise<unknown>;
};

export interface ParserMethod<T> {
  (params: { data: unknown; context: ParserContext }): Promise<T[]>;
}

export interface StorageMethod<T> {
  (params: { data: T[]; context: ParserContext }): Promise<void>;
}

class LogParser<T> {
  parser: ParserMethod<T>;
  storage: StorageMethod<T>;

  constructor(parser: ParserMethod<T>, storage: StorageMethod<T>) {
    this.parser = parser;
    this.storage = storage;
  }

  async parse(data: unknown, context: ParserContext): Promise<void> {
    try {
      const parsed = await this.parser({ data, context });
      await this.storage({ data: parsed, context });
    } catch (error) {
      console.error(
        `[processLogs] Error processing log of ${context.event_name}: ${error}`,
      );
    }
  }
}

export default LogParser;
