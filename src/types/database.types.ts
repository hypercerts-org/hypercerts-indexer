export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      hypercerts: {
        Row: {
          chain_id: number | null;
          cid: string | null;
          contract_address: string | null;
          contributors: string[] | null;
          description: string | null;
          external_url: string | null;
          id: string;
          image: string | null;
          impact_scope: string[] | null;
          impact_timeframe_from: string | null;
          impact_timeframe_to: string | null;
          name: string | null;
          rights: string[] | null;
          token_id: number | null;
          work_scope: string[] | null;
          work_timeframe_from: string | null;
          work_timeframe_to: string | null;
        };
        Insert: {
          chain_id?: number | null;
          cid?: string | null;
          contract_address?: string | null;
          contributors?: string[] | null;
          description?: string | null;
          external_url?: string | null;
          id?: string;
          image?: string | null;
          impact_scope?: string[] | null;
          impact_timeframe_from?: string | null;
          impact_timeframe_to?: string | null;
          name?: string | null;
          rights?: string[] | null;
          token_id?: number | null;
          work_scope?: string[] | null;
          work_timeframe_from?: string | null;
          work_timeframe_to?: string | null;
        };
        Update: {
          chain_id?: number | null;
          cid?: string | null;
          contract_address?: string | null;
          contributors?: string[] | null;
          description?: string | null;
          external_url?: string | null;
          id?: string;
          image?: string | null;
          impact_scope?: string[] | null;
          impact_timeframe_from?: string | null;
          impact_timeframe_to?: string | null;
          name?: string | null;
          rights?: string[] | null;
          token_id?: number | null;
          work_scope?: string[] | null;
          work_timeframe_from?: string | null;
          work_timeframe_to?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

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
