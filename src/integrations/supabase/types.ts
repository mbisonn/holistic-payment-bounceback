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
      abandoned_checkouts: {
        Row: {
          cart_items: Json | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          notified: boolean | null
        }
        Insert: {
          cart_items?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notified?: boolean | null
        }
        Update: {
          cart_items?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notified?: boolean | null
        }
        Relationships: []
      }
      analytics_metrics: {
        Row: {
          created_at: string
          date_recorded: string
          id: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string
          date_recorded?: string
          id?: string
          metric_name: string
          metric_value?: number
        }
        Update: {
          created_at?: string
          date_recorded?: string
          id?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
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
      customer_tag_assignments: {
        Row: {
          created_at: string
          customer_email: string
          id: string
          tag_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          id?: string
          tag_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
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
          id: string
          name: string
          recipient_tags: string[] | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          recipient_tags?: string[] | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          recipient_tags?: string[] | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
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
          error_message: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string | null
          template_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
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
      email_outbox: {
        Row: {
          attachment_path: string | null
          body_html: string | null
          created_at: string
          id: string
          last_error: string | null
          sent_at: string | null
          status: string
          subject: string
          to_email: string
          to_name: string | null
          tries: number | null
          user_id: string | null
        }
        Insert: {
          attachment_path?: string | null
          body_html?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          to_email: string
          to_name?: string | null
          tries?: number | null
          user_id?: string | null
        }
        Update: {
          attachment_path?: string | null
          body_html?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          to_email?: string
          to_name?: string | null
          tries?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          admin_recipients: string[] | null
          created_at: string
          from_email: string | null
          from_name: string | null
          id: string
          smtp_enabled: boolean | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          updated_at: string
        }
        Insert: {
          admin_recipients?: string[] | null
          created_at?: string
          from_email?: string | null
          from_name?: string | null
          id?: string
          smtp_enabled?: boolean | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
        }
        Update: {
          admin_recipients?: string[] | null
          created_at?: string
          from_email?: string | null
          from_name?: string | null
          id?: string
          smtp_enabled?: boolean | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      facebook_conversion_settings: {
        Row: {
          access_token: string
          created_at: string
          domain_verification: string | null
          id: string
          is_enabled: boolean
          pixel_id: string
          test_event_code: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          domain_verification?: string | null
          id?: string
          is_enabled?: boolean
          pixel_id: string
          test_event_code?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          domain_verification?: string | null
          id?: string
          is_enabled?: boolean
          pixel_id?: string
          test_event_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          due_at: string | null
          id: string
          invoice_number: string | null
          issued_at: string | null
          items: Json
          order_id: string | null
          paid_at: string | null
          status: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          due_at?: string | null
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          items?: Json
          order_id?: string | null
          paid_at?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          due_at?: string | null
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          items?: Json
          order_id?: string | null
          paid_at?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
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
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          external_user_id: string
          id: string
          meal_plan_data: Json | null
          synced_at: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          external_user_id: string
          id?: string
          meal_plan_data?: Json | null
          synced_at?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          external_user_id?: string
          id?: string
          meal_plan_data?: Json | null
          synced_at?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          email_addresses: string[]
          id: string
          is_active: boolean
          setting_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_addresses?: string[]
          id?: string
          is_active?: boolean
          setting_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_addresses?: string[]
          id?: string
          is_active?: boolean
          setting_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_bumps: {
        Row: {
          created_at: string
          description: string | null
          discounted_price: number | null
          id: string
          image_url: string | null
          is_active: boolean
          min_quantity: number
          original_price: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_quantity?: number
          original_price?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_quantity?: number
          original_price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_state: string | null
          discount_amount: number
          id: string
          items: Json
          notes: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipping_fee: number
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_state?: string | null
          discount_amount?: number
          id?: string
          items?: Json
          notes?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_state?: string | null
          discount_amount?: number
          id?: string
          items?: Json
          notes?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
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
          {
            foreignKeyName: "product_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          id: string
          is_approved: boolean | null
          is_verified: boolean | null
          product_id: string | null
          rating: number
          review_text: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          product_id?: string | null
          rating: number
          review_text?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          product_id?: string | null
          rating?: number
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_bumper_offer: boolean | null
          name: string
          price: number
          product_id: string
          quantity_multiplier: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_bumper_offer?: boolean | null
          name: string
          price: number
          product_id: string
          quantity_multiplier?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_bumper_offer?: boolean | null
          name?: string
          price?: number
          product_id?: string
          quantity_multiplier?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          discount_price: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_types: {
        Row: {
          description: string | null
          is_assignable: boolean | null
          role: string
        }
        Insert: {
          description?: string | null
          is_assignable?: boolean | null
          role: string
        }
        Update: {
          description?: string | null
          is_assignable?: boolean | null
          role?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          discount_price: number | null
          duration_months: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_price?: number | null
          duration_months?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_price?: number | null
          duration_months?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          type?: string | null
          updated_at?: string
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
          admin_notes: string | null
          created_at: string
          id: string
          message: string | null
          requested_role: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message?: string | null
          requested_role: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message?: string | null
          requested_role?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: number
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: never
          updated_at?: string | null
          user_id?: string
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: never
          updated_at?: string | null
          user_id?: string
          username?: string
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
      products_public: {
        Row: {
          description: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          name: string | null
          price: number | null
        }
        Insert: {
          description?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
          price?: number | null
        }
        Update: {
          description?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
          price?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _grant_admin: {
        Args: { p_email: string }
        Returns: undefined
      }
      approve_access_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      assign_user_role: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      create_access_request: {
        Args: { message?: string; requested_role: string }
        Returns: string
      }
      current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      current_user_is_admin_rls: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_function_definition: {
        Args: { function_name: string }
        Returns: string
      }
      get_product_category_name: {
        Args: { product_id: string }
        Returns: string
      }
      has_role: {
        Args:
          | Record<PropertyKey, never>
          | { check_user_id: string; role_name: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      jwt_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      manage_user_role: {
        Args: {
          calling_user_id?: string
          new_role: string
          target_user_id: string
        }
        Returns: boolean
      }
      promote_to_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      reject_access_request: {
        Args: { admin_notes?: string; request_id: string }
        Returns: undefined
      }
      user_has_role: {
        Args: { check_user_id: string; required_role: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator" | "manager" | "verified"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "paid" | "failed" | "refunded"
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
      app_role: ["admin", "user", "moderator", "manager", "verified"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_status: ["pending", "paid", "failed", "refunded"],
    },
  },
} as const
