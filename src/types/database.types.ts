import { MergeDeep } from "type-fest";
import { Database as DatabaseGenerated } from "./database-generated.types.js";
import type { KyselifyDatabase } from "kysely-supabase";

export type { Json } from "./database-generated.types.js";

export type Database = KyselifyDatabase<SupabaseDatabase>;

// Override the type for a specific column in a view:
export type SupabaseDatabase = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      CompositeTypes: {
        allow_list_data_type: {
          contract_id: string | null;
          token_id: bigint | string | null;
          root: string | null;
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
            chain_id: bigint | number | string;
            token_id: bigint | number | string;
            creation_block_timestamp: bigint | number | string;
            creation_block_number: bigint | number | string;
            last_update_block_number: bigint | number | string;
            last_update_block_timestamp: bigint | number | string;
          };
          Insert: {
            chain_id: bigint | number | string;
            token_id: bigint | number | string;
            creation_block_timestamp: bigint | number | string;
            creation_block_number: bigint | number | string;
            last_update_block_number: bigint | number | string;
            last_update_block_timestamp: bigint | number | string;
          };
          Update: {
            chain_id: bigint | number | string;
            token_id: bigint | number | string;
            creation_block_timestamp: bigint | number | string;
            creation_block_number: bigint | number | string;
            last_update_block_number: bigint | number | string;
            last_update_block_timestamp: bigint | number | string;
          };
        };
        claims: {
          Row: {
            value: bigint | number | string | undefined;
            units: bigint | number | string | undefined;
            token_id: bigint | number | string;
            block_number: bigint | number | string;
          };
          Insert: {
            value: bigint | number | string | null | undefined;
            units: bigint | number | string | null | undefined;
            token_id: bigint | number | string;
            creation_block_timestamp: bigint | number | string;
            creation_block_number: bigint | number | string;
            last_update_block_number: bigint | number | string;
            last_update_block_timestamp: bigint | number | string;
          };
          Update: {
            value: bigint | number | string | null | undefined;
            units: bigint | number | string | null | undefined;
            token_id: bigint | number | string;
            creation_block_timestamp: bigint | number | string;
            creation_block_number: bigint | number | string;
            last_update_block_number: bigint | number | string;
            last_update_block_timestamp: bigint | number | string;
          };
        };
        fractions: {
          Row: {
            value: bigint | number | string | null | undefined;
            units: bigint | number | string | null | undefined;
            token_id: bigint | number | string;
            creation_block_timestamp: bigint | number | string;
            creation_block_number: bigint | number | string;
            last_update_block_number: bigint | number | string;
            last_update_block_timestamp: bigint | number | string;
          };
          Insert: {
            value: bigint | number | string | null | undefined;
            units: bigint | number | string | null | undefined;
            token_id: bigint | number | string;
            creation_block_timestamp: bigint | number | string;
            creation_block_number: bigint | number | string;
            last_update_block_number: bigint | number | string;
            last_update_block_timestamp: bigint | number | string;
          };
          Update: {
            value: bigint | number | string | null | undefined;
            units: bigint | number | string | null | undefined;
            token_id: bigint | number | string;
            creation_block_timestamp: bigint | number | string;
            creation_block_number: bigint | number | string;
            last_update_block_number: bigint | number | string;
            last_update_block_timestamp: bigint | number | string;
          };
        };
        hypercerts: {
          Row: {
            claim_id: bigint | number | string | null;
            creation_block_timestamp: bigint | number | string;
            creation_block_number: bigint | number | string;
            last_update_block_number: bigint | number | string;
            last_update_block_timestamp: bigint | number | string;
          };
          Insert: {
            claim_id: bigint | number | string | null;
            creation_block_timestamp: bigint | number | string;
            creation_block_number: bigint | number | string;
            last_update_block_number: bigint | number | string;
            last_update_block_timestamp: bigint | number | string;
          };
          Update: {
            claim_id: bigint | number | string | null;
            creation_block_timestamp: bigint | number | string;
            creation_block_number: bigint | number | string;
            last_update_block_number: bigint | number | string;
            last_update_block_timestamp: bigint | number | string;
          };
        };
        hypercert_allow_list_records: {
          Row: {
            units: bigint | number | string | null;
          };
          Insert: {
            units: bigint | number | string | null;
          };
          Update: {
            units: bigint | number | string | null;
          };
        };
        metadata: {
          Row: {
            impact_timeframe_from: number | null;
            impact_timeframe_to: number | null;
            work_timeframe_from: number | null;
            work_timeframe_to: number | null;
          };
          Insert: {
            impact_timeframe_from?: number | null;
            impact_timeframe_to?: number | null;
            work_timeframe_from?: number | null;
            work_timeframe_to?: number | null;
          };
          Update: {
            impact_timeframe_from?: number | null;
            impact_timeframe_to?: number | null;
            work_timeframe_from?: number | null;
            work_timeframe_to?: number | null;
          };
        };
        sales: {
          Row: {
            amounts: bigint[] | number[] | string[];
            item_ids: bigint[] | number[] | string[];
            strategy_id: bigint | number | string;
          };
          Insert: {
            amounts: bigint[] | number[] | string[];
            item_ids: bigint[] | number[] | string[];
            strategy_id: bigint | number | string;
          };
          Update: {
            amounts: bigint[] | number[] | string[];
            item_ids: bigint[] | number[] | string[];
            strategy_id: bigint | number | string;
          };
        };
      };
      Views: {
        claimable_fractions_with_proofs: {
          Row: {
            token_id: bigint | string | number | null;
            total_units: bigint | string | number | null;
            units: bigint | string | number | null;
          };
        };
      };
    };
  }
>;

type PublicSchema = SupabaseDatabase[Extract<keyof SupabaseDatabase, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof SupabaseDatabase },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof SupabaseDatabase;
  }
    ? keyof (SupabaseDatabase[PublicTableNameOrOptions["schema"]]["Tables"] &
        SupabaseDatabase[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof SupabaseDatabase }
  ? (SupabaseDatabase[PublicTableNameOrOptions["schema"]]["Tables"] &
      SupabaseDatabase[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof SupabaseDatabase },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof SupabaseDatabase;
  }
    ? keyof SupabaseDatabase[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof SupabaseDatabase }
  ? SupabaseDatabase[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof SupabaseDatabase },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof SupabaseDatabase;
  }
    ? keyof SupabaseDatabase[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof SupabaseDatabase }
  ? SupabaseDatabase[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof SupabaseDatabase },
  EnumName extends PublicEnumNameOrOptions extends {
    schema: keyof SupabaseDatabase;
  }
    ? keyof SupabaseDatabase[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof SupabaseDatabase }
  ? SupabaseDatabase[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
