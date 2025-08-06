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
      blueprint_admins: {
        Row: {
          blueprint_id: number
          created_at: string
          user_id: string
        }
        Insert: {
          blueprint_id: number
          created_at?: string
          user_id: string
        }
        Update: {
          blueprint_id?: number
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blueprint_admins_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_admins_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints_with_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blueprints: {
        Row: {
          created_at: string
          form_values: Json
          hypercert_ids: string[]
          id: number
          minted: boolean
          minter_address: string
        }
        Insert: {
          created_at?: string
          form_values: Json
          hypercert_ids?: string[]
          id?: number
          minted?: boolean
          minter_address: string
        }
        Update: {
          created_at?: string
          form_values?: Json
          hypercert_ids?: string[]
          id?: number
          minted?: boolean
          minter_address?: string
        }
        Relationships: []
      }
      collection_admins: {
        Row: {
          collection_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_admins_admin_address_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_admins_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_admins_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_with_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_blueprints: {
        Row: {
          blueprint_id: number
          collection_id: string
          created_at: string
        }
        Insert: {
          blueprint_id: number
          collection_id: string
          created_at?: string
        }
        Update: {
          blueprint_id?: number
          collection_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_blueprints_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_blueprints_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints_with_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_blueprints_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_blueprints_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_with_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          chain_ids: number[]
          created_at: string
          description: string
          hidden: boolean
          id: string
          name: string
        }
        Insert: {
          chain_ids: number[]
          created_at?: string
          description: string
          hidden?: boolean
          id?: string
          name: string
        }
        Update: {
          chain_ids?: number[]
          created_at?: string
          description?: string
          hidden?: boolean
          id?: string
          name?: string
        }
        Relationships: []
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
      hyperboard_admins: {
        Row: {
          created_at: string
          hyperboard_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hyperboard_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          hyperboard_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hyperboard_admins_admin_address_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_admins_hyperboard_id_fkey"
            columns: ["hyperboard_id"]
            isOneToOne: false
            referencedRelation: "hyperboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_admins_hyperboard_id_fkey"
            columns: ["hyperboard_id"]
            isOneToOne: false
            referencedRelation: "hyperboards_with_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      hyperboard_blueprint_metadata: {
        Row: {
          blueprint_id: number
          collection_id: string
          created_at: string
          display_size: number | null
          hyperboard_id: string
        }
        Insert: {
          blueprint_id: number
          collection_id: string
          created_at?: string
          display_size?: number | null
          hyperboard_id: string
        }
        Update: {
          blueprint_id?: number
          collection_id?: string
          created_at?: string
          display_size?: number | null
          hyperboard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hyperboard_blueprint_metadata_collection_id_blueprint_id_fkey"
            columns: ["collection_id", "blueprint_id"]
            isOneToOne: false
            referencedRelation: "collection_blueprints"
            referencedColumns: ["collection_id", "blueprint_id"]
          },
          {
            foreignKeyName: "hyperboard_blueprint_metadata_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_blueprint_metadata_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_with_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_blueprint_metadata_hyperboard_id_fkey"
            columns: ["hyperboard_id"]
            isOneToOne: false
            referencedRelation: "hyperboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_blueprint_metadata_hyperboard_id_fkey"
            columns: ["hyperboard_id"]
            isOneToOne: false
            referencedRelation: "hyperboards_with_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      hyperboard_collections: {
        Row: {
          collection_id: string
          created_at: string | null
          hyperboard_id: string
          label: string | null
          render_method: string
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          hyperboard_id: string
          label?: string | null
          render_method?: string
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          hyperboard_id?: string
          label?: string | null
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
            foreignKeyName: "hyperboard_registries_hyperboard_id_fkey"
            columns: ["hyperboard_id"]
            isOneToOne: false
            referencedRelation: "hyperboards_with_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_registries_registries_id_fk"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_registries_registries_id_fk"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_with_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      hyperboard_hypercert_metadata: {
        Row: {
          collection_id: string
          created_at: string
          display_size: number | null
          hyperboard_id: string
          hypercert_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          display_size?: number | null
          hyperboard_id: string
          hypercert_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          display_size?: number | null
          hyperboard_id?: string
          hypercert_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hyperboard_hypercert_metadata_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_hypercert_metadata_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_with_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_hypercert_metadata_hyperboard_id_fkey"
            columns: ["hyperboard_id"]
            isOneToOne: false
            referencedRelation: "hyperboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_hypercert_metadata_hyperboard_id_fkey"
            columns: ["hyperboard_id"]
            isOneToOne: false
            referencedRelation: "hyperboards_with_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hyperboard_hypercert_metadata_hypercert_id_collection_id_fkey"
            columns: ["hypercert_id", "collection_id"]
            isOneToOne: false
            referencedRelation: "hypercerts"
            referencedColumns: ["hypercert_id", "collection_id"]
          },
        ]
      }
      hyperboards: {
        Row: {
          background_image: string | null
          chain_ids: number[]
          created_at: string | null
          grayscale_images: boolean
          id: string
          name: string
          tile_border_color: string | null
        }
        Insert: {
          background_image?: string | null
          chain_ids: number[]
          created_at?: string | null
          grayscale_images?: boolean
          id?: string
          name: string
          tile_border_color?: string | null
        }
        Update: {
          background_image?: string | null
          chain_ids?: number[]
          created_at?: string | null
          grayscale_images?: boolean
          id?: string
          name?: string
          tile_border_color?: string | null
        }
        Relationships: []
      }
      hypercerts: {
        Row: {
          collection_id: string
          created_at: string
          hypercert_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          hypercert_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          hypercert_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_registry_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_registry_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_with_admins"
            referencedColumns: ["id"]
          },
        ]
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
          hypercert_id: string
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
          hypercert_id?: string
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
          hypercert_id?: string
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
      signature_requests: {
        Row: {
          chain_id: number
          message: Json
          message_hash: string
          purpose: Database["public"]["Enums"]["signature_request_purpose_enum"]
          safe_address: string
          status: Database["public"]["Enums"]["signature_request_status_enum"]
          timestamp: number
        }
        Insert: {
          chain_id: number
          message: Json
          message_hash: string
          purpose?: Database["public"]["Enums"]["signature_request_purpose_enum"]
          safe_address: string
          status?: Database["public"]["Enums"]["signature_request_status_enum"]
          timestamp?: number
        }
        Update: {
          chain_id?: number
          message?: Json
          message_hash?: string
          purpose?: Database["public"]["Enums"]["signature_request_purpose_enum"]
          safe_address?: string
          status?: Database["public"]["Enums"]["signature_request_status_enum"]
          timestamp?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string
          avatar: string | null
          chain_id: number
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          address: string
          avatar?: string | null
          chain_id: number
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Update: {
          address?: string
          avatar?: string | null
          chain_id?: number
          created_at?: string
          display_name?: string | null
          id?: string
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
      blueprints_with_admins: {
        Row: {
          admin_address: string | null
          admin_chain_id: number | null
          avatar: string | null
          created_at: string | null
          display_name: string | null
          form_values: Json | null
          hypercert_ids: string[] | null
          id: number | null
          minted: boolean | null
          minter_address: string | null
        }
        Relationships: []
      }
      collections_with_admins: {
        Row: {
          admin_address: string | null
          admin_chain_id: number | null
          avatar: string | null
          chain_ids: number[] | null
          created_at: string | null
          description: string | null
          display_name: string | null
          hidden: boolean | null
          id: string | null
          name: string | null
        }
        Relationships: []
      }
      hyperboards_with_admins: {
        Row: {
          admin_address: string | null
          admin_chain_id: number | null
          avatar: string | null
          background_image: string | null
          chain_ids: number[] | null
          created_at: string | null
          display_name: string | null
          grayscale_images: boolean | null
          id: string | null
          name: string | null
          tile_border_color: string | null
        }
        Relationships: []
      }
    }
    Functions: {
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
      signature_request_purpose_enum:
        | "update_user_data"
        | "create_marketplace_order"
      signature_request_status_enum: "pending" | "executed" | "canceled"
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

