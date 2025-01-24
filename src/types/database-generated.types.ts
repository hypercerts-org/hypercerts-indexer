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
          parsed: boolean | null
          root: string | null
          uri: string
        }
        Insert: {
          data?: Json | null
          parsed?: boolean | null
          root?: string | null
          uri: string
        }
        Update: {
          data?: Json | null
          parsed?: boolean | null
          root?: string | null
          uri?: string
        }
        Relationships: []
      }
      attestations: {
        Row: {
          attestation: Json
          attester: string
          chain_id: number | null
          claims_id: string | null
          contract_address: string | null
          creation_block_number: number
          creation_block_timestamp: number
          data: Json
          id: string
          last_update_block_number: number
          last_update_block_timestamp: number
          recipient: string
          supported_schemas_id: string
          token_id: number | null
          uid: string
        }
        Insert: {
          attestation: Json
          attester: string
          chain_id?: number | null
          claims_id?: string | null
          contract_address?: string | null
          creation_block_number: number
          creation_block_timestamp: number
          data: Json
          id?: string
          last_update_block_number: number
          last_update_block_timestamp: number
          recipient: string
          supported_schemas_id: string
          token_id?: number | null
          uid: string
        }
        Update: {
          attestation?: Json
          attester?: string
          chain_id?: number | null
          claims_id?: string | null
          contract_address?: string | null
          creation_block_number?: number
          creation_block_timestamp?: number
          data?: Json
          id?: string
          last_update_block_number?: number
          last_update_block_timestamp?: number
          recipient?: string
          supported_schemas_id?: string
          token_id?: number | null
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "attestations_claims_id_fkey"
            columns: ["claims_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attestations_claims_id_fkey"
            columns: ["claims_id"]
            isOneToOne: false
            referencedRelation: "hypercert_allowlists_with_claim"
            referencedColumns: ["claim_id"]
          },
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
          attestations_count: number | null
          contracts_id: string
          creation_block_number: number
          creation_block_timestamp: number
          creator_address: string | null
          hypercert_id: string | null
          id: string
          last_update_block_number: number
          last_update_block_timestamp: number
          owner_address: string | null
          sales_count: number | null
          token_id: number
          units: number | null
          uri: string | null
          value: number | null
          claim_attestation_count: number | null
        }
        Insert: {
          attestations_count?: number | null
          contracts_id: string
          creation_block_number: number
          creation_block_timestamp: number
          creator_address?: string | null
          hypercert_id?: string | null
          id?: string
          last_update_block_number: number
          last_update_block_timestamp: number
          owner_address?: string | null
          sales_count?: number | null
          token_id: number
          units?: number | null
          uri?: string | null
          value?: number | null
        }
        Update: {
          attestations_count?: number | null
          contracts_id?: string
          creation_block_number?: number
          creation_block_timestamp?: number
          creator_address?: string | null
          hypercert_id?: string | null
          id?: string
          last_update_block_number?: number
          last_update_block_timestamp?: number
          owner_address?: string | null
          sales_count?: number | null
          token_id?: number
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
          contracts_id: string
          events_id: string
          last_block_indexed: number | null
        }
        Insert: {
          contracts_id: string
          events_id: string
          last_block_indexed?: number | null
        }
        Update: {
          contracts_id?: string
          events_id?: string
          last_block_indexed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_events_contracts_id_fkey"
            columns: ["contracts_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_events_events_id_fkey"
            columns: ["events_id"]
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
          contract_slug: string
          id: string
          start_block: number | null
        }
        Insert: {
          chain_id: number
          contract_address: string
          contract_slug: string
          id?: string
          start_block?: number | null
        }
        Update: {
          chain_id?: number
          contract_address?: string
          contract_slug?: string
          id?: string
          start_block?: number | null
        }
        Relationships: []
      }
      events: {
        Row: {
          abi: string
          contract_slug: string
          id: string
          name: string
        }
        Insert: {
          abi: string
          contract_slug: string
          id?: string
          name: string
        }
        Update: {
          abi?: string
          contract_slug?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      fractions: {
        Row: {
          claims_id: string
          creation_block_number: number
          creation_block_timestamp: number
          fraction_id: string | null
          id: string
          last_update_block_number: number
          last_update_block_timestamp: number
          owner_address: string | null
          token_id: number
          units: number | null
          value: number | null
        }
        Insert: {
          claims_id: string
          creation_block_number: number
          creation_block_timestamp: number
          fraction_id?: string | null
          id?: string
          last_update_block_number: number
          last_update_block_timestamp: number
          owner_address?: string | null
          token_id: number
          units?: number | null
          value?: number | null
        }
        Update: {
          claims_id?: string
          creation_block_number?: number
          creation_block_timestamp?: number
          fraction_id?: string | null
          id?: string
          last_update_block_number?: number
          last_update_block_timestamp?: number
          owner_address?: string | null
          token_id?: number
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
          {
            foreignKeyName: "fractions_claims_id_fkey"
            columns: ["claims_id"]
            isOneToOne: false
            referencedRelation: "hypercert_allowlists_with_claim"
            referencedColumns: ["claim_id"]
          },
        ]
      }
      hypercert_allow_list_records: {
        Row: {
          claimed: boolean
          entry: number
          hypercert_allow_lists_id: string
          id: string
          leaf: string
          proof: string[]
          units: number
          user_address: string
        }
        Insert: {
          claimed: boolean
          entry: number
          hypercert_allow_lists_id: string
          id?: string
          leaf: string
          proof: string[]
          units: number
          user_address: string
        }
        Update: {
          claimed?: boolean
          entry?: number
          hypercert_allow_lists_id?: string
          id?: string
          leaf?: string
          proof?: string[]
          units?: number
          user_address?: string
        }
        Relationships: []
      }
      hypercert_allow_lists: {
        Row: {
          allow_list_data_uri: string
          claims_id: string
          id: string
          parsed: boolean | null
        }
        Insert: {
          allow_list_data_uri: string
          claims_id: string
          id?: string
          parsed?: boolean | null
        }
        Update: {
          allow_list_data_uri?: string
          claims_id?: string
          id?: string
          parsed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hypercert_allow_lists_claims_id_fkey"
            columns: ["claims_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hypercert_allow_lists_claims_id_fkey"
            columns: ["claims_id"]
            isOneToOne: false
            referencedRelation: "hypercert_allowlists_with_claim"
            referencedColumns: ["claim_id"]
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
          parsed: boolean | null
          properties: string | null
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
          parsed?: boolean | null
          properties?: string | null
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
          parsed?: boolean | null
          properties?: string | null
          rights?: string[] | null
          uri?: string | null
          work_scope?: string[] | null
          work_timeframe_from?: number | null
          work_timeframe_to?: number | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          amounts: number[]
          buyer: string
          collection: string
          creation_block_number: number
          creation_block_timestamp: number
          currency: string
          currency_amount: number
          fee_amounts: number[]
          fee_recipients: string[]
          hypercert_id: string
          id: string
          item_ids: number[]
          seller: string
          strategy_id: number
          transaction_hash: string
        }
        Insert: {
          amounts: number[]
          buyer: string
          collection: string
          creation_block_number: number
          creation_block_timestamp: number
          currency: string
          currency_amount?: number
          fee_amounts?: number[]
          fee_recipients?: string[]
          hypercert_id: string
          id?: string
          item_ids: number[]
          seller: string
          strategy_id: number
          transaction_hash: string
        }
        Update: {
          amounts?: number[]
          buyer?: string
          collection?: string
          creation_block_number?: number
          creation_block_timestamp?: number
          currency?: string
          currency_amount?: number
          fee_amounts?: number[]
          fee_recipients?: string[]
          hypercert_id?: string
          id?: string
          item_ids?: number[]
          seller?: string
          strategy_id?: number
          transaction_hash?: string
        }
        Relationships: []
      }
      supported_schemas: {
        Row: {
          chain_id: number
          id: string
          resolver: string | null
          revocable: boolean | null
          schema: string | null
          uid: string
        }
        Insert: {
          chain_id: number
          id?: string
          resolver?: string | null
          revocable?: boolean | null
          schema?: string | null
          uid: string
        }
        Update: {
          chain_id?: number
          id?: string
          resolver?: string | null
          revocable?: boolean | null
          schema?: string | null
          uid?: string
        }
        Relationships: []
      }
    }
    Views: {
      claimable_fractions_with_proofs: {
        Row: {
          chain_id: number | null
          claimed: boolean | null
          entry: number | null
          hypercert_allow_lists_id: string | null
          hypercert_id: string | null
          id: string | null
          leaf: string | null
          proof: string[] | null
          root: string | null
          token_id: number | null
          total_units: number | null
          units: number | null
          user_address: string | null
        }
        Relationships: []
      }
      fractions_view: {
        Row: {
          claims_id: string | null
          creation_block_number: number | null
          creation_block_timestamp: number | null
          fraction_id: string | null
          hypercert_id: string | null
          id: string | null
          last_update_block_number: number | null
          last_update_block_timestamp: number | null
          owner_address: string | null
          token_id: number | null
          units: number | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fractions_claims_id_fkey"
            columns: ["claims_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fractions_claims_id_fkey"
            columns: ["claims_id"]
            isOneToOne: false
            referencedRelation: "hypercert_allowlists_with_claim"
            referencedColumns: ["claim_id"]
          },
        ]
      }
      hypercert_allowlists_with_claim: {
        Row: {
          claim_id: string | null
          creation_block_number: number | null
          hypercert_allow_list_id: string | null
          hypercert_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_attestation_count: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      get_or_create_claim: {
        Args: {
          p_chain_id: number
          p_contract_address: string
          p_token_id: number
          p_creation_block_number: number
          p_creation_block_timestamp: number
          p_last_update_block_number: number
          p_last_update_block_timestamp: number
        }
        Returns: string
      }
      get_or_create_hypercert_allow_list: {
        Args: {
          p_claim_id: string
          p_allow_list_data_uri: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
          user_metadata: Json | null
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
          user_metadata?: Json | null
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
          user_metadata?: Json | null
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
          user_metadata: Json | null
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
          user_metadata?: Json | null
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
          user_metadata?: Json | null
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
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

