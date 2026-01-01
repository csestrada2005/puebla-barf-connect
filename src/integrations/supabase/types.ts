export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      coverage_zones: {
        Row: {
          created_at: string
          delivery_fee: number | null
          id: string
          is_active: boolean | null
          postal_code: string | null
          zone_name: string
          zone_type: string | null
        }
        Insert: {
          created_at?: string
          delivery_fee?: number | null
          id?: string
          is_active?: boolean | null
          postal_code?: string | null
          zone_name: string
          zone_type?: string | null
        }
        Update: {
          created_at?: string
          delivery_fee?: number | null
          id?: string
          is_active?: boolean | null
          postal_code?: string | null
          zone_name?: string
          zone_type?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          ai_recommendation: Json | null
          coverage_zone_id: string | null
          created_at: string
          customer_address: string
          customer_name: string
          customer_phone: string
          delivery_date: string | null
          delivery_fee: number | null
          delivery_notes: string | null
          id: string
          items: Json
          order_number: string
          order_type: string | null
          payment_method: string
          payment_status: string | null
          status: string | null
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          ai_recommendation?: Json | null
          coverage_zone_id?: string | null
          created_at?: string
          customer_address: string
          customer_name: string
          customer_phone: string
          delivery_date?: string | null
          delivery_fee?: number | null
          delivery_notes?: string | null
          id?: string
          items?: Json
          order_number: string
          order_type?: string | null
          payment_method: string
          payment_status?: string | null
          status?: string | null
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          ai_recommendation?: Json | null
          coverage_zone_id?: string | null
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_phone?: string
          delivery_date?: string | null
          delivery_fee?: number | null
          delivery_notes?: string | null
          id?: string
          items?: Json
          order_number?: string
          order_type?: string | null
          payment_method?: string
          payment_status?: string | null
          status?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coverage_zone_id_fkey"
            columns: ["coverage_zone_id"]
            isOneToOne: false
            referencedRelation: "coverage_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_days: number | null
          id: string
          image_url: string | null
          images: string[] | null
          is_active: boolean | null
          is_subscription: boolean | null
          name: string
          original_price: number | null
          price: number
          short_description: string | null
          slug: string
          sort_order: number | null
          subscription_discount: number | null
          updated_at: string
          weight_range_max: number | null
          weight_range_min: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_subscription?: boolean | null
          name: string
          original_price?: number | null
          price: number
          short_description?: string | null
          slug: string
          sort_order?: number | null
          subscription_discount?: number | null
          updated_at?: string
          weight_range_max?: number | null
          weight_range_min?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_subscription?: boolean | null
          name?: string
          original_price?: number | null
          price?: number
          short_description?: string | null
          slug?: string
          sort_order?: number | null
          subscription_discount?: number | null
          updated_at?: string
          weight_range_max?: number | null
          weight_range_min?: number | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string
          customer_name: string
          id: string
          image_url: string | null
          is_active: boolean | null
          pet_breed: string | null
          pet_name: string | null
          rating: number | null
        }
        Insert: {
          content: string
          created_at?: string
          customer_name: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          pet_breed?: string | null
          pet_name?: string | null
          rating?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          customer_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          pet_breed?: string | null
          pet_name?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          id: string
          phone: string
          zone_requested: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          phone: string
          zone_requested?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          phone?: string
          zone_requested?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
