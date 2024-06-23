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
      blueprints: {
        Row: {
          admin_id: string
          created_at: string
          display_size: number
          form_values: Json
          id: number
          minter_address: string
          registry_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          display_size?: number
          form_values: Json
          id?: number
          minter_address: string
          registry_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          display_size?: number
          form_values?: Json
          id?: number
          minter_address?: string
          registry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blueprints_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["address"]
          },
          {
            foreignKeyName: "blueprints_registry_id_fkey"
            columns: ["registry_id"]
            isOneToOne: false
            referencedRelation: "registries"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          admin_id: string
          chain_id: number
          created_at: string
          display_size: number
          hypercert_id: string
          id: string
          owner_id: string
          registry_id: string
        }
        Insert: {
          admin_id: string
          chain_id: number
          created_at?: string
          display_size?: number
          hypercert_id: string
          id?: string
          owner_id: string
          registry_id: string
        }
        Update: {
          admin_id?: string
          chain_id?: number
          created_at?: string
          display_size?: number
          hypercert_id?: string
          id?: string
          owner_id?: string
          registry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_registry_id_fkey"
            columns: ["registry_id"]
            isOneToOne: false
            referencedRelation: "registries"
            referencedColumns: ["id"]
          },
        ]
      }
      default_sponsor_metadata: {
        Row: {
          address: string
          companyName: string | null
          created_at: string
          firstName: string | null
          image: string
          lastName: string | null
          type: string
        }
        Insert: {
          address: string
          companyName?: string | null
          created_at?: string
          firstName?: string | null
          image: string
          lastName?: string | null
          type: string
        }
        Update: {
          address?: string
          companyName?: string | null
          created_at?: string
          firstName?: string | null
          image?: string
          lastName?: string | null
          type?: string
        }
        Relationships: []
      }
      fraction_sponsor_metadata: {
        Row: {
          chain_id: number
          companyName: string | null
          created_at: string
          firstName: string | null
          fraction_id: string
          hypercert_id: string
          id: string
          image: string
          lastName: string | null
          strategy: string
          type: string
          value: string
        }
        Insert: {
          chain_id: number
          companyName?: string | null
          created_at?: string
          firstName?: string | null
          fraction_id: string
          hypercert_id: string
          id?: string
          image: string
          lastName?: string | null
          strategy: string
          type: string
          value: string
        }
        Update: {
          chain_id?: number
          companyName?: string | null
          created_at?: string
          firstName?: string | null
          fraction_id?: string
          hypercert_id?: string
          id?: string
          image?: string
          lastName?: string | null
          strategy?: string
          type?: string
          value?: string
        }
        Relationships: []
      }
      hyperboard_registries: {
        Row: {
          created_at: string | null
          hyperboard_id: string
          label: string | null
          registry_id: string
          render_method: string
        }
        Insert: {
          created_at?: string | null
          hyperboard_id: string
          label?: string | null
          registry_id: string
          render_method?: string
        }
        Update: {
          created_at?: string | null
          hyperboard_id?: string
          label?: string | null
          registry_id?: string
          render_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "hyperboard_registries_hyperboard_id_fkey"
            columns: ["hyperboard_id"]
            isOneToOne: false
            referencedRelation: "hyperboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_registries_registries_id_fk"
            columns: ["registry_id"]
            isOneToOne: false
            referencedRelation: "registries"
            referencedColumns: ["id"]
          },
        ]
      }
      hyperboards: {
        Row: {
          admin_id: string
          background_image: string | null
          chain_id: number
          created_at: string | null
          grayscale_images: boolean
          id: string
          name: string
          tile_border_color: string | null
        }
        Insert: {
          admin_id: string
          background_image?: string | null
          chain_id: number
          created_at?: string | null
          grayscale_images?: boolean
          id?: string
          name: string
          tile_border_color?: string | null
        }
        Update: {
          admin_id?: string
          background_image?: string | null
          chain_id?: number
          created_at?: string | null
          grayscale_images?: boolean
          id?: string
          name?: string
          tile_border_color?: string | null
        }
        Relationships: []
      }
      marketplace_order_nonces: {
        Row: {
          address: string
          chain_id: number
          created_at: string
          nonce_counter: number
        }
        Insert: {
          address: string
          chain_id: number
          created_at?: string
          nonce_counter?: number
        }
        Update: {
          address?: string
          chain_id?: number
          created_at?: string
          nonce_counter?: number
        }
        Relationships: []
      }
      marketplace_orders: {
        Row: {
          additionalParameters: string
          amounts: number[]
          chainId: number
          collection: string
          collectionType: number
          createdAt: string
          currency: string
          endTime: number
          globalNonce: string
          id: string
          invalidated: boolean
          itemIds: string[]
          orderNonce: string
          price: string
          quoteType: number
          signature: string
          signer: string
          startTime: number
          strategyId: number
          subsetNonce: number
          validator_codes: number[] | null
        }
        Insert: {
          additionalParameters: string
          amounts: number[]
          chainId: number
          collection: string
          collectionType: number
          createdAt?: string
          currency: string
          endTime: number
          globalNonce: string
          id?: string
          invalidated?: boolean
          itemIds: string[]
          orderNonce: string
          price: string
          quoteType: number
          signature: string
          signer: string
          startTime: number
          strategyId: number
          subsetNonce: number
          validator_codes?: number[] | null
        }
        Update: {
          additionalParameters?: string
          amounts?: number[]
          chainId?: number
          collection?: string
          collectionType?: number
          createdAt?: string
          currency?: string
          endTime?: number
          globalNonce?: string
          id?: string
          invalidated?: boolean
          itemIds?: string[]
          orderNonce?: string
          price?: string
          quoteType?: number
          signature?: string
          signer?: string
          startTime?: number
          strategyId?: number
          subsetNonce?: number
          validator_codes?: number[] | null
        }
        Relationships: []
      }
      registries: {
        Row: {
          admin_id: string
          chain_id: number
          created_at: string
          description: string
          hidden: boolean
          id: string
          name: string
        }
        Insert: {
          admin_id: string
          chain_id: number
          created_at?: string
          description: string
          hidden?: boolean
          id?: string
          name: string
        }
        Update: {
          admin_id?: string
          chain_id?: number
          created_at?: string
          description?: string
          hidden?: boolean
          id?: string
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string
          auth: Json
          created_at: string
          email: string | null
          id: string | null
        }
        Insert: {
          address: string
          auth?: Json
          created_at?: string
          email?: string | null
          id?: string | null
        }
        Update: {
          address?: string
          auth?: Json
          created_at?: string
          email?: string | null
          id?: string | null
        }
        Relationships: []
      }
      zuzalu_donations: {
        Row: {
          address: string
          amount: string | null
          created_at: string
          email: string
          id: number
        }
        Insert: {
          address: string
          amount?: string | null
          created_at?: string
          email: string
          id?: number
        }
        Update: {
          address?: string
          amount?: string | null
          created_at?: string
          email?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_claim_from_blueprint: {
        Args: {
          registry_id: string
          hypercert_id: string
          chain_id: number
          admin_id: string
          owner_id: string
          blueprint_id: number
        }
        Returns: string
      }
      default_sponsor_metadata_by_address: {
        Args: {
          addresses: string[]
        }
        Returns: {
          address: string
          companyName: string | null
          created_at: string
          firstName: string | null
          image: string
          lastName: string | null
          type: string
        }[]
      }
      fraction_sponsor_metadata_by_fraction_id: {
        Args: {
          fractions: string[]
          chain: number
        }
        Returns: {
          chain_id: number
          companyName: string | null
          created_at: string
          firstName: string | null
          fraction_id: string
          hypercert_id: string
          id: string
          image: string
          lastName: string | null
          strategy: string
          type: string
          value: string
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

