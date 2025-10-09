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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      automation_rules: {
        Row: {
          action: string
          action_data: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          trigger: string
          trigger_data: Json | null
          updated_at: string
        }
        Insert: {
          action: string
          action_data?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          trigger: string
          trigger_data?: Json | null
          updated_at?: string
        }
        Update: {
          action?: string
          action_data?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          trigger?: string
          trigger_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_analytics: {
        Row: {
          avg_order_value: number | null
          created_at: string
          customer_email: string
          id: string
          last_order_date: string | null
          lifetime_value: number | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          avg_order_value?: number | null
          created_at?: string
          customer_email: string
          id?: string
          last_order_date?: string | null
          lifetime_value?: number | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          avg_order_value?: number | null
          created_at?: string
          customer_email?: string
          id?: string
          last_order_date?: string | null
          lifetime_value?: number | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_exports: {
        Row: {
          created_at: string
          export_type: string
          exported_by: string | null
          file_url: string | null
          id: string
          record_count: number | null
          status: string | null
        }
        Insert: {
          created_at?: string
          export_type: string
          exported_by?: string | null
          file_url?: string | null
          id?: string
          record_count?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string
          export_type?: string
          exported_by?: string | null
          file_url?: string | null
          id?: string
          record_count?: number | null
          status?: string | null
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
      customer_tag_assignments: {
        Row: {
          assigned_at: string
          customer_email: string
          customer_name: string | null
          id: string
          tag_id: string | null
        }
        Insert: {
          assigned_at?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          tag_id?: string | null
        }
        Update: {
          assigned_at?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "customer_tags"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          minimum_amount: number | null
          type: string
          updated_at: string
          usage_limit: number | null
          used_count: number
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          minimum_amount?: number | null
          type: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          minimum_amount?: number | null
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      email_analytics: {
        Row: {
          bounced_at: string | null
          campaign_id: string | null
          clicked_at: string | null
          created_at: string
          email_address: string
          id: string
          opened_at: string | null
          sent_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          bounced_at?: string | null
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string
          email_address: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string
          email_address?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          send_delay_minutes: number | null
          template_id: string | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          send_delay_minutes?: number | null
          template_id?: string | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          send_delay_minutes?: number | null
          template_id?: string | null
          trigger_conditions?: Json | null
          trigger_type?: string
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
      email_events: {
        Row: {
          campaign_id: string | null
          event_type: string
          id: string
          message_id: string
          recipient: string | null
          timestamp: string
          url: string | null
        }
        Insert: {
          campaign_id?: string | null
          event_type: string
          id?: string
          message_id: string
          recipient?: string | null
          timestamp?: string
          url?: string | null
        }
        Update: {
          campaign_id?: string | null
          event_type?: string
          id?: string
          message_id?: string
          recipient?: string | null
          timestamp?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          campaign_id: string | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          admin_recipients: string[]
          id: number
          sender_email: string
          smtp_enabled: boolean | null
          smtp_password: string | null
          smtp_username: string | null
          updated_at: string | null
        }
        Insert: {
          admin_recipients: string[]
          id?: number
          sender_email: string
          smtp_enabled?: boolean | null
          smtp_password?: string | null
          smtp_username?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_recipients?: string[]
          id?: number
          sender_email?: string
          smtp_enabled?: boolean | null
          smtp_password?: string | null
          smtp_username?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          placeholders: string[] | null
          subject: string
          template_type: string
          text_content: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          placeholders?: string[] | null
          subject: string
          template_type: string
          text_content?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          placeholders?: string[] | null
          subject?: string
          template_type?: string
          text_content?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      funnel_automation_actions: {
        Row: {
          action_config: Json | null
          action_type: string
          automation_id: string | null
          created_at: string
          delay_minutes: number | null
          id: string
          order_index: number | null
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          automation_id?: string | null
          created_at?: string
          delay_minutes?: number | null
          id?: string
          order_index?: number | null
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          automation_id?: string | null
          created_at?: string
          delay_minutes?: number | null
          id?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_automation_actions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation_rules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_automation_actions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "funnel_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_automation_analytics: {
        Row: {
          automation_id: string | null
          created_at: string
          id: string
          metric_date: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          automation_id?: string | null
          created_at?: string
          id?: string
          metric_date: string
          metric_name: string
          metric_value: number
        }
        Update: {
          automation_id?: string | null
          created_at?: string
          id?: string
          metric_date?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "funnel_automation_analytics_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation_rules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_automation_analytics_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "funnel_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_automation_conditions: {
        Row: {
          automation_id: string | null
          condition_config: Json | null
          condition_type: string
          created_at: string
          id: string
          order_index: number | null
        }
        Insert: {
          automation_id?: string | null
          condition_config?: Json | null
          condition_type: string
          created_at?: string
          id?: string
          order_index?: number | null
        }
        Update: {
          automation_id?: string | null
          condition_config?: Json | null
          condition_type?: string
          created_at?: string
          id?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_automation_conditions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation_rules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_automation_conditions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "funnel_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_automation_executions: {
        Row: {
          automation_id: string | null
          completed_at: string | null
          created_at: string
          customer_email: string
          error_message: string | null
          execution_data: Json | null
          id: string
          started_at: string | null
          status: string
        }
        Insert: {
          automation_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_email: string
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Update: {
          automation_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_email?: string
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_automation_executions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation_rules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_automation_executions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "funnel_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_automation_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_premium: boolean | null
          name: string
          template_data: Json
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          name: string
          template_data: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          name?: string
          template_data?: Json
        }
        Relationships: []
      }
      funnel_automation_triggers: {
        Row: {
          automation_id: string | null
          created_at: string
          id: string
          order_index: number | null
          trigger_config: Json | null
          trigger_type: string
        }
        Insert: {
          automation_id?: string | null
          created_at?: string
          id?: string
          order_index?: number | null
          trigger_config?: Json | null
          trigger_type: string
        }
        Update: {
          automation_id?: string | null
          created_at?: string
          id?: string
          order_index?: number | null
          trigger_config?: Json | null
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_automation_triggers_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation_rules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_automation_triggers_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "funnel_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_automations: {
        Row: {
          created_at: string
          description: string | null
          funnel_id: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          funnel_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          funnel_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          discount_amount: number | null
          due_date: string | null
          id: string
          invoice_number: string
          order_id: string | null
          pdf_url: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_number: string
          order_id?: string | null
          pdf_url?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          order_id?: string | null
          pdf_url?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_sync: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          external_user_id: string | null
          id: string
          meal_plan_data: Json | null
          synced_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          external_user_id?: string | null
          id?: string
          meal_plan_data?: Json | null
          synced_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          external_user_id?: string | null
          id?: string
          meal_plan_data?: Json | null
          synced_at?: string | null
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
          original_price: number | null
          product_id: string | null
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
          original_price?: number | null
          product_id?: string | null
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
          original_price?: number | null
          product_id?: string | null
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
          quantity: number
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
            referencedRelation: "orders"
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
          cart_items: Json | null
          created_at: string | null
          customer_email: string
          customer_name: string
          id: string
          order_source: string | null
          payment_reference: string | null
          payment_status: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cart_items?: Json | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          id?: string
          order_source?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cart_items?: Json | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          id?: string
          order_source?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_analytics: {
        Row: {
          cart_additions: number | null
          created_at: string
          date_recorded: string
          id: string
          product_id: string | null
          purchases: number | null
          revenue: number | null
          updated_at: string
          views: number | null
        }
        Insert: {
          cart_additions?: number | null
          created_at?: string
          date_recorded?: string
          id?: string
          product_id?: string | null
          purchases?: number | null
          revenue?: number | null
          updated_at?: string
          views?: number | null
        }
        Update: {
          cart_additions?: number | null
          created_at?: string
          date_recorded?: string
          id?: string
          product_id?: string | null
          purchases?: number | null
          revenue?: number | null
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string | null
          id: number
          product_id: string
          rating: number
          review: string
          user_name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_id: string
          rating: number
          review: string
          user_name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          product_id?: string
          rating?: number
          review?: string
          user_name?: string
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
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          customer_email: string
          customer_name: string
          helpful_votes: number
          id: string
          rating: number
          reported: boolean
          response: string | null
          response_date: string | null
          source: string
          status: string
          title: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          content: string
          created_at?: string
          customer_email: string
          customer_name: string
          helpful_votes?: number
          id?: string
          rating: number
          reported?: boolean
          response?: string | null
          response_date?: string | null
          source: string
          status?: string
          title: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          content?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          helpful_votes?: number
          id?: string
          rating?: number
          reported?: boolean
          response?: string | null
          response_date?: string | null
          source?: string
          status?: string
          title?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      scheduled_emails: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          customer_email: string | null
          error: string | null
          html: string
          id: string
          send_at: string
          sent_at: string | null
          status: string | null
          subject: string
          to_email: string
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          error?: string | null
          html: string
          id?: string
          send_at: string
          sent_at?: string | null
          status?: string | null
          subject: string
          to_email: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          error?: string | null
          html?: string
          id?: string
          send_at?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          to_email?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_scheduled_emails_campaign_id"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_settings: {
        Row: {
          base_fee: number
          created_at: string
          description: string | null
          enable_free_shipping: boolean
          free_shipping_threshold: number
          id: string
          is_active: boolean
          lagos_delivery_fee: number
          name: string
          other_states_delivery_fee: number
          updated_at: string
        }
        Insert: {
          base_fee?: number
          created_at?: string
          description?: string | null
          enable_free_shipping?: boolean
          free_shipping_threshold?: number
          id?: string
          is_active?: boolean
          lagos_delivery_fee?: number
          name: string
          other_states_delivery_fee?: number
          updated_at?: string
        }
        Update: {
          base_fee?: number
          created_at?: string
          description?: string | null
          enable_free_shipping?: boolean
          free_shipping_threshold?: number
          id?: string
          is_active?: boolean
          lagos_delivery_fee?: number
          name?: string
          other_states_delivery_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      upsell_products: {
        Row: {
          created_at: string
          description: string | null
          duration_months: number
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_months: number
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_months?: number
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      upsell_transactions: {
        Row: {
          amount: number
          created_at: string
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json | null
          payment_reference: string | null
          product_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          metadata?: Json | null
          payment_reference?: string | null
          product_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          metadata?: Json | null
          payment_reference?: string | null
          product_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "upsell_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "upsell_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_access_requests: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
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
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          api_token: string
          business_name: string
          created_at: string
          id: string
          is_active: boolean
          phone_number: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_token: string
          business_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_token?: string
          business_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: string
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          error_message: string | null
          id: string
          read_at: string | null
          sent_at: string
          status: string
          template_id: string | null
        }
        Insert: {
          content: string
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          read_at?: string | null
          sent_at?: string
          status?: string
          template_id?: string | null
        }
        Update: {
          content?: string
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          read_at?: string | null
          sent_at?: string
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          variables: string[]
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          variables?: string[]
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          variables?: string[]
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          is_active: boolean
          step_order: number
          step_type: string
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          step_order: number
          step_type: string
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          step_order?: number
          step_type?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      automation_rules_view: {
        Row: {
          action: string | null
          action_data: Json | null
          automation_type: string | null
          created_at: string | null
          description: string | null
          funnel_id: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          system_type: string | null
          trigger: string | null
          trigger_data: Json | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      current_user_is_verified: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
        }[]
      }
      has_role: {
        Args:
          | {
              check_user_id: string
              role_name: Database["public"]["Enums"]["app_role"]
            }
          | { role_name: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "verified" | "user"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "verified", "user"],
    },
  },
} as const

