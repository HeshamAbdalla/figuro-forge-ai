export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversion_tasks: {
        Row: {
          art_style: string | null
          created_at: string
          download_error: string | null
          download_status: string | null
          generate_texture: boolean | null
          generation_mode: string | null
          id: string
          local_model_url: string | null
          local_thumbnail_url: string | null
          model_url: string | null
          negative_prompt: string | null
          prompt: string | null
          seed_value: number | null
          status: string
          target_polycount: number | null
          task_id: string
          task_type: string
          thumbnail_url: string | null
          topology_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          art_style?: string | null
          created_at?: string
          download_error?: string | null
          download_status?: string | null
          generate_texture?: boolean | null
          generation_mode?: string | null
          id?: string
          local_model_url?: string | null
          local_thumbnail_url?: string | null
          model_url?: string | null
          negative_prompt?: string | null
          prompt?: string | null
          seed_value?: number | null
          status?: string
          target_polycount?: number | null
          task_id: string
          task_type?: string
          thumbnail_url?: string | null
          topology_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          art_style?: string | null
          created_at?: string
          download_error?: string | null
          download_status?: string | null
          generate_texture?: boolean | null
          generation_mode?: string | null
          id?: string
          local_model_url?: string | null
          local_thumbnail_url?: string | null
          model_url?: string | null
          negative_prompt?: string | null
          prompt?: string | null
          seed_value?: number | null
          status?: string
          target_polycount?: number | null
          task_id?: string
          task_type?: string
          thumbnail_url?: string | null
          topology_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      figurines: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          model_url: string | null
          prompt: string
          saved_image_url: string | null
          style: Database["public"]["Enums"]["art_style"]
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          model_url?: string | null
          prompt: string
          saved_image_url?: string | null
          style?: Database["public"]["Enums"]["art_style"]
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          model_url?: string | null
          prompt?: string
          saved_image_url?: string | null
          style?: Database["public"]["Enums"]["art_style"]
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          payment_status: string
          plan_type: string
          stripe_session_id: string
          updated_at: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          payment_status?: string
          plan_type: string
          stripe_session_id: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          payment_status?: string
          plan_type?: string
          stripe_session_id?: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      plan_limits: {
        Row: {
          features: Json | null
          id: string
          image_generations_limit: number
          is_unlimited: boolean | null
          model_conversions_limit: number
          monthly_credits: number | null
          plan_type: string
          price_monthly: number
        }
        Insert: {
          features?: Json | null
          id?: string
          image_generations_limit: number
          is_unlimited?: boolean | null
          model_conversions_limit: number
          monthly_credits?: number | null
          plan_type: string
          price_monthly: number
        }
        Update: {
          features?: Json | null
          id?: string
          image_generations_limit?: number
          is_unlimited?: boolean | null
          model_conversions_limit?: number
          monthly_credits?: number | null
          plan_type?: string
          price_monthly?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          commercial_license: boolean | null
          created_at: string | null
          display_name: string | null
          full_name: string | null
          generation_count: number | null
          id: string
          plan: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          commercial_license?: boolean | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          generation_count?: number | null
          id: string
          plan?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          commercial_license?: boolean | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          generation_count?: number | null
          id?: string
          plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stats: {
        Row: {
          count: number
          id: string
          updated_at: string | null
        }
        Insert: {
          count?: number
          id: string
          updated_at?: string | null
        }
        Update: {
          count?: number
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          additional_conversions: number | null
          commercial_license: boolean | null
          converted_3d_this_month: number | null
          created_at: string | null
          credits_remaining: number | null
          daily_reset_date: string | null
          expires_at: string | null
          generation_count_this_month: number | null
          generation_count_today: number | null
          id: string
          last_generated_at: string | null
          monthly_reset_date: string | null
          plan_type: string
          renewed_at: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          additional_conversions?: number | null
          commercial_license?: boolean | null
          converted_3d_this_month?: number | null
          created_at?: string | null
          credits_remaining?: number | null
          daily_reset_date?: string | null
          expires_at?: string | null
          generation_count_this_month?: number | null
          generation_count_today?: number | null
          id?: string
          last_generated_at?: string | null
          monthly_reset_date?: string | null
          plan_type?: string
          renewed_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          additional_conversions?: number | null
          commercial_license?: boolean | null
          converted_3d_this_month?: number | null
          created_at?: string | null
          credits_remaining?: number | null
          daily_reset_date?: string | null
          expires_at?: string | null
          generation_count_this_month?: number | null
          generation_count_today?: number | null
          id?: string
          last_generated_at?: string | null
          monthly_reset_date?: string | null
          plan_type?: string
          renewed_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_payment_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      consume_feature_usage: {
        Args: { feature_type: string; user_id_param: string; amount?: number }
        Returns: boolean
      }
      increment_stat: {
        Args: { stat_id: string; inc_amount?: number }
        Returns: number
      }
      reset_daily_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      art_style:
        | "isometric"
        | "anime"
        | "pixar"
        | "steampunk"
        | "lowpoly"
        | "cyberpunk"
        | "realistic"
        | "chibi"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      art_style: [
        "isometric",
        "anime",
        "pixar",
        "steampunk",
        "lowpoly",
        "cyberpunk",
        "realistic",
        "chibi",
      ],
    },
  },
} as const
