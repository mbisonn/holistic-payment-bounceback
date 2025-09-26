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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      auth_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_actions: {
        Row: {
          action_config: Json | null
          action_type: string
          created_at: string | null
          id: string
          order_index: number | null
          workflow_id: string | null
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          workflow_id?: string | null
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_actions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          executed_at: string | null
          id: string
          status: string | null
          trigger_data: Json | null
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string | null
          trigger_data?: Json | null
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string | null
          trigger_data?: Json | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action: string
          action_data: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          trigger: string
          trigger_data: Json | null
          updated_at: string
        }
        Insert: {
          action: string
          action_data?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          trigger: string
          trigger_data?: Json | null
          updated_at?: string
        }
        Update: {
          action?: string
          action_data?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          trigger?: string
          trigger_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      automation_triggers: {
        Row: {
          created_at: string | null
          id: string
          trigger_config: Json | null
          trigger_type: string
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          trigger_config?: Json | null
          trigger_type: string
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          trigger_config?: Json | null
          trigger_type?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_triggers_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_notes: {
        Row: {
          created_at: string | null
          customer_email: string
          id: string
          notes: string | null
          tags: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          id?: string
          notes?: string | null
          tags?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          id?: string
          notes?: string | null
          tags?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          minimum_amount: number | null
          type: string
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          type: string
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          value?: number
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          type?: string
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          value?: number
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          recipient_tags: string[] | null
          scheduled_at: string | null
          send_delay_minutes: number | null
          sent_at: string | null
          status: string | null
          subject: string | null
          template_id: string | null
          trigger_conditions: Json | null
          trigger_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          recipient_tags?: string[] | null
          scheduled_at?: string | null
          send_delay_minutes?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          trigger_conditions?: Json | null
          trigger_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          recipient_tags?: string[] | null
          scheduled_at?: string | null
          send_delay_minutes?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          trigger_conditions?: Json | null
          trigger_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string | null
          created_at: string
          html_content: string | null
          id: string
          is_active: boolean | null
          name: string
          placeholders: string[] | null
          subject: string
          template_type: string | null
          text_content: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          placeholders?: string[] | null
          subject: string
          template_type?: string | null
          text_content?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          placeholders?: string[] | null
          subject?: string
          template_type?: string | null
          text_content?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          created_at: string | null
          email_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          recipient_email: string
        }
        Insert: {
          created_at?: string | null
          email_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          recipient_email: string
        }
        Update: {
          created_at?: string | null
          email_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          recipient_email?: string
        }
        Relationships: []
      }
      meal_plan_sync: {
        Row: {
          created_at: string | null
          customer_email: string
          id: string
          last_synced_at: string | null
          meal_plan_data: Json | null
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          id?: string
          last_synced_at?: string | null
          meal_plan_data?: Json | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          id?: string
          last_synced_at?: string | null
          meal_plan_data?: Json | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          calories: number | null
          category: string | null
          cook_time: number | null
          created_at: string
          description: string | null
          id: string
          ingredients: string[] | null
          instructions: string | null
          is_active: boolean | null
          name: string
          prep_time: number | null
          servings: number | null
          updated_at: string
        }
        Insert: {
          calories?: number | null
          category?: string | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          id?: string
          ingredients?: string[] | null
          instructions?: string | null
          is_active?: boolean | null
          name: string
          prep_time?: number | null
          servings?: number | null
          updated_at?: string
        }
        Update: {
          calories?: number | null
          category?: string | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          id?: string
          ingredients?: string[] | null
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          prep_time?: number | null
          servings?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      order_bumps: {
        Row: {
          created_at: string | null
          description: string | null
          discounted_price: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          original_price: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          original_price: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          original_price?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_summary_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_state: string | null
          id: string
          payment_status: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_state?: string | null
          id?: string
          payment_status?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_state?: string | null
          id?: string
          payment_status?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_emails: {
        Row: {
          content: string
          created_at: string | null
          error_message: string | null
          id: string
          recipient_email: string
          scheduled_at: string
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email: string
          scheduled_at: string
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_emails_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_settings: {
        Row: {
          base_fee: number | null
          created_at: string
          description: string | null
          enable_free_shipping: boolean | null
          free_shipping_threshold: number | null
          id: string
          is_active: boolean | null
          lagos_delivery_fee: number | null
          name: string
          other_states_delivery_fee: number | null
          updated_at: string
        }
        Insert: {
          base_fee?: number | null
          created_at?: string
          description?: string | null
          enable_free_shipping?: boolean | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          lagos_delivery_fee?: number | null
          name: string
          other_states_delivery_fee?: number | null
          updated_at?: string
        }
        Update: {
          base_fee?: number | null
          created_at?: string
          description?: string | null
          enable_free_shipping?: boolean | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          lagos_delivery_fee?: number | null
          name?: string
          other_states_delivery_fee?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      upsell_products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          original_price: number | null
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          original_price?: number | null
          price?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          original_price?: number | null
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_access_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          message: string | null
          reason: string | null
          requested_role: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          reason?: string | null
          requested_role: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          reason?: string | null
          requested_role?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_products_view: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          image_url: string | null
          name: string | null
          price: number | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          name?: string | null
          price?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          name?: string | null
          price?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      index_usage_stats: {
        Row: {
          index_size: string | null
          indexname: unknown | null
          schemaname: unknown | null
          tablename: unknown | null
          times_used: number | null
          tuples_fetched: number | null
          tuples_read: number | null
        }
        Relationships: []
      }
      order_summary_view: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          id: string | null
          item_count: number | null
          payment_status: string | null
          status: string | null
          total_amount: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_access_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      check_password_strength: {
        Args: { password: string }
        Returns: Json
      }
      cleanup_unused_indexes: {
        Args: Record<PropertyKey, never>
        Returns: {
          index_name: string
          index_size: string
          table_name: string
        }[]
      }
      create_access_request: {
        Args: { request_reason?: string; user_email: string }
        Returns: string
      }
      current_user_has_role: {
        Args: { role_name: string }
        Returns: boolean
      }
      current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      current_user_is_verified: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      demote_admin_to_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      detect_suspicious_activity: {
        Args: { user_id: string }
        Returns: Json
      }
      get_active_products: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          description: string
          id: string
          image_url: string
          name: string
          price: number
        }[]
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          id: string
          role: string
          user_metadata: Json
        }[]
      }
      get_database_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_dashboard_data: {
        Args: { user_id?: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_id?: string }
        Returns: string
      }
      has_role: {
        Args:
          | { role_name: string; user_id: string }
          | { role_name: string; user_id?: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_auth_event: {
        Args: {
          action: string
          details?: Json
          ip_address?: unknown
          user_agent?: string
          user_id: string
        }
        Returns: undefined
      }
      promote_user_to_admin: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      reject_access_request: {
        Args:
          | { admin_notes?: string; request_id: string }
          | { request_id: string }
        Returns: boolean
      }
      validate_user_registration: {
        Args: { email: string; full_name?: string; password: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "user" | "verified" | "admin" | "moderator" | "manager"
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
    Enums: {
      app_role: ["user", "verified", "admin", "moderator", "manager"],
    },
  },
} as const
