import { Block } from "@hypercerts-org/chainsauce";
import { Tables } from "@/types/database.types.js";
import { CompiledQuery } from "kysely";

export type ParserContext = {
  event_name: string;
  chain_id: bigint | number;
  events_id: string;
  contracts_id: string;
  block: Block;
  getData: (args: { uri: string }) => Promise<unknown>;
  readContract: (args: never) => Promise<unknown>;
  schema?: Tables<"supported_schemas">;
};

export interface ParserMethod<T> {
  (params: { event: unknown; context: ParserContext }): Promise<T[]>;
}

export interface StorageMethod<T> {
  (params: { data: T[]; context: ParserContext }): Promise<CompiledQuery[]>;
}

class LogParser<T> {
  parser: ParserMethod<T>;
  storage: StorageMethod<T>;

  constructor(parser: ParserMethod<T>, storage: StorageMethod<T>) {
    this.parser = parser;
    this.storage = storage;
  }

  async parse(event: unknown, context: ParserContext) {
    try {
      const parsed = await this.parser({ event, context });
      return this.storage({ data: parsed, context });
    } catch (error) {
      console.error(
        `[processLogs] Error processing ${context.event_name}: ${error}`,
      );
    }
  }
}

export default LogParser;
