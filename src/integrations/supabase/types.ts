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
      cancellations: {
        Row: {
          created_at: string
          dog_profile_id: string | null
          id: string
          reason: string
          reason_details: string | null
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dog_profile_id?: string | null
          id?: string
          reason: string
          reason_details?: string | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dog_profile_id?: string | null
          id?: string
          reason?: string
          reason_details?: string | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cancellations_dog_profile_id_fkey"
            columns: ["dog_profile_id"]
            isOneToOne: false
            referencedRelation: "dog_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
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
      deliveries: {
        Row: {
          amount_kg: number | null
          contents_summary: string | null
          created_at: string
          delivery_date: string
          id: string
          status: string | null
          subscription_id: string
          tracking_notes: string | null
          updated_at: string
        }
        Insert: {
          amount_kg?: number | null
          contents_summary?: string | null
          created_at?: string
          delivery_date: string
          id?: string
          status?: string | null
          subscription_id: string
          tracking_notes?: string | null
          updated_at?: string
        }
        Update: {
          amount_kg?: number | null
          contents_summary?: string | null
          created_at?: string
          delivery_date?: string
          id?: string
          status?: string | null
          subscription_id?: string
          tracking_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      dog_profiles: {
        Row: {
          activity_level: string
          age_stage: string
          birthday: string | null
          body_condition: string
          created_at: string
          daily_grams: number
          goal: string
          id: string
          image_url: string | null
          name: string
          recommended_plan_type: string
          recommended_protein: string
          sensitivity: string
          status: string
          updated_at: string
          user_id: string | null
          weekly_kg: number
          weight_kg: number
        }
        Insert: {
          activity_level: string
          age_stage: string
          birthday?: string | null
          body_condition: string
          created_at?: string
          daily_grams: number
          goal: string
          id?: string
          image_url?: string | null
          name: string
          recommended_plan_type: string
          recommended_protein: string
          sensitivity: string
          status?: string
          updated_at?: string
          user_id?: string | null
          weekly_kg: number
          weight_kg: number
        }
        Update: {
          activity_level?: string
          age_stage?: string
          birthday?: string | null
          body_condition?: string
          created_at?: string
          daily_grams?: number
          goal?: string
          id?: string
          image_url?: string | null
          name?: string
          recommended_plan_type?: string
          recommended_protein?: string
          sensitivity?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          weekly_kg?: number
          weight_kg?: number
        }
        Relationships: []
      }
      order_statuses: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_statuses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          delivery_token: string | null
          dog_profile_id: string | null
          driver_confirmed_at: string | null
          driver_notes: string | null
          driver_status: string | null
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
          user_id: string | null
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
          delivery_token?: string | null
          dog_profile_id?: string | null
          driver_confirmed_at?: string | null
          driver_notes?: string | null
          driver_status?: string | null
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
          user_id?: string | null
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
          delivery_token?: string | null
          dog_profile_id?: string | null
          driver_confirmed_at?: string | null
          driver_notes?: string | null
          driver_status?: string | null
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
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_coverage_zone_id_fkey"
            columns: ["coverage_zone_id"]
            isOneToOne: false
            referencedRelation: "coverage_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_dog_profile_id_fkey"
            columns: ["dog_profile_id"]
            isOneToOne: false
            referencedRelation: "dog_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          benefits: Json | null
          category: string | null
          created_at: string
          description: string | null
          duration_days: number | null
          id: string
          image_url: string | null
          images: string[] | null
          ingredients: string[] | null
          is_active: boolean | null
          is_subscription: boolean | null
          name: string
          original_price: number | null
          presentation: string | null
          price: number
          protein_line: string | null
          short_description: string | null
          slug: string
          sort_order: number | null
          subscription_discount: number | null
          updated_at: string
          weight_range_max: number | null
          weight_range_min: number | null
        }
        Insert: {
          benefits?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          ingredients?: string[] | null
          is_active?: boolean | null
          is_subscription?: boolean | null
          name: string
          original_price?: number | null
          presentation?: string | null
          price: number
          protein_line?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number | null
          subscription_discount?: number | null
          updated_at?: string
          weight_range_max?: number | null
          weight_range_min?: number | null
        }
        Update: {
          benefits?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          ingredients?: string[] | null
          is_active?: boolean | null
          is_subscription?: boolean | null
          name?: string
          original_price?: number | null
          presentation?: string | null
          price?: number
          protein_line?: string | null
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
      profiles: {
        Row: {
          acquisition_channel: string | null
          address: string
          colonia: string | null
          created_at: string
          email: string
          family_name: string
          id: string
          is_admin: boolean | null
          is_coverage_verified: boolean | null
          main_breed: string | null
          pet_name: string
          phone: string
          postal_code: string
          references_notes: string | null
          special_needs: string | null
          special_notes: string | null
          updated_at: string
        }
        Insert: {
          acquisition_channel?: string | null
          address: string
          colonia?: string | null
          created_at?: string
          email: string
          family_name: string
          id: string
          is_admin?: boolean | null
          is_coverage_verified?: boolean | null
          main_breed?: string | null
          pet_name: string
          phone: string
          postal_code: string
          references_notes?: string | null
          special_needs?: string | null
          special_notes?: string | null
          updated_at?: string
        }
        Update: {
          acquisition_channel?: string | null
          address?: string
          colonia?: string | null
          created_at?: string
          email?: string
          family_name?: string
          id?: string
          is_admin?: boolean | null
          is_coverage_verified?: boolean | null
          main_breed?: string | null
          pet_name?: string
          phone?: string
          postal_code?: string
          references_notes?: string | null
          special_needs?: string | null
          special_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          discount_percent: number | null
          frequency: string
          frequency_days: number | null
          id: string
          next_billing_date: string | null
          next_delivery_date: string | null
          payment_method: string | null
          plan_type: string
          points: number | null
          presentation: string
          price_per_kg: number | null
          product_id: string | null
          protein_line: string
          status: string | null
          type: string | null
          updated_at: string
          user_id: string
          weekly_amount_kg: number | null
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          frequency: string
          frequency_days?: number | null
          id?: string
          next_billing_date?: string | null
          next_delivery_date?: string | null
          payment_method?: string | null
          plan_type: string
          points?: number | null
          presentation: string
          price_per_kg?: number | null
          product_id?: string | null
          protein_line: string
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
          weekly_amount_kg?: number | null
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          frequency?: string
          frequency_days?: number | null
          id?: string
          next_billing_date?: string | null
          next_delivery_date?: string | null
          payment_method?: string | null
          plan_type?: string
          points?: number | null
          presentation?: string
          price_per_kg?: number | null
          product_id?: string | null
          protein_line?: string
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
          weekly_amount_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      get_order_by_token: {
        Args: { p_token: string }
        Returns: {
          customer_address: string
          customer_name: string
          customer_phone: string
          delivery_notes: string
          driver_confirmed_at: string
          driver_notes: string
          driver_status: string
          id: string
          items: Json
          order_number: string
          payment_method: string
          status: string
          total: number
        }[]
      }
      update_order_by_token: {
        Args: {
          p_driver_notes?: string
          p_driver_status: string
          p_token: string
        }
        Returns: boolean
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
