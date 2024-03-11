export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
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
      hypercert_contracts: {
        Row: {
          chain_id: number;
          contract_address: string;
          id: string;
          last_block_indexed: number | null;
        };
        Insert: {
          chain_id: number;
          contract_address: string;
          id?: string;
          last_block_indexed?: number | null;
        };
        Update: {
          chain_id?: number;
          contract_address?: string;
          id?: string;
          last_block_indexed?: number | null;
        };
        Relationships: [];
      };
      hypercerts: {
        Row: {
          block_timestamp: number;
          claim_id: number;
          contributors: string[] | null;
          description: string | null;
          external_url: string | null;
          hypercert_contracts_id: string;
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
          name_description: Record<string, unknown> | null;
          work_impact_scopes: Record<string, unknown> | null;
        };
        Insert: {
          block_timestamp: number;
          claim_id: number;
          contributors?: string[] | null;
          description?: string | null;
          external_url?: string | null;
          hypercert_contracts_id: string;
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
          block_timestamp?: number;
          claim_id?: number;
          contributors?: string[] | null;
          description?: string | null;
          external_url?: string | null;
          hypercert_contracts_id?: string;
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
        Relationships: [
          {
            foreignKeyName: "hypercerts_hypercert_contracts_id_fkey";
            columns: ["hypercert_contracts_id"];
            isOneToOne: false;
            referencedRelation: "hypercert_contracts";
            referencedColumns: ["id"];
          },
        ];
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
      name_description: {
        Args: {
          "": unknown;
        };
        Returns: Record<string, unknown>;
      };
      work_impact_scopes: {
        Args: {
          "": unknown;
        };
        Returns: Record<string, unknown>;
      };
    };
    Enums: {
      [_ in never]: never;
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
        Returns: unknown;
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
}

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

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
