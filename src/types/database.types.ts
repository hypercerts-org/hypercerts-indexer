import { MergeDeep } from "type-fest";
import { Database as DatabaseGenerated } from "./database-generated.types";

export type { Json } from "./database-generated.types";

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        supported_schemas: {
          Row: {
            last_block_indexed: bigint | number | string | null | undefined;
          };
          Insert: {
            last_block_indexed: bigint | number | string | null | undefined;
          };
          Update: {
            last_block_indexed: bigint | number | string | null | undefined;
          };
        };
        hypercert_contracts: {
          Row: {
            last_block_indexed: bigint | number | string | null | undefined;
          };
          Insert: {
            last_block_indexed: bigint | number | string | null | undefined;
          };
          Update: {
            last_block_indexed: bigint | number | string | null | undefined;
          };
        };
        attestations: {
          Row: {
            block_timestamp: bigint | number | string | null | undefined;
          };
          Insert: {
            block_timestamp: bigint | number | string | null | undefined;
          };
          Update: {
            block_timestamp: bigint | number | string | null | undefined;
          };
        };
        hypercerts: {
          Row: {
            claim_id: bigint | number | string | null | undefined;
            block_timestamp: bigint | number | string | null | undefined;
          };
          Insert: {
            claim_id: bigint | number | string | null | undefined;
            block_timestamp: bigint | number | string | null | undefined;
          };
          Update: {
            claim_id: bigint | number | string | null | undefined;
            block_timestamp: bigint | number | string | null | undefined;
          };
        };
      };
    };
  }
>;

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;
