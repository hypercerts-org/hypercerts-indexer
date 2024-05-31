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
      attestations: {
        Row: {
          attestation: Json
          attester: string
          block_timestamp: number
          chain_id: number | null
          claims_id: string | null
          contract_address: string | null
          data: Json
          id: string
          recipient: string
          supported_schemas_id: string
          token_id: number | null
          uid: string
        }
        Insert: {
          attestation: Json
          attester: string
          block_timestamp: number
          chain_id?: number | null
          claims_id?: string | null
          contract_address?: string | null
          data: Json
          id?: string
          recipient: string
          supported_schemas_id: string
          token_id?: number | null
          uid: string
        }
        Update: {
          attestation?: Json
          attester?: string
          block_timestamp?: number
          chain_id?: number | null
          claims_id?: string | null
          contract_address?: string | null
          data?: Json
          id?: string
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
          block_number: number | null
          contracts_id: string
          creator_address: string | null
          hypercert_id: string | null
          id: string
          owner_address: string | null
          token_id: number
          units: number | null
          uri: string | null
          value: number | null
          claim_attestation_count: number | null
        }
        Insert: {
          block_number?: number | null
          contracts_id: string
          creator_address?: string | null
          hypercert_id?: string | null
          id?: string
          owner_address?: string | null
          token_id: number
          units?: number | null
          uri?: string | null
          value?: number | null
        }
        Update: {
          block_number?: number | null
          contracts_id?: string
          creator_address?: string | null
          hypercert_id?: string | null
          id?: string
          owner_address?: string | null
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
          {
            foreignKeyName: "claims_uri_fkey"
            columns: ["uri"]
            isOneToOne: false
            referencedRelation: "metadata"
            referencedColumns: ["uri"]
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
          proof: Json
          units: number
          user_address: string
        }
        Insert: {
          claimed?: boolean
          entry: number
          hypercert_allow_lists_id: string
          id?: string
          leaf?: string
          proof?: Json
          units: number
          user_address: string
        }
        Update: {
          claimed?: boolean
          entry?: number
          hypercert_allow_lists_id?: string
          id?: string
          leaf?: string
          proof?: Json
          units?: number
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "hypercert_allow_list_records_hypercert_allow_lists_id_fkey"
            columns: ["hypercert_allow_lists_id"]
            isOneToOne: false
            referencedRelation: "hypercert_allow_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hypercert_allow_list_records_hypercert_allow_lists_id_fkey"
            columns: ["hypercert_allow_lists_id"]
            isOneToOne: false
            referencedRelation: "hypercert_allowlists_with_claim"
            referencedColumns: ["hypercert_allow_list_id"]
          },
        ]
      }
      hypercert_allow_lists: {
        Row: {
          allow_list_data_id: string | null
          claims_id: string
          id: string
          parsed: boolean | null
          root: string | null
        }
        Insert: {
          allow_list_data_id?: string | null
          claims_id: string
          id?: string
          parsed?: boolean | null
          root?: string | null
        }
        Update: {
          allow_list_data_id?: string | null
          claims_id?: string
          id?: string
          parsed?: boolean | null
          root?: string | null
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
            isOneToOne: true
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hypercert_allow_lists_claims_id_fkey"
            columns: ["claims_id"]
            isOneToOne: true
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
          parsed?: boolean | null
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
          parsed?: boolean | null
          properties?: Json | null
          rights?: string[] | null
          uri?: string | null
          work_scope?: string[] | null
          work_timeframe_from?: number | null
          work_timeframe_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metadata_allow_list_uri_fkey"
            columns: ["allow_list_uri"]
            isOneToOne: false
            referencedRelation: "allow_list_data"
            referencedColumns: ["uri"]
          },
        ]
      }
      supported_schemas: {
        Row: {
          chain_id: number
          id: string
          last_block_indexed: number | null
          resolver: string | null
          revocable: boolean | null
          schema: string | null
          uid: string
        }
        Insert: {
          chain_id: number
          id?: string
          last_block_indexed?: number | null
          resolver?: string | null
          revocable?: boolean | null
          schema?: string | null
          uid: string
        }
        Update: {
          chain_id?: number
          id?: string
          last_block_indexed?: number | null
          resolver?: string | null
          revocable?: boolean | null
          schema?: string | null
          uid?: string
        }
        Relationships: []
      }
    }
    Views: {
      hypercert_allow_list_records_with_token_id: {
        Row: {
          claimed: boolean | null
          entry: number | null
          id: string | null
          leaf: string | null
          token_id: number | null
          user_address: string | null
        }
        Relationships: []
      }
      hypercert_allowlists_with_claim: {
        Row: {
          block_number: number | null
          claim_id: string | null
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
      get_missing_metadata_uris: {
        Args: Record<PropertyKey, never>
        Returns: {
          missing_uri: string
        }[]
      }
      get_or_create_claim:
        | {
            Args: {
              p_chain_id: number
              p_contract_address: string
              p_token_id: number
            }
            Returns: string
          }
        | {
            Args: {
              p_contracts_id: string
              p_token_id: number
            }
            Returns: {
              block_number: number | null
              contracts_id: string
              creator_address: string | null
              hypercert_id: string | null
              id: string
              owner_address: string | null
              token_id: number
              units: number | null
              uri: string | null
              value: number | null
            }
          }
      get_unparsed_hypercert_allow_lists: {
        Args: Record<PropertyKey, never>
        Returns: {
          claim_id: string
          al_data_id: string
          data: Json
        }[]
      }
      store_allow_list_records: {
        Args: {
          _claims_id: string
          _allow_list_data_id: string
          _records: Json[]
        }
        Returns: undefined
      }
      store_fraction: {
        Args: {
          _fractions: Database["public"]["CompositeTypes"]["fraction_type"][]
        }
        Returns: {
          fraction_id: string
        }[]
      }
      store_hypercert_allow_list_roots: {
        Args: {
          p_hc_allow_list_roots: Database["public"]["CompositeTypes"]["hc_allow_list_root_type"][]
        }
        Returns: undefined
      }
      transfer_fractions_batch: {
        Args: {
          p_transfers: Database["public"]["CompositeTypes"]["transfer_fractions_type"][]
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
      [_ in never]: never
    }
    CompositeTypes: {
      fraction_type: {
        claims_id: string | null
        token_id: number | null
        creation_block_timestamp: number | null
        last_block_update_timestamp: number | null
        owner_address: string | null
        value: number | null
      }
      hc_allow_list_root_type: {
        contract_id: string | null
        token_id: number | null
        root: string | null
      }
      transfer_fractions_type: {
        claims_id: string | null
        token_id: number | null
        from_owner_address: string | null
        to_owner_address: string | null
        block_timestamp: number | null
        value: number | null
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

