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
          config: Json | null
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
          original_model_url: string | null
          prompt: string | null
          remesh_progress: number | null
          remesh_settings: Json | null
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
          config?: Json | null
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
          original_model_url?: string | null
          prompt?: string | null
          remesh_progress?: number | null
          remesh_settings?: Json | null
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
          config?: Json | null
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
          original_model_url?: string | null
          prompt?: string | null
          remesh_progress?: number | null
          remesh_settings?: Json | null
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
          file_type: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          metadata: Json | null
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
          file_type?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          metadata?: Json | null
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
          file_type?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          metadata?: Json | null
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
          is_onboarding_complete: boolean
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
          is_onboarding_complete?: boolean
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
          is_onboarding_complete?: boolean
          plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown | null
          request_count: number | null
          updated_at: string | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      remesh_tasks: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          original_model_url: string
          progress: number | null
          remeshed_model_url: string | null
          settings: Json | null
          status: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          original_model_url: string
          progress?: number | null
          remeshed_model_url?: string | null
          settings?: Json | null
          status?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          original_model_url?: string
          progress?: number | null
          remeshed_model_url?: string | null
          settings?: Json | null
          status?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_monitoring: {
        Row: {
          check_type: string
          created_at: string | null
          details: Json | null
          id: string
          resolved_at: string | null
          severity: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          check_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resolved_at?: string | null
          severity?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          check_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resolved_at?: string | null
          severity?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      shared_models: {
        Row: {
          created_at: string | null
          expires_at: string | null
          figurine_id: string
          id: string
          last_accessed_at: string | null
          max_views: number | null
          password_hash: string | null
          share_token: string
          status: Database["public"]["Enums"]["share_status"] | null
          updated_at: string | null
          user_id: string
          view_count: number | null
          viewer_info: Json | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          figurine_id: string
          id?: string
          last_accessed_at?: string | null
          max_views?: number | null
          password_hash?: string | null
          share_token: string
          status?: Database["public"]["Enums"]["share_status"] | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
          viewer_info?: Json | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          figurine_id?: string
          id?: string
          last_accessed_at?: string | null
          max_views?: number | null
          password_hash?: string | null
          share_token?: string
          status?: Database["public"]["Enums"]["share_status"] | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
          viewer_info?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_models_figurine_id_fkey"
            columns: ["figurine_id"]
            isOneToOne: false
            referencedRelation: "figurines"
            referencedColumns: ["id"]
          },
        ]
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
          bonus_credits: number | null
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
          bonus_credits?: number | null
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
          bonus_credits?: number | null
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      audit_security_definer_functions: {
        Args: Record<PropertyKey, never>
        Returns: {
          function_name: string
          schema_name: string
          security_definer: boolean
          search_path_setting: string
          risk_level: string
        }[]
      }
      check_rate_limit: {
        Args: {
          p_user_id: string
          p_ip_address: unknown
          p_endpoint: string
          p_limit?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_payment_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_rate_limits_for_endpoint: {
        Args: { p_endpoint: string }
        Returns: undefined
      }
      comprehensive_security_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      consume_feature_usage: {
        Args: { feature_type: string; user_id_param: string; amount?: number }
        Returns: boolean
      }
      create_shared_model: {
        Args: {
          p_figurine_id: string
          p_password?: string
          p_expires_hours?: number
          p_max_views?: number
        }
        Returns: string
      }
      enhanced_security_health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      generate_share_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role: {
        Args: { check_user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      increment_stat: {
        Args: { stat_id: string; inc_amount?: number }
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
          p_success?: boolean
        }
        Returns: undefined
      }
      log_security_violation: {
        Args: {
          violation_type: string
          violation_details?: Json
          user_id_param?: string
        }
        Returns: undefined
      }
      make_user_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      reset_daily_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      revoke_share: {
        Args: { p_share_token: string }
        Returns: boolean
      }
      rls_performance_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      security_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      security_health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_payment_session: {
        Args: { session_id: string; expected_user_id: string }
        Returns: boolean
      }
      validate_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          rls_enabled: boolean
          policy_count: number
          security_status: string
        }[]
      }
      validate_share_access: {
        Args: { p_share_token: string; p_password?: string }
        Returns: Json
      }
      validate_subscription_upgrade: {
        Args: {
          target_user_id: string
          new_plan_type: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
        }
        Returns: boolean
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
      share_status: "active" | "revoked" | "expired"
      user_role: "admin" | "user" | "moderator"
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
      share_status: ["active", "revoked", "expired"],
      user_role: ["admin", "user", "moderator"],
    },
  },
} as const
