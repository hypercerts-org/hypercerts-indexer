export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      allow_list_data: {
        Row: {
          data: Json | null
          id: string
          parsed: boolean | null
          root: string | null
          uri: string | null
        }
        Insert: {
          data?: Json | null
          id?: string
          parsed?: boolean | null
          root?: string | null
          uri?: string | null
        }
        Update: {
          data?: Json | null
          id?: string
          parsed?: boolean | null
          root?: string | null
          uri?: string | null
        }
        Relationships: []
      }
      allow_list_records: {
        Row: {
          entry: number
          hc_allow_list_id: string
          id: string
          units: number
          user_address: string
        }
        Insert: {
          entry: number
          hc_allow_list_id: string
          id?: string
          units: number
          user_address: string
        }
        Update: {
          entry?: number
          hc_allow_list_id?: string
          id?: string
          units?: number
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "allow_list_records_hc_allow_list_id_fkey"
            columns: ["hc_allow_list_id"]
            isOneToOne: false
            referencedRelation: "hypercert_allow_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      attestations: {
        Row: {
          attestation: Json
          attestation_uid: string
          attester_address: string
          block_timestamp: number
          chain_id: number | null
          contract_address: string | null
          decoded_attestation: Json
          id: string
          recipient_address: string
          supported_schemas_id: string
          token_id: number | null
        }
        Insert: {
          attestation: Json
          attestation_uid: string
          attester_address: string
          block_timestamp: number
          chain_id?: number | null
          contract_address?: string | null
          decoded_attestation: Json
          id?: string
          recipient_address: string
          supported_schemas_id: string
          token_id?: number | null
        }
        Update: {
          attestation?: Json
          attestation_uid?: string
          attester_address?: string
          block_timestamp?: number
          chain_id?: number | null
          contract_address?: string | null
          decoded_attestation?: Json
          id?: string
          recipient_address?: string
          supported_schemas_id?: string
          token_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attestations_supported_schemas_id_fkey"
            columns: ["supported_schemas_id"]
            isOneToOne: false
            referencedRelation: "supported_schemas"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          contracts_id: string
          creation_block_timestamp: number | null
          hypercert_id: string | null
          id: string
          last_block_update_timestamp: number | null
          owner_address: string | null
          token_id: number
          type: Database["public"]["Enums"]["token_type"] | null
          units: number | null
          uri: string | null
          value: number | null
        }
        Insert: {
          contracts_id: string
          creation_block_timestamp?: number | null
          hypercert_id?: string | null
          id?: string
          last_block_update_timestamp?: number | null
          owner_address?: string | null
          token_id: number
          type?: Database["public"]["Enums"]["token_type"] | null
          units?: number | null
          uri?: string | null
          value?: number | null
        }
        Update: {
          contracts_id?: string
          creation_block_timestamp?: number | null
          hypercert_id?: string | null
          id?: string
          last_block_update_timestamp?: number | null
          owner_address?: string | null
          token_id?: number
          type?: Database["public"]["Enums"]["token_type"] | null
          units?: number | null
          uri?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_contracts_id_fkey"
            columns: ["contracts_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_events: {
        Row: {
          contract_id: string
          event_id: string
          id: string
          last_block_indexed: number | null
        }
        Insert: {
          contract_id: string
          event_id: string
          id?: string
          last_block_indexed?: number | null
        }
        Update: {
          contract_id?: string
          event_id?: string
          id?: string
          last_block_indexed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_events_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          chain_id: number
          contract_address: string
          id: string
          start_block: number | null
        }
        Insert: {
          chain_id: number
          contract_address: string
          id?: string
          start_block?: number | null
        }
        Update: {
          chain_id?: number
          contract_address?: string
          id?: string
          start_block?: number | null
        }
        Relationships: []
      }
      events: {
        Row: {
          abi: string
          id: string
          name: string
        }
        Insert: {
          abi: string
          id?: string
          name: string
        }
        Update: {
          abi?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      fractions: {
        Row: {
          claims_id: string
          creation_block_timestamp: number | null
          hypercert_id: string | null
          id: string
          last_block_update_timestamp: number | null
          owner_address: string | null
          token_id: number
          type: Database["public"]["Enums"]["token_type"] | null
          units: number | null
          value: number | null
        }
        Insert: {
          claims_id: string
          creation_block_timestamp?: number | null
          hypercert_id?: string | null
          id?: string
          last_block_update_timestamp?: number | null
          owner_address?: string | null
          token_id: number
          type?: Database["public"]["Enums"]["token_type"] | null
          units?: number | null
          value?: number | null
        }
        Update: {
          claims_id?: string
          creation_block_timestamp?: number | null
          hypercert_id?: string | null
          id?: string
          last_block_update_timestamp?: number | null
          owner_address?: string | null
          token_id?: number
          type?: Database["public"]["Enums"]["token_type"] | null
          units?: number | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fractions_claims_id_fkey"
            columns: ["claims_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      hypercert_allow_lists: {
        Row: {
          allow_list_data_id: string
          claims_id: string
          id: string
        }
        Insert: {
          allow_list_data_id: string
          claims_id: string
          id?: string
        }
        Update: {
          allow_list_data_id?: string
          claims_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hypercert_allow_lists_allow_list_data_id_fkey"
            columns: ["allow_list_data_id"]
            isOneToOne: false
            referencedRelation: "allow_list_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hypercert_allow_lists_claims_id_fkey"
            columns: ["claims_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      metadata: {
        Row: {
          allow_list_uri: string | null
          contributors: string[] | null
          description: string | null
          external_url: string | null
          id: string
          image: string | null
          impact_scope: string[] | null
          impact_timeframe_from: number | null
          impact_timeframe_to: number | null
          name: string | null
          properties: Json | null
          rights: string[] | null
          uri: string | null
          work_scope: string[] | null
          work_timeframe_from: number | null
          work_timeframe_to: number | null
        }
        Insert: {
          allow_list_uri?: string | null
          contributors?: string[] | null
          description?: string | null
          external_url?: string | null
          id?: string
          image?: string | null
          impact_scope?: string[] | null
          impact_timeframe_from?: number | null
          impact_timeframe_to?: number | null
          name?: string | null
          properties?: Json | null
          rights?: string[] | null
          uri?: string | null
          work_scope?: string[] | null
          work_timeframe_from?: number | null
          work_timeframe_to?: number | null
        }
        Update: {
          allow_list_uri?: string | null
          contributors?: string[] | null
          description?: string | null
          external_url?: string | null
          id?: string
          image?: string | null
          impact_scope?: string[] | null
          impact_timeframe_from?: number | null
          impact_timeframe_to?: number | null
          name?: string | null
          properties?: Json | null
          rights?: string[] | null
          uri?: string | null
          work_scope?: string[] | null
          work_timeframe_from?: number | null
          work_timeframe_to?: number | null
        }
        Relationships: []
      }
      supported_schemas: {
        Row: {
          chain_id: number
          eas_schema_id: string
          id: string
          last_block_indexed: number | null
          resolver: string | null
          revocable: boolean | null
          schema: string | null
        }
        Insert: {
          chain_id: number
          eas_schema_id: string
          id?: string
          last_block_indexed?: number | null
          resolver?: string | null
          revocable?: boolean | null
          schema?: string | null
        }
        Update: {
          chain_id?: number
          eas_schema_id?: string
          id?: string
          last_block_indexed?: number | null
          resolver?: string | null
          revocable?: boolean | null
          schema?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_missing_allow_list_uris_and_roots: {
        Args: Record<PropertyKey, never>
        Returns: {
          allow_list_id: string
          allow_list_uri: string
          allow_list_root: string
        }[]
      }
      get_attestations_for_claim: {
        Args: {
          claim_id: string
        }
        Returns: {
          id: string
          supported_schemas_id: string
          attestation_uid: string
          chain_id: number
          contract_address: string
          token_id: number
          recipient_address: string
          attester_address: string
          attestation: Json
          decoded_attestation: Json
          block_timestamp: number
        }[]
      }
      get_attested_claims: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          contracts_id: string
          token_id: number
          hypercert_id: string
          creation_block_timestamp: number
          last_block_update_timestamp: number
          owner_address: string
          value: number
          units: number
          uri: string
          type: Database["public"]["Enums"]["token_type"]
        }[]
      }
      get_missing_metadata_uris: {
        Args: Record<PropertyKey, never>
        Returns: {
          missing_uri: string
        }[]
      }
      get_or_create_claim: {
        Args: {
          p_contracts_id: string
          p_token_id: number
        }
        Returns: {
          contracts_id: string
          creation_block_timestamp: number | null
          hypercert_id: string | null
          id: string
          last_block_update_timestamp: number | null
          owner_address: string | null
          token_id: number
          type: Database["public"]["Enums"]["token_type"] | null
          units: number | null
          uri: string | null
          value: number | null
        }
      }
      get_unattested_claims: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          contracts_id: string
          token_id: number
          hypercert_id: string
          creation_block_timestamp: number
          last_block_update_timestamp: number
          owner_address: string
          value: number
          units: number
          uri: string
          type: Database["public"]["Enums"]["token_type"]
        }[]
      }
      search_contract_events: {
        Args: {
          p_chain: number
          p_event: string
        }
        Returns: {
          id: string
          contract_id: string
          contract_address: string
          start_block: number
          event_name: string
          event_abi: string
          last_block_indexed: number
        }[]
      }
      store_allow_list_data_and_hypercert_allow_list_batch: {
        Args: {
          p_allow_list_data: Database["public"]["CompositeTypes"]["allow_list_data_type"][]
        }
        Returns: undefined
      }
      transfer_units_batch: {
        Args: {
          p_transfers: Database["public"]["CompositeTypes"]["transfer_units_type"][]
        }
        Returns: undefined
      }
    }
    Enums: {
      token_type: "claim" | "fraction"
    }
    CompositeTypes: {
      allow_list_data_type: {
        contract_id: string | null
        token_id: number | null
        root: string | null
      }
      transfer_units_type: {
        claim_id: string | null
        from_token_id: number | null
        to_token_id: number | null
        block_timestamp: number | null
        units_transferred: number | null
      }
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

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
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

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
    : never

