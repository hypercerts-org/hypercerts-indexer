import { MergeDeep } from "type-fest";
import { Database as DatabaseGenerated } from "./database-generated.types";

export type { Json } from "./database-generated.types";

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Functions: {
        store_allow_list_data_and_hypercert_allow_list: {
          Args: {
            p_token_id: bigint | number | string;
          };
        };
        store_claim: {
          Args: {
            p_token_id: bigint | number | string;
            p_block_timestamp: bigint | number | string;
            p_units: bigint | number | string;
          };
        };
        transfer_units: {
          Args: {
            p_from_token_id: bigint | number | string;
            p_to_token_id: bigint | number | string;
            p_block_timestamp: bigint | number | string;
            p_units_transferred: bigint | number | string;
          };
        };
        upsert_hypercert_token: {
          Args: {
            p_token_id: bigint | number | string;
            p_creation_block_timestamp: bigint | number | string;
            p_last_block_update_timestamp: bigint | number | string;
            p_value: bigint | number | string;
          };
        };
      };
      update_owner_address: {
        Args: {
          p_last_block_update_timestamp: bigint | number | string;
          p_token_id: bigint | number | string;
        };
      };
      Tables: {
        contract_events: {
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
        contracts: {
          Row: {
            last_block_indexed: bigint | number | string | null | undefined;
          };
          Insert: {
            last_block_indexed: bigint | number | string | null;
          };
          Update: {
            last_block_indexed: bigint | number | string | null;
          };
        };
        attestations: {
          Row: {
            chain_id: bigint | number | string | null;
            token_id: bigint | number | string;
            block_timestamp: bigint | number | string;
          };
          Insert: {
            chain_id: bigint | number | string | null;
            token_id: bigint | number | string;
            block_timestamp: bigint | number | string;
          };
          Update: {
            chain_id: bigint | number | string | null;
            token_id: bigint | number | string;
            block_timestamp: bigint | number | string;
          };
        };
        hypercert_tokens: {
          Row: {
            value: bigint | number | string | null | undefined;
            units: bigint | number | string | null | undefined;
            token_id: bigint | number | string;
            creation_block_timestamp: bigint | number | string;
            last_block_update_timestamp: bigint | number | string;
          };
          Insert: {
            value: bigint | number | string | null | undefined;
            units: bigint | number | string | null | undefined;
            token_id: bigint | number | string;
            creation_block_timestamp:
              | bigint
              | number
              | string
              | null
              | undefined;
            last_block_update_timestamp: bigint | number | string;
          };
          Update: {
            value: bigint | number | string | null | undefined;
            units: bigint | number | string | null | undefined;
            token_id: bigint | number | string;
            creation_block_timestamp: bigint | number | string | null;
            last_block_update_timestamp: bigint | number | string;
          };
        };
      };
      hypercerts: {
        Row: {
          claim_id: bigint | number | string | null;
          block_timestamp: bigint | number | string | null;
        };
        Insert: {
          claim_id: bigint | number | string | null;
          block_timestamp: bigint | number | string | null;
        };
        Update: {
          claim_id: bigint | number | string | null;
          block_timestamp: bigint | number | string | null;
        };
      };
    };
  }
>;

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
