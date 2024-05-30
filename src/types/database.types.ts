import { MergeDeep } from "type-fest";
import { Database as DatabaseGenerated } from "./database-generated.types";

export type { Json } from "./database-generated.types";

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      CompositeTypes: {
        allow_list_data_type: {
          contract_id: string | null;
          token_id: bigint | string | null;
          root: string | null;
        };
        fraction_type: {
          contract_id: string | null;
          token_id: bigint | string | null;
          value: bigint | string | null;
          creation_block_timestamp: bigint | string | null;
          last_block_update_timestamp: bigint | string | null;
        };
        transfer_units_type: {
          claim_id: string | null;
          from_token_id: bigint | string | null;
          to_token_id: bigint | string | null;
          block_timestamp: number | null;
          units_transferred: bigint | string | null;
        };
      };
      Functions: {
        get_or_create_claim: {
          Args: {
            p_token_id: bigint | string;
          };
          Returns: {
            token_id: bigint | string;
          };
        };
        store_claim: {
          Args: {
            p_token_id: bigint | string;
            p_block_timestamp: bigint | number | string;
            p_units: bigint | string;
          };
        };
        upsert_fraction: {
          Args: {
            p_token_id: bigint | string;
            p_creation_block_timestamp: bigint | number | string;
            p_last_block_update_timestamp: bigint | number | string;
            p_value: bigint | string;
          };
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
        claims: {
          Row: {
            value: bigint | number | string | null | undefined;
            units: bigint | number | string | null | undefined;
            token_id: bigint | number | string;
            block_number: bigint | number | string;
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
        fractions: {
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
