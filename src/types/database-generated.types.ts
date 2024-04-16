export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      allow_list_data: {
        Row: {
          data: Json | null;
          id: string;
          parsed: boolean | null;
          root: string | null;
          uri: string | null;
        };
        Insert: {
          data?: Json | null;
          id?: string;
          parsed?: boolean | null;
          root?: string | null;
          uri?: string | null;
        };
        Update: {
          data?: Json | null;
          id?: string;
          parsed?: boolean | null;
          root?: string | null;
          uri?: string | null;
        };
        Relationships: [];
      };
      allow_list_records: {
        Row: {
          allow_list_id: string;
          entry: number;
          id: string;
          units: number;
          user_address: string;
        };
        Insert: {
          allow_list_id: string;
          entry: number;
          id?: string;
          units: number;
          user_address: string;
        };
        Update: {
          allow_list_id?: string;
          entry?: number;
          id?: string;
          units?: number;
          user_address?: string;
        };
        Relationships: [
          {
            foreignKeyName: "allow_list_records_allow_list_id_fkey";
            columns: ["allow_list_id"];
            isOneToOne: false;
            referencedRelation: "allow_list_data";
            referencedColumns: ["id"];
          },
        ];
      };
      attestations: {
        Row: {
          attestation: Json;
          attestation_uid: string;
          attester_address: string;
          block_timestamp: number;
          chain_id: number | null;
          contract_address: string | null;
          decoded_attestation: Json;
          id: string;
          recipient_address: string;
          supported_schemas_id: string;
          token_id: number | null;
        };
        Insert: {
          attestation: Json;
          attestation_uid: string;
          attester_address: string;
          block_timestamp: number;
          chain_id?: number | null;
          contract_address?: string | null;
          decoded_attestation: Json;
          id?: string;
          recipient_address: string;
          supported_schemas_id: string;
          token_id?: number | null;
        };
        Update: {
          attestation?: Json;
          attestation_uid?: string;
          attester_address?: string;
          block_timestamp?: number;
          chain_id?: number | null;
          contract_address?: string | null;
          decoded_attestation?: Json;
          id?: string;
          recipient_address?: string;
          supported_schemas_id?: string;
          token_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "attestations_supported_schemas_id_fkey";
            columns: ["supported_schemas_id"];
            isOneToOne: false;
            referencedRelation: "supported_schemas";
            referencedColumns: ["id"];
          },
        ];
      };
      contract_events: {
        Row: {
          contract_id: string;
          event_id: string;
          id: string;
          last_block_indexed: number | null;
        };
        Insert: {
          contract_id: string;
          event_id: string;
          id?: string;
          last_block_indexed?: number | null;
        };
        Update: {
          contract_id?: string;
          event_id?: string;
          id?: string;
          last_block_indexed?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "contract_events_contract_id_fkey";
            columns: ["contract_id"];
            isOneToOne: false;
            referencedRelation: "contracts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contract_events_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      contracts: {
        Row: {
          chain_id: number;
          contract_address: string;
          id: string;
          start_block: number | null;
        };
        Insert: {
          chain_id: number;
          contract_address: string;
          id?: string;
          start_block?: number | null;
        };
        Update: {
          chain_id?: number;
          contract_address?: string;
          id?: string;
          start_block?: number | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          abi: string;
          id: string;
          name: string;
        };
        Insert: {
          abi: string;
          id?: string;
          name: string;
        };
        Update: {
          abi?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      hypercert_allow_lists: {
        Row: {
          allow_list_id: string;
          hypercert_tokens_id: string;
          id: string;
        };
        Insert: {
          allow_list_id: string;
          hypercert_tokens_id: string;
          id?: string;
        };
        Update: {
          allow_list_id?: string;
          hypercert_tokens_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hypercert_allow_lists_allow_list_id_fkey";
            columns: ["allow_list_id"];
            isOneToOne: false;
            referencedRelation: "allow_list_data";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hypercert_allow_lists_hypercert_tokens_id_fkey";
            columns: ["hypercert_tokens_id"];
            isOneToOne: false;
            referencedRelation: "hypercert_tokens";
            referencedColumns: ["id"];
          },
        ];
      };
      hypercert_tokens: {
        Row: {
          contracts_id: string;
          creation_block_timestamp: number | null;
          hypercert_id: string | null;
          id: string;
          last_block_update_timestamp: number | null;
          owner_address: string | null;
          token_id: number;
          type: Database["public"]["Enums"]["token_type"] | null;
          units: number | null;
          uri: string | null;
          value: number | null;
        };
        Insert: {
          contracts_id: string;
          creation_block_timestamp?: number | null;
          hypercert_id?: string | null;
          id?: string;
          last_block_update_timestamp?: number | null;
          owner_address?: string | null;
          token_id: number;
          type?: Database["public"]["Enums"]["token_type"] | null;
          units?: number | null;
          uri?: string | null;
          value?: number | null;
        };
        Update: {
          contracts_id?: string;
          creation_block_timestamp?: number | null;
          hypercert_id?: string | null;
          id?: string;
          last_block_update_timestamp?: number | null;
          owner_address?: string | null;
          token_id?: number;
          type?: Database["public"]["Enums"]["token_type"] | null;
          units?: number | null;
          uri?: string | null;
          value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "hypercert_tokens_contracts_id_fkey";
            columns: ["contracts_id"];
            isOneToOne: false;
            referencedRelation: "contracts";
            referencedColumns: ["id"];
          },
        ];
      };
      metadata: {
        Row: {
          allow_list_uri: string | null;
          contributors: string[] | null;
          description: string | null;
          external_url: string | null;
          id: string;
          image: string | null;
          impact_scope: string[] | null;
          impact_timeframe_from: number | null;
          impact_timeframe_to: number | null;
          name: string | null;
          properties: Json | null;
          rights: string[] | null;
          uri: string | null;
          work_scope: string[] | null;
          work_timeframe_from: number | null;
          work_timeframe_to: number | null;
        };
        Insert: {
          allow_list_uri?: string | null;
          contributors?: string[] | null;
          description?: string | null;
          external_url?: string | null;
          id?: string;
          image?: string | null;
          impact_scope?: string[] | null;
          impact_timeframe_from?: number | null;
          impact_timeframe_to?: number | null;
          name?: string | null;
          properties?: Json | null;
          rights?: string[] | null;
          uri?: string | null;
          work_scope?: string[] | null;
          work_timeframe_from?: number | null;
          work_timeframe_to?: number | null;
        };
        Update: {
          allow_list_uri?: string | null;
          contributors?: string[] | null;
          description?: string | null;
          external_url?: string | null;
          id?: string;
          image?: string | null;
          impact_scope?: string[] | null;
          impact_timeframe_from?: number | null;
          impact_timeframe_to?: number | null;
          name?: string | null;
          properties?: Json | null;
          rights?: string[] | null;
          uri?: string | null;
          work_scope?: string[] | null;
          work_timeframe_from?: number | null;
          work_timeframe_to?: number | null;
        };
        Relationships: [];
      };
      supported_schemas: {
        Row: {
          chain_id: number;
          eas_schema_id: string;
          id: string;
          last_block_indexed: number | null;
          resolver: string | null;
          revocable: boolean | null;
          schema: string | null;
        };
        Insert: {
          chain_id: number;
          eas_schema_id: string;
          id?: string;
          last_block_indexed?: number | null;
          resolver?: string | null;
          revocable?: boolean | null;
          schema?: string | null;
        };
        Update: {
          chain_id?: number;
          eas_schema_id?: string;
          id?: string;
          last_block_indexed?: number | null;
          resolver?: string | null;
          revocable?: boolean | null;
          schema?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      find_missing_allow_list_uris_and_roots: {
        Args: Record<PropertyKey, never>;
        Returns: {
          allow_list_id: string;
          allow_list_uri: string;
          allow_list_root: string;
        }[];
      };
      get_missing_metadata_uris: {
        Args: Record<PropertyKey, never>;
        Returns: {
          missing_uri: string;
        }[];
      };
      search_contract_events: {
        Args: {
          p_chain: number;
          p_event: string;
        };
        Returns: {
          id: string;
          contract_id: string;
          contract_address: string;
          start_block: number;
          event_name: string;
          event_abi: string;
          last_block_indexed: number;
        }[];
      };
      store_allow_list_data_and_hypercert_allow_list: {
        Args: {
          p_contract_id: string;
          p_token_id: number;
          p_root: string;
        };
        Returns: undefined;
      };
      store_claim: {
        Args: {
          p_contracts_id: string;
          p_token_id: number;
          p_block_timestamp: number;
          p_creator: string;
          p_type: Database["public"]["Enums"]["token_type"];
          p_units: number;
          p_uri: string;
        };
        Returns: string;
      };
      transfer_units: {
        Args: {
          p_contracts_id: string;
          p_from_token_id: number;
          p_to_token_id: number;
          p_block_timestamp: number;
          p_units_transferred: number;
        };
        Returns: undefined;
      };
      update_owner_address: {
        Args: {
          p_contracts_id: string;
          p_token_id: number;
          p_owner_address: string;
          p_last_block_update_timestamp: number;
        };
        Returns: undefined;
      };
      upsert_hypercert_token: {
        Args: {
          p_contracts_id: string;
          p_token_id: number;
          p_creation_block_timestamp: number;
          p_last_block_update_timestamp: number;
          p_owner_address: string;
          p_value: number;
          p_type: Database["public"]["Enums"]["token_type"];
        };
        Returns: undefined;
      };
    };
    Enums: {
      token_type: "claim" | "fraction";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey";
            columns: ["bucket_id"];
            isOneToOne: false;
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string;
          name: string;
          owner: string;
          metadata: Json;
        };
        Returns: undefined;
      };
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

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
