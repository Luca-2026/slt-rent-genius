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
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_role: string | null
          actor_user_id: string | null
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_label: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_role?: string | null
          actor_user_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_role?: string | null
          actor_user_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      b2b_admin_messages: {
        Row: {
          b2b_profile_id: string
          body: string
          created_at: string
          email_sent: boolean
          email_sent_at: string | null
          id: string
          read_at: string | null
          sender_name: string | null
          sender_user_id: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          b2b_profile_id: string
          body: string
          created_at?: string
          email_sent?: boolean
          email_sent_at?: string | null
          id?: string
          read_at?: string | null
          sender_name?: string | null
          sender_user_id?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          b2b_profile_id?: string
          body?: string
          created_at?: string
          email_sent?: boolean
          email_sent_at?: string | null
          id?: string
          read_at?: string | null
          sender_name?: string | null
          sender_user_id?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      b2b_authorized_persons: {
        Row: {
          b2b_profile_id: string
          created_at: string
          email: string | null
          first_name: string
          id: string
          invited_at: string | null
          is_active: boolean
          last_name: string
          max_rental_value: number
          notes: string | null
          phone: string | null
          position: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          b2b_profile_id: string
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          invited_at?: string | null
          is_active?: boolean
          last_name: string
          max_rental_value?: number
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          b2b_profile_id?: string
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          invited_at?: string | null
          is_active?: boolean
          last_name?: string
          max_rental_value?: number
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_authorized_persons_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_authorized_persons_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_category_discounts: {
        Row: {
          b2b_profile_id: string
          category_id: string
          created_at: string
          discount_percent: number
          id: string
          updated_at: string
        }
        Insert: {
          b2b_profile_id: string
          category_id: string
          created_at?: string
          discount_percent?: number
          id?: string
          updated_at?: string
        }
        Update: {
          b2b_profile_id?: string
          category_id?: string
          created_at?: string
          discount_percent?: number
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_category_discounts_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_category_discounts_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_category_discounts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_customer_prices: {
        Row: {
          b2b_profile_id: string
          created_at: string
          id: string
          notes: string | null
          product_id: string | null
          product_name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          b2b_profile_id: string
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          b2b_profile_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_customer_prices_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_customer_prices_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_delivery_note_items: {
        Row: {
          condition_notes: string | null
          created_at: string
          delivery_note_id: string
          description: string | null
          id: string
          product_name: string
          quantity: number
          serial_number: string | null
        }
        Insert: {
          condition_notes?: string | null
          created_at?: string
          delivery_note_id: string
          description?: string | null
          id?: string
          product_name: string
          quantity?: number
          serial_number?: string | null
        }
        Update: {
          condition_notes?: string | null
          created_at?: string
          delivery_note_id?: string
          description?: string | null
          id?: string
          product_name?: string
          quantity?: number
          serial_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_delivery_note_items_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: false
            referencedRelation: "b2b_delivery_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_delivery_notes: {
        Row: {
          additional_defects: string | null
          agb_accepted: boolean
          agb_accepted_at: string | null
          b2b_profile_id: string
          created_at: string
          delivery_note_number: string
          email_sent: boolean
          email_sent_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          known_defects: string | null
          notes: string | null
          offer_id: string | null
          photo_urls: string[] | null
          reservation_id: string | null
          signature_data: string | null
          signed_at: string | null
          staff_name: string | null
          staff_signature_data: string | null
          status: string
          updated_at: string
        }
        Insert: {
          additional_defects?: string | null
          agb_accepted?: boolean
          agb_accepted_at?: string | null
          b2b_profile_id: string
          created_at?: string
          delivery_note_number: string
          email_sent?: boolean
          email_sent_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          known_defects?: string | null
          notes?: string | null
          offer_id?: string | null
          photo_urls?: string[] | null
          reservation_id?: string | null
          signature_data?: string | null
          signed_at?: string | null
          staff_name?: string | null
          staff_signature_data?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          additional_defects?: string | null
          agb_accepted?: boolean
          agb_accepted_at?: string | null
          b2b_profile_id?: string
          created_at?: string
          delivery_note_number?: string
          email_sent?: boolean
          email_sent_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          known_defects?: string | null
          notes?: string | null
          offer_id?: string | null
          photo_urls?: string[] | null
          reservation_id?: string | null
          signature_data?: string | null
          signed_at?: string | null
          staff_name?: string | null
          staff_signature_data?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_delivery_notes_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_delivery_notes_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_delivery_notes_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "b2b_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_delivery_notes_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "b2b_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_instance_hours_log: {
        Row: {
          created_at: string
          hours: number
          id: string
          instance_id: string
          note: string | null
          recorded_at: string
          recorded_by: string | null
        }
        Insert: {
          created_at?: string
          hours: number
          id?: string
          instance_id: string
          note?: string | null
          recorded_at?: string
          recorded_by?: string | null
        }
        Update: {
          created_at?: string
          hours?: number
          id?: string
          instance_id?: string
          note?: string | null
          recorded_at?: string
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_instance_hours_log_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "b2b_product_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_instance_hours_log_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_due_overview"
            referencedColumns: ["instance_id"]
          },
        ]
      }
      b2b_invoice_items: {
        Row: {
          created_at: string
          description: string | null
          discount_percent: number
          id: string
          invoice_id: string
          product_name: string
          quantity: number
          rental_end: string | null
          rental_start: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          invoice_id: string
          product_name: string
          quantity?: number
          rental_end?: string | null
          rental_start?: string | null
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          invoice_id?: string
          product_name?: string
          quantity?: number
          rental_end?: string | null
          rental_start?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "b2b_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "b2b_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_invoices: {
        Row: {
          amount: number
          b2b_profile_id: string
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_company: string | null
          customer_country: string | null
          customer_postal_code: string | null
          delivery_cost: number
          due_date: string | null
          email_sent: boolean
          email_sent_at: string | null
          file_name: string | null
          file_url: string | null
          gross_amount: number
          id: string
          invoice_date: string | null
          invoice_number: string | null
          is_reverse_charge: boolean
          net_amount: number
          notes: string | null
          payment_due_days: number
          payment_terms: string
          reservation_id: string | null
          source_offer_id: string | null
          status: string
          updated_at: string
          vat_amount: number
          vat_id_at_creation: string | null
          vat_rate: number
        }
        Insert: {
          amount: number
          b2b_profile_id: string
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_company?: string | null
          customer_country?: string | null
          customer_postal_code?: string | null
          delivery_cost?: number
          due_date?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
          file_name?: string | null
          file_url?: string | null
          gross_amount?: number
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          is_reverse_charge?: boolean
          net_amount?: number
          notes?: string | null
          payment_due_days?: number
          payment_terms?: string
          reservation_id?: string | null
          source_offer_id?: string | null
          status?: string
          updated_at?: string
          vat_amount?: number
          vat_id_at_creation?: string | null
          vat_rate?: number
        }
        Update: {
          amount?: number
          b2b_profile_id?: string
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_company?: string | null
          customer_country?: string | null
          customer_postal_code?: string | null
          delivery_cost?: number
          due_date?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
          file_name?: string | null
          file_url?: string | null
          gross_amount?: number
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          is_reverse_charge?: boolean
          net_amount?: number
          notes?: string | null
          payment_due_days?: number
          payment_terms?: string
          reservation_id?: string | null
          source_offer_id?: string | null
          status?: string
          updated_at?: string
          vat_amount?: number
          vat_id_at_creation?: string | null
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "b2b_invoices_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_invoices_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "b2b_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_invoices_source_offer_id_fkey"
            columns: ["source_offer_id"]
            isOneToOne: false
            referencedRelation: "b2b_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_local_category_content: {
        Row: {
          category: string
          created_at: string
          faqs: Json
          hookline: string | null
          id: string
          is_published: boolean
          location: string
          standort_fakten: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          faqs?: Json
          hookline?: string | null
          id?: string
          is_published?: boolean
          location: string
          standort_fakten?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          faqs?: Json
          hookline?: string | null
          id?: string
          is_published?: boolean
          location?: string
          standort_fakten?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      b2b_maintenance_intervals: {
        Row: {
          created_at: string
          id: string
          instance_id: string
          interval_type: Database["public"]["Enums"]["maintenance_interval_type"]
          interval_value: number | null
          is_active: boolean
          last_done_at: string | null
          last_done_hours: number | null
          next_due_at: string | null
          next_due_hours: number | null
          notes: string | null
          title: string
          updated_at: string
          warn_days_before: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          instance_id: string
          interval_type: Database["public"]["Enums"]["maintenance_interval_type"]
          interval_value?: number | null
          is_active?: boolean
          last_done_at?: string | null
          last_done_hours?: number | null
          next_due_at?: string | null
          next_due_hours?: number | null
          notes?: string | null
          title: string
          updated_at?: string
          warn_days_before?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          instance_id?: string
          interval_type?: Database["public"]["Enums"]["maintenance_interval_type"]
          interval_value?: number | null
          is_active?: boolean
          last_done_at?: string | null
          last_done_hours?: number | null
          next_due_at?: string | null
          next_due_hours?: number | null
          notes?: string | null
          title?: string
          updated_at?: string
          warn_days_before?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_maintenance_intervals_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "b2b_product_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_maintenance_intervals_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_due_overview"
            referencedColumns: ["instance_id"]
          },
        ]
      }
      b2b_maintenance_log: {
        Row: {
          attachments: Json | null
          cost: number | null
          created_at: string
          description: string | null
          hours_at_service: number | null
          id: string
          instance_id: string
          interval_id: string | null
          parts_replaced: string | null
          performed_at: string
          performed_by: string | null
          performed_by_name: string | null
          title: string
        }
        Insert: {
          attachments?: Json | null
          cost?: number | null
          created_at?: string
          description?: string | null
          hours_at_service?: number | null
          id?: string
          instance_id: string
          interval_id?: string | null
          parts_replaced?: string | null
          performed_at?: string
          performed_by?: string | null
          performed_by_name?: string | null
          title: string
        }
        Update: {
          attachments?: Json | null
          cost?: number | null
          created_at?: string
          description?: string | null
          hours_at_service?: number | null
          id?: string
          instance_id?: string
          interval_id?: string | null
          parts_replaced?: string | null
          performed_at?: string
          performed_by?: string | null
          performed_by_name?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_maintenance_log_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "b2b_product_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_maintenance_log_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_due_overview"
            referencedColumns: ["instance_id"]
          },
          {
            foreignKeyName: "b2b_maintenance_log_interval_id_fkey"
            columns: ["interval_id"]
            isOneToOne: false
            referencedRelation: "b2b_maintenance_intervals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_maintenance_log_interval_id_fkey"
            columns: ["interval_id"]
            isOneToOne: false
            referencedRelation: "maintenance_due_overview"
            referencedColumns: ["interval_id"]
          },
        ]
      }
      b2b_managed_products: {
        Row: {
          available_locations: string[]
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          detailed_description: string | null
          drive_type: string | null
          external_manual_url: string | null
          features: string[]
          id: string
          image_alts: string[]
          images: string[]
          is_published: boolean
          min_rental_months: number | null
          model_name: string | null
          name: string
          on_request: boolean
          pdf_url: string | null
          price_per_day: string | null
          price_per_month: string | null
          price_unit_label: string | null
          price_weekend: string | null
          quantities: Json
          quantity_notes: Json
          rental_notes: string[]
          rentware_code: Json
          seo_draft_faqs: Json | null
          seo_draft_generated_at: string | null
          seo_draft_meta_description: string | null
          seo_faqs: Json
          seo_local_content: Json
          seo_meta_description: string | null
          seo_title: string | null
          seo_use_case_bau: string | null
          seo_use_case_event: string | null
          seo_use_case_privat: string | null
          slug: string
          sort_order: number | null
          specifications: Json
          subcategory: string | null
          tags: string[]
          updated_at: string
          updated_by: string | null
          video_url: string | null
          video_urls: string[]
          weight_kg: number | null
        }
        Insert: {
          available_locations?: string[]
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          detailed_description?: string | null
          drive_type?: string | null
          external_manual_url?: string | null
          features?: string[]
          id?: string
          image_alts?: string[]
          images?: string[]
          is_published?: boolean
          min_rental_months?: number | null
          model_name?: string | null
          name: string
          on_request?: boolean
          pdf_url?: string | null
          price_per_day?: string | null
          price_per_month?: string | null
          price_unit_label?: string | null
          price_weekend?: string | null
          quantities?: Json
          quantity_notes?: Json
          rental_notes?: string[]
          rentware_code?: Json
          seo_draft_faqs?: Json | null
          seo_draft_generated_at?: string | null
          seo_draft_meta_description?: string | null
          seo_faqs?: Json
          seo_local_content?: Json
          seo_meta_description?: string | null
          seo_title?: string | null
          seo_use_case_bau?: string | null
          seo_use_case_event?: string | null
          seo_use_case_privat?: string | null
          slug: string
          sort_order?: number | null
          specifications?: Json
          subcategory?: string | null
          tags?: string[]
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
          video_urls?: string[]
          weight_kg?: number | null
        }
        Update: {
          available_locations?: string[]
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          detailed_description?: string | null
          drive_type?: string | null
          external_manual_url?: string | null
          features?: string[]
          id?: string
          image_alts?: string[]
          images?: string[]
          is_published?: boolean
          min_rental_months?: number | null
          model_name?: string | null
          name?: string
          on_request?: boolean
          pdf_url?: string | null
          price_per_day?: string | null
          price_per_month?: string | null
          price_unit_label?: string | null
          price_weekend?: string | null
          quantities?: Json
          quantity_notes?: Json
          rental_notes?: string[]
          rentware_code?: Json
          seo_draft_faqs?: Json | null
          seo_draft_generated_at?: string | null
          seo_draft_meta_description?: string | null
          seo_faqs?: Json
          seo_local_content?: Json
          seo_meta_description?: string | null
          seo_title?: string | null
          seo_use_case_bau?: string | null
          seo_use_case_event?: string | null
          seo_use_case_privat?: string | null
          slug?: string
          sort_order?: number | null
          specifications?: Json
          subcategory?: string | null
          tags?: string[]
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
          video_urls?: string[]
          weight_kg?: number | null
        }
        Relationships: []
      }
      b2b_offer_items: {
        Row: {
          created_at: string
          description: string | null
          discount_percent: number
          id: string
          offer_id: string
          product_name: string
          quantity: number
          rental_end: string | null
          rental_start: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          offer_id: string
          product_name: string
          quantity?: number
          rental_end?: string | null
          rental_start?: string | null
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          offer_id?: string
          product_name?: string
          quantity?: number
          rental_end?: string | null
          rental_start?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "b2b_offer_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "b2b_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_offers: {
        Row: {
          accepted_at: string | null
          additional_services: Json | null
          b2b_profile_id: string
          created_at: string
          created_by_staff_name: string | null
          created_by_user_id: string | null
          customer_signature_data: string | null
          delivery_cost: number
          deposit: number | null
          email_sent: boolean
          email_sent_at: string | null
          file_name: string | null
          file_url: string | null
          gross_amount: number
          id: string
          is_reverse_charge: boolean
          issuing_location: string | null
          net_amount: number
          notes: string | null
          offer_date: string
          offer_number: string
          reservation_id: string | null
          return_location: string | null
          status: string
          updated_at: string
          valid_until: string | null
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          accepted_at?: string | null
          additional_services?: Json | null
          b2b_profile_id: string
          created_at?: string
          created_by_staff_name?: string | null
          created_by_user_id?: string | null
          customer_signature_data?: string | null
          delivery_cost?: number
          deposit?: number | null
          email_sent?: boolean
          email_sent_at?: string | null
          file_name?: string | null
          file_url?: string | null
          gross_amount?: number
          id?: string
          is_reverse_charge?: boolean
          issuing_location?: string | null
          net_amount?: number
          notes?: string | null
          offer_date: string
          offer_number: string
          reservation_id?: string | null
          return_location?: string | null
          status?: string
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          accepted_at?: string | null
          additional_services?: Json | null
          b2b_profile_id?: string
          created_at?: string
          created_by_staff_name?: string | null
          created_by_user_id?: string | null
          customer_signature_data?: string | null
          delivery_cost?: number
          deposit?: number | null
          email_sent?: boolean
          email_sent_at?: string | null
          file_name?: string | null
          file_url?: string | null
          gross_amount?: number
          id?: string
          is_reverse_charge?: boolean
          issuing_location?: string | null
          net_amount?: number
          notes?: string | null
          offer_date?: string
          offer_number?: string
          reservation_id?: string | null
          return_location?: string | null
          status?: string
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "b2b_offers_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_offers_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_offers_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "b2b_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_product_instances: {
        Row: {
          created_at: string
          created_by: string | null
          current_operating_hours: number | null
          id: string
          internal_inventory_number: string | null
          location: string
          managed_product_id: string
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          status: Database["public"]["Enums"]["instance_status"]
          supplier: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_operating_hours?: number | null
          id?: string
          internal_inventory_number?: string | null
          location: string
          managed_product_id: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["instance_status"]
          supplier?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_operating_hours?: number | null
          id?: string
          internal_inventory_number?: string | null
          location?: string
          managed_product_id?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["instance_status"]
          supplier?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_product_instances_managed_product_id_fkey"
            columns: ["managed_product_id"]
            isOneToOne: false
            referencedRelation: "b2b_managed_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_product_instances_managed_product_id_fkey"
            columns: ["managed_product_id"]
            isOneToOne: false
            referencedRelation: "maintenance_due_overview"
            referencedColumns: ["managed_product_id"]
          },
          {
            foreignKeyName: "b2b_product_instances_managed_product_id_fkey"
            columns: ["managed_product_id"]
            isOneToOne: false
            referencedRelation: "managed_products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_profiles: {
        Row: {
          assigned_contact_override: Json | null
          assigned_location: string | null
          billing_email: string | null
          city: string
          company_name: string
          contact_email: string
          contact_first_name: string
          contact_last_name: string
          contact_phone: string
          contact_position: string | null
          country: string | null
          created_at: string
          credit_limit: number
          credit_limit_requested_at: string | null
          default_payment_terms: string
          deletion_requested_at: string | null
          document_filename: string | null
          document_url: string | null
          email_confirmed: boolean
          house_number: string | null
          id: string
          internal_notes: string | null
          legal_form: string | null
          payment_due_days: number
          postal_code: string
          postal_invoice: boolean
          rejection_reason: string | null
          sepa_mandate_filename: string | null
          sepa_mandate_url: string | null
          status: Database["public"]["Enums"]["b2b_status"]
          status_changed_at: string | null
          status_changed_by: string | null
          street: string
          tax_id: string | null
          trade_register_number: string | null
          updated_at: string
          used_credit: number
          user_id: string
          vat_id_verified: boolean
        }
        Insert: {
          assigned_contact_override?: Json | null
          assigned_location?: string | null
          billing_email?: string | null
          city: string
          company_name: string
          contact_email: string
          contact_first_name: string
          contact_last_name: string
          contact_phone: string
          contact_position?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number
          credit_limit_requested_at?: string | null
          default_payment_terms?: string
          deletion_requested_at?: string | null
          document_filename?: string | null
          document_url?: string | null
          email_confirmed?: boolean
          house_number?: string | null
          id?: string
          internal_notes?: string | null
          legal_form?: string | null
          payment_due_days?: number
          postal_code: string
          postal_invoice?: boolean
          rejection_reason?: string | null
          sepa_mandate_filename?: string | null
          sepa_mandate_url?: string | null
          status?: Database["public"]["Enums"]["b2b_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          street: string
          tax_id?: string | null
          trade_register_number?: string | null
          updated_at?: string
          used_credit?: number
          user_id: string
          vat_id_verified?: boolean
        }
        Update: {
          assigned_contact_override?: Json | null
          assigned_location?: string | null
          billing_email?: string | null
          city?: string
          company_name?: string
          contact_email?: string
          contact_first_name?: string
          contact_last_name?: string
          contact_phone?: string
          contact_position?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number
          credit_limit_requested_at?: string | null
          default_payment_terms?: string
          deletion_requested_at?: string | null
          document_filename?: string | null
          document_url?: string | null
          email_confirmed?: boolean
          house_number?: string | null
          id?: string
          internal_notes?: string | null
          legal_form?: string | null
          payment_due_days?: number
          postal_code?: string
          postal_invoice?: boolean
          rejection_reason?: string | null
          sepa_mandate_filename?: string | null
          sepa_mandate_url?: string | null
          status?: Database["public"]["Enums"]["b2b_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          street?: string
          tax_id?: string | null
          trade_register_number?: string | null
          updated_at?: string
          used_credit?: number
          user_id?: string
          vat_id_verified?: boolean
        }
        Relationships: []
      }
      b2b_reservations: {
        Row: {
          additional_services: Json | null
          b2b_profile_id: string
          category_slug: string | null
          created_at: string
          deposit: number | null
          discounted_price: number | null
          end_date: string | null
          end_time: string | null
          id: string
          location: string
          notes: string | null
          original_price: number | null
          product_id: string
          product_name: string | null
          quantity: number
          rental_group_id: string | null
          start_date: string
          start_time: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_services?: Json | null
          b2b_profile_id: string
          category_slug?: string | null
          created_at?: string
          deposit?: number | null
          discounted_price?: number | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          location: string
          notes?: string | null
          original_price?: number | null
          product_id: string
          product_name?: string | null
          quantity?: number
          rental_group_id?: string | null
          start_date: string
          start_time?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_services?: Json | null
          b2b_profile_id?: string
          category_slug?: string | null
          created_at?: string
          deposit?: number | null
          discounted_price?: number | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          location?: string
          notes?: string | null
          original_price?: number | null
          product_id?: string
          product_name?: string | null
          quantity?: number
          rental_group_id?: string | null
          start_date?: string
          start_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_reservations_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_reservations_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_return_protocol_items: {
        Row: {
          condition: string
          condition_notes: string | null
          created_at: string
          description: string | null
          id: string
          product_name: string
          quantity: number
          return_protocol_id: string
          serial_number: string | null
        }
        Insert: {
          condition?: string
          condition_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          product_name: string
          quantity?: number
          return_protocol_id: string
          serial_number?: string | null
        }
        Update: {
          condition?: string
          condition_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          product_name?: string
          quantity?: number
          return_protocol_id?: string
          serial_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_return_protocol_items_return_protocol_id_fkey"
            columns: ["return_protocol_id"]
            isOneToOne: false
            referencedRelation: "b2b_return_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_return_protocols: {
        Row: {
          additional_defects_at_return: string | null
          all_items_returned: boolean
          b2b_profile_id: string
          cleaning_required: boolean
          condition_notes: string | null
          created_at: string
          customer_signature_data: string | null
          damage_description: string | null
          delivery_note_id: string | null
          email_sent: boolean
          email_sent_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          known_defects_from_delivery: string | null
          meter_reading_end: string | null
          meter_reading_start: string | null
          missing_items_notes: string | null
          notes: string | null
          overall_condition: string
          photo_urls: string[] | null
          reservation_id: string | null
          return_protocol_number: string
          signed_at: string | null
          staff_name: string | null
          staff_signature_data: string | null
          status: string
          updated_at: string
        }
        Insert: {
          additional_defects_at_return?: string | null
          all_items_returned?: boolean
          b2b_profile_id: string
          cleaning_required?: boolean
          condition_notes?: string | null
          created_at?: string
          customer_signature_data?: string | null
          damage_description?: string | null
          delivery_note_id?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          known_defects_from_delivery?: string | null
          meter_reading_end?: string | null
          meter_reading_start?: string | null
          missing_items_notes?: string | null
          notes?: string | null
          overall_condition?: string
          photo_urls?: string[] | null
          reservation_id?: string | null
          return_protocol_number: string
          signed_at?: string | null
          staff_name?: string | null
          staff_signature_data?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          additional_defects_at_return?: string | null
          all_items_returned?: boolean
          b2b_profile_id?: string
          cleaning_required?: boolean
          condition_notes?: string | null
          created_at?: string
          customer_signature_data?: string | null
          damage_description?: string | null
          delivery_note_id?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          known_defects_from_delivery?: string | null
          meter_reading_end?: string | null
          meter_reading_start?: string | null
          missing_items_notes?: string | null
          notes?: string | null
          overall_condition?: string
          photo_urls?: string[] | null
          reservation_id?: string | null
          return_protocol_number?: string
          signed_at?: string | null
          staff_name?: string | null
          staff_signature_data?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_return_protocols_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_return_protocols_b2b_profile_id_fkey"
            columns: ["b2b_profile_id"]
            isOneToOne: false
            referencedRelation: "b2b_profiles_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_return_protocols_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: false
            referencedRelation: "b2b_delivery_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_return_protocols_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "b2b_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_feedback: {
        Row: {
          answers: Json
          avg_rating: number | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_type: string | null
          google_review_confirmed: boolean
          id: string
          internal_note: string | null
          location: string | null
          order_ref: string | null
          ratings: Json
          recommend_score: number | null
          rented_items: string | null
          source: string | null
          status: string
          updated_at: string
          voucher_code: string | null
          voucher_sent_at: string | null
          voucher_sent_to: string | null
        }
        Insert: {
          answers?: Json
          avg_rating?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_type?: string | null
          google_review_confirmed?: boolean
          id?: string
          internal_note?: string | null
          location?: string | null
          order_ref?: string | null
          ratings?: Json
          recommend_score?: number | null
          rented_items?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          voucher_code?: string | null
          voucher_sent_at?: string | null
          voucher_sent_to?: string | null
        }
        Update: {
          answers?: Json
          avg_rating?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_type?: string | null
          google_review_confirmed?: boolean
          id?: string
          internal_note?: string | null
          location?: string | null
          order_ref?: string | null
          ratings?: Json
          recommend_score?: number | null
          rented_items?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          voucher_code?: string | null
          voucher_sent_at?: string | null
          voucher_sent_to?: string | null
        }
        Relationships: []
      }
      google_reviews_cache: {
        Row: {
          created_at: string
          fetched_at: string
          id: string
          place_id: string
          rating: number | null
          reviews: Json | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fetched_at?: string
          id?: string
          place_id: string
          rating?: number | null
          reviews?: Json | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fetched_at?: string
          id?: string
          place_id?: string
          rating?: number | null
          reviews?: Json | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          city: string | null
          cover_letter_filename: string | null
          cover_letter_url: string | null
          created_at: string
          earliest_start_date: string | null
          email: string
          first_name: string
          id: string
          internal_notes: string | null
          job_id: string
          job_specific_answers: Json | null
          job_title: string
          last_name: string
          motivation: string | null
          phone: string
          postal_code: string | null
          resume_filename: string | null
          resume_url: string | null
          salary_expectation: string | null
          status: string
          street: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          cover_letter_filename?: string | null
          cover_letter_url?: string | null
          created_at?: string
          earliest_start_date?: string | null
          email: string
          first_name: string
          id?: string
          internal_notes?: string | null
          job_id: string
          job_specific_answers?: Json | null
          job_title: string
          last_name: string
          motivation?: string | null
          phone: string
          postal_code?: string | null
          resume_filename?: string | null
          resume_url?: string | null
          salary_expectation?: string | null
          status?: string
          street?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          cover_letter_filename?: string | null
          cover_letter_url?: string | null
          created_at?: string
          earliest_start_date?: string | null
          email?: string
          first_name?: string
          id?: string
          internal_notes?: string | null
          job_id?: string
          job_specific_answers?: Json | null
          job_title?: string
          last_name?: string
          motivation?: string | null
          phone?: string
          postal_code?: string | null
          resume_filename?: string | null
          resume_url?: string | null
          salary_expectation?: string | null
          status?: string
          street?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      new_machines: {
        Row: {
          article_number: string | null
          brand: string
          category: string
          compare_at_price: number | null
          content: Json | null
          created_at: string
          description: string | null
          gtin: string | null
          id: string
          images: string[] | null
          is_active: boolean
          is_featured: boolean
          model: string
          name: string
          price_gross: number | null
          price_on_request: boolean
          short_description: string | null
          showroom_locations: string[] | null
          slug: string
          sort_order: number
          specifications: Json | null
          updated_at: string
          vat_rate: number
        }
        Insert: {
          article_number?: string | null
          brand: string
          category: string
          compare_at_price?: number | null
          content?: Json | null
          created_at?: string
          description?: string | null
          gtin?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          model: string
          name: string
          price_gross?: number | null
          price_on_request?: boolean
          short_description?: string | null
          showroom_locations?: string[] | null
          slug: string
          sort_order?: number
          specifications?: Json | null
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          article_number?: string | null
          brand?: string
          category?: string
          compare_at_price?: number | null
          content?: Json | null
          created_at?: string
          description?: string | null
          gtin?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          model?: string
          name?: string
          price_gross?: number | null
          price_on_request?: boolean
          short_description?: string | null
          showroom_locations?: string[] | null
          slug?: string
          sort_order?: number
          specifications?: Json | null
          updated_at?: string
          vat_rate?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          gdpr_consent: boolean
          gdpr_consent_date: string | null
          id: string
          is_active: boolean | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          gdpr_consent?: boolean
          gdpr_consent_date?: string | null
          id?: string
          is_active?: boolean | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          gdpr_consent?: boolean
          gdpr_consent_date?: string | null
          id?: string
          is_active?: boolean | null
          source?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          icon_url: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_url?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon_url?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          available_locations: string[] | null
          category_id: string | null
          created_at: string
          daily_price: number
          deposit: number | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          monthly_price: number | null
          name: string
          slug: string
          specifications: Json | null
          updated_at: string
          weekly_price: number | null
          weight_class: string | null
        }
        Insert: {
          available_locations?: string[] | null
          category_id?: string | null
          created_at?: string
          daily_price?: number
          deposit?: number | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          monthly_price?: number | null
          name: string
          slug: string
          specifications?: Json | null
          updated_at?: string
          weekly_price?: number | null
          weight_class?: string | null
        }
        Update: {
          available_locations?: string[] | null
          category_id?: string | null
          created_at?: string
          daily_price?: number
          deposit?: number | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          monthly_price?: number | null
          name?: string
          slug?: string
          specifications?: Json | null
          updated_at?: string
          weekly_price?: number | null
          weight_class?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      project_requests: {
        Row: {
          additional_services: string | null
          attachment_urls: string[] | null
          created_at: string
          delivery_required: boolean | null
          end_date: string | null
          end_time: string | null
          equipment_needed: string
          id: string
          internal_notes: string | null
          pickup_required: boolean | null
          preferred_callback_date: string | null
          preferred_callback_time: string | null
          project_description: string | null
          project_name: string
          site_city: string
          site_postal_code: string
          site_street: string
          start_date: string
          start_time: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_services?: string | null
          attachment_urls?: string[] | null
          created_at?: string
          delivery_required?: boolean | null
          end_date?: string | null
          end_time?: string | null
          equipment_needed: string
          id?: string
          internal_notes?: string | null
          pickup_required?: boolean | null
          preferred_callback_date?: string | null
          preferred_callback_time?: string | null
          project_description?: string | null
          project_name: string
          site_city: string
          site_postal_code: string
          site_street: string
          start_date: string
          start_time?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_services?: string | null
          attachment_urls?: string[] | null
          created_at?: string
          delivery_required?: boolean | null
          end_date?: string | null
          end_time?: string | null
          equipment_needed?: string
          id?: string
          internal_notes?: string | null
          pickup_required?: boolean | null
          preferred_callback_date?: string | null
          preferred_callback_time?: string | null
          project_description?: string | null
          project_name?: string
          site_city?: string
          site_postal_code?: string
          site_street?: string
          start_date?: string
          start_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rental_inquiries: {
        Row: {
          assigned_at: string | null
          assigned_name: string | null
          assigned_to: string | null
          attachments: Json
          category_slug: string | null
          company_name: string | null
          created_at: string
          customer_city: string | null
          customer_email: string | null
          customer_kind: string
          customer_name: string | null
          customer_phone: string | null
          customer_postal_code: string | null
          customer_street: string | null
          delivery_city: string | null
          delivery_postal_code: string | null
          delivery_requested: boolean
          delivery_street: string | null
          email_sent: boolean
          end_date: string | null
          end_time: string | null
          id: string
          internal_notes: string | null
          location: string | null
          location_email: string | null
          message: string | null
          offer_file_url: string | null
          offer_number: string | null
          offer_sent_at: string | null
          offer_total_gross: number | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          raw_payload: Json | null
          setup_service_requested: boolean
          source: string
          start_date: string | null
          start_time: string | null
          status: string
          updated_at: string
          vat_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_name?: string | null
          assigned_to?: string | null
          attachments?: Json
          category_slug?: string | null
          company_name?: string | null
          created_at?: string
          customer_city?: string | null
          customer_email?: string | null
          customer_kind?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_postal_code?: string | null
          customer_street?: string | null
          delivery_city?: string | null
          delivery_postal_code?: string | null
          delivery_requested?: boolean
          delivery_street?: string | null
          email_sent?: boolean
          end_date?: string | null
          end_time?: string | null
          id?: string
          internal_notes?: string | null
          location?: string | null
          location_email?: string | null
          message?: string | null
          offer_file_url?: string | null
          offer_number?: string | null
          offer_sent_at?: string | null
          offer_total_gross?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          raw_payload?: Json | null
          setup_service_requested?: boolean
          source?: string
          start_date?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
          vat_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_name?: string | null
          assigned_to?: string | null
          attachments?: Json
          category_slug?: string | null
          company_name?: string | null
          created_at?: string
          customer_city?: string | null
          customer_email?: string | null
          customer_kind?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_postal_code?: string | null
          customer_street?: string | null
          delivery_city?: string | null
          delivery_postal_code?: string | null
          delivery_requested?: boolean
          delivery_street?: string | null
          email_sent?: boolean
          end_date?: string | null
          end_time?: string | null
          id?: string
          internal_notes?: string | null
          location?: string | null
          location_email?: string | null
          message?: string | null
          offer_file_url?: string | null
          offer_number?: string | null
          offer_sent_at?: string | null
          offer_total_gross?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          raw_payload?: Json | null
          setup_service_requested?: boolean
          source?: string
          start_date?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
          vat_id?: string | null
        }
        Relationships: []
      }
      sales_inquiries: {
        Row: {
          addons: Json
          article_number: string | null
          assigned_at: string | null
          assigned_name: string | null
          assigned_to: string | null
          billing_city: string | null
          billing_company: string | null
          billing_country: string | null
          billing_identical: boolean | null
          billing_postal_code: string | null
          billing_street: string | null
          brand: string | null
          company_name: string | null
          created_at: string
          customer_email: string | null
          customer_kind: string
          customer_phone: string | null
          customer_type: string | null
          delivery_city: string | null
          delivery_note: string | null
          delivery_option: string | null
          delivery_postal_code: string | null
          delivery_street: string | null
          email_sent: boolean
          financing_desired: boolean | null
          financing_down_payment: string | null
          financing_term: string | null
          first_name: string | null
          found_via: string | null
          id: string
          interest: string | null
          internal_notes: string | null
          kind: string
          last_name: string | null
          listed_price: string | null
          location: string | null
          location_email: string | null
          message: string | null
          model: string | null
          offer_file_url: string | null
          offer_number: string | null
          offer_sent_at: string | null
          offer_total_gross: number | null
          product_category: string | null
          quantity: string | null
          raw_payload: Json | null
          requirements: string | null
          salutation: string | null
          searched_machine: string | null
          source: string | null
          status: string
          updated_at: string
          vat_id: string | null
          wish_date: string | null
          year: number | null
        }
        Insert: {
          addons?: Json
          article_number?: string | null
          assigned_at?: string | null
          assigned_name?: string | null
          assigned_to?: string | null
          billing_city?: string | null
          billing_company?: string | null
          billing_country?: string | null
          billing_identical?: boolean | null
          billing_postal_code?: string | null
          billing_street?: string | null
          brand?: string | null
          company_name?: string | null
          created_at?: string
          customer_email?: string | null
          customer_kind?: string
          customer_phone?: string | null
          customer_type?: string | null
          delivery_city?: string | null
          delivery_note?: string | null
          delivery_option?: string | null
          delivery_postal_code?: string | null
          delivery_street?: string | null
          email_sent?: boolean
          financing_desired?: boolean | null
          financing_down_payment?: string | null
          financing_term?: string | null
          first_name?: string | null
          found_via?: string | null
          id?: string
          interest?: string | null
          internal_notes?: string | null
          kind?: string
          last_name?: string | null
          listed_price?: string | null
          location?: string | null
          location_email?: string | null
          message?: string | null
          model?: string | null
          offer_file_url?: string | null
          offer_number?: string | null
          offer_sent_at?: string | null
          offer_total_gross?: number | null
          product_category?: string | null
          quantity?: string | null
          raw_payload?: Json | null
          requirements?: string | null
          salutation?: string | null
          searched_machine?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          vat_id?: string | null
          wish_date?: string | null
          year?: number | null
        }
        Update: {
          addons?: Json
          article_number?: string | null
          assigned_at?: string | null
          assigned_name?: string | null
          assigned_to?: string | null
          billing_city?: string | null
          billing_company?: string | null
          billing_country?: string | null
          billing_identical?: boolean | null
          billing_postal_code?: string | null
          billing_street?: string | null
          brand?: string | null
          company_name?: string | null
          created_at?: string
          customer_email?: string | null
          customer_kind?: string
          customer_phone?: string | null
          customer_type?: string | null
          delivery_city?: string | null
          delivery_note?: string | null
          delivery_option?: string | null
          delivery_postal_code?: string | null
          delivery_street?: string | null
          email_sent?: boolean
          financing_desired?: boolean | null
          financing_down_payment?: string | null
          financing_term?: string | null
          first_name?: string | null
          found_via?: string | null
          id?: string
          interest?: string | null
          internal_notes?: string | null
          kind?: string
          last_name?: string | null
          listed_price?: string | null
          location?: string | null
          location_email?: string | null
          message?: string | null
          model?: string | null
          offer_file_url?: string | null
          offer_number?: string | null
          offer_sent_at?: string | null
          offer_total_gross?: number | null
          product_category?: string | null
          quantity?: string | null
          raw_payload?: Json | null
          requirements?: string | null
          salutation?: string | null
          searched_machine?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          vat_id?: string | null
          wish_date?: string | null
          year?: number | null
        }
        Relationships: []
      }
      staff_material_transfers: {
        Row: {
          assigned_at: string | null
          assigned_name: string | null
          assigned_to: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          done_at: string | null
          from_location: string
          id: string
          item_name: string
          notes: string | null
          quantity: number
          status: string
          to_location: string
          todo_list_id: string | null
          tour_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_name?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          done_at?: string | null
          from_location: string
          id?: string
          item_name: string
          notes?: string | null
          quantity?: number
          status?: string
          to_location: string
          todo_list_id?: string | null
          tour_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_name?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          done_at?: string | null
          from_location?: string
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: number
          status?: string
          to_location?: string
          todo_list_id?: string | null
          tour_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_material_transfers_todo_list_id_fkey"
            columns: ["todo_list_id"]
            isOneToOne: false
            referencedRelation: "staff_todo_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_time_entries: {
        Row: {
          break_minutes: number
          created_at: string
          end_time: string | null
          id: string
          location: string | null
          note: string | null
          start_time: string | null
          updated_at: string
          user_id: string
          work_date: string
        }
        Insert: {
          break_minutes?: number
          created_at?: string
          end_time?: string | null
          id?: string
          location?: string | null
          note?: string | null
          start_time?: string | null
          updated_at?: string
          user_id: string
          work_date: string
        }
        Update: {
          break_minutes?: number
          created_at?: string
          end_time?: string | null
          id?: string
          location?: string | null
          note?: string | null
          start_time?: string | null
          updated_at?: string
          user_id?: string
          work_date?: string
        }
        Relationships: []
      }
      staff_timesheets: {
        Row: {
          created_at: string
          id: string
          month: number
          pdf_path: string | null
          staff_email: string | null
          staff_name: string | null
          status: string
          submitted_at: string | null
          total_minutes: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: number
          pdf_path?: string | null
          staff_email?: string | null
          staff_name?: string | null
          status?: string
          submitted_at?: string | null
          total_minutes?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: number
          pdf_path?: string | null
          staff_email?: string | null
          staff_name?: string | null
          status?: string
          submitted_at?: string | null
          total_minutes?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      staff_todo_comments: {
        Row: {
          author_id: string | null
          author_name: string | null
          body: string
          created_at: string
          id: string
          list_id: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          list_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_todo_comments_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "staff_todo_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_todo_items: {
        Row: {
          actual_minutes: number | null
          created_at: string
          done_at: string | null
          done_by: string | null
          estimated_minutes: number | null
          id: string
          is_done: boolean
          list_id: string
          note: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          actual_minutes?: number | null
          created_at?: string
          done_at?: string | null
          done_by?: string | null
          estimated_minutes?: number | null
          id?: string
          is_done?: boolean
          list_id: string
          note?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          actual_minutes?: number | null
          created_at?: string
          done_at?: string | null
          done_by?: string | null
          estimated_minutes?: number | null
          id?: string
          is_done?: boolean
          list_id?: string
          note?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_todo_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "staff_todo_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_todo_lists: {
        Row: {
          actual_minutes: number | null
          assigned_email: string | null
          assigned_name: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          description: string | null
          due_date: string | null
          email_sent: boolean
          email_sent_at: string | null
          estimated_minutes: number | null
          id: string
          location: string | null
          priority: string
          sent_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_minutes?: number | null
          assigned_email?: string | null
          assigned_name?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          due_date?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
          estimated_minutes?: number | null
          id?: string
          location?: string | null
          priority?: string
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_minutes?: number | null
          assigned_email?: string | null
          assigned_name?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          due_date?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
          estimated_minutes?: number | null
          id?: string
          location?: string | null
          priority?: string
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      used_machines: {
        Row: {
          category: string
          content: Json | null
          created_at: string
          description: string | null
          hours: number | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          location: string | null
          manufacturer: string
          model: string
          price_net: number | null
          price_on_request: boolean | null
          reference_number: string | null
          slug: string | null
          specifications: Json | null
          status: string
          updated_at: string
          year: number | null
        }
        Insert: {
          category: string
          content?: Json | null
          created_at?: string
          description?: string | null
          hours?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location?: string | null
          manufacturer: string
          model: string
          price_net?: number | null
          price_on_request?: boolean | null
          reference_number?: string | null
          slug?: string | null
          specifications?: Json | null
          status?: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          category?: string
          content?: Json | null
          created_at?: string
          description?: string | null
          hours?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location?: string | null
          manufacturer?: string
          model?: string
          price_net?: number | null
          price_on_request?: boolean | null
          reference_number?: string | null
          slug?: string | null
          specifications?: Json | null
          status?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      b2b_profiles_customer: {
        Row: {
          assigned_contact_override: Json | null
          assigned_location: string | null
          billing_email: string | null
          city: string | null
          company_name: string | null
          contact_email: string | null
          contact_first_name: string | null
          contact_last_name: string | null
          contact_phone: string | null
          contact_position: string | null
          country: string | null
          created_at: string | null
          credit_limit: number | null
          deletion_requested_at: string | null
          document_filename: string | null
          document_url: string | null
          house_number: string | null
          id: string | null
          legal_form: string | null
          payment_due_days: number | null
          postal_code: string | null
          postal_invoice: boolean | null
          status: Database["public"]["Enums"]["b2b_status"] | null
          street: string | null
          tax_id: string | null
          trade_register_number: string | null
          updated_at: string | null
          used_credit: number | null
          user_id: string | null
          vat_id_verified: boolean | null
        }
        Insert: {
          assigned_contact_override?: Json | null
          assigned_location?: string | null
          billing_email?: string | null
          city?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          country?: string | null
          created_at?: string | null
          credit_limit?: number | null
          deletion_requested_at?: string | null
          document_filename?: string | null
          document_url?: string | null
          house_number?: string | null
          id?: string | null
          legal_form?: string | null
          payment_due_days?: number | null
          postal_code?: string | null
          postal_invoice?: boolean | null
          status?: Database["public"]["Enums"]["b2b_status"] | null
          street?: string | null
          tax_id?: string | null
          trade_register_number?: string | null
          updated_at?: string | null
          used_credit?: number | null
          user_id?: string | null
          vat_id_verified?: boolean | null
        }
        Update: {
          assigned_contact_override?: Json | null
          assigned_location?: string | null
          billing_email?: string | null
          city?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          country?: string | null
          created_at?: string | null
          credit_limit?: number | null
          deletion_requested_at?: string | null
          document_filename?: string | null
          document_url?: string | null
          house_number?: string | null
          id?: string | null
          legal_form?: string | null
          payment_due_days?: number | null
          postal_code?: string | null
          postal_invoice?: boolean | null
          status?: Database["public"]["Enums"]["b2b_status"] | null
          street?: string | null
          tax_id?: string | null
          trade_register_number?: string | null
          updated_at?: string | null
          used_credit?: number | null
          user_id?: string | null
          vat_id_verified?: boolean | null
        }
        Relationships: []
      }
      local_category_content_public: {
        Row: {
          category: string | null
          faqs: Json | null
          hookline: string | null
          location: string | null
          standort_fakten: string | null
        }
        Insert: {
          category?: string | null
          faqs?: Json | null
          hookline?: string | null
          location?: string | null
          standort_fakten?: string | null
        }
        Update: {
          category?: string | null
          faqs?: Json | null
          hookline?: string | null
          location?: string | null
          standort_fakten?: string | null
        }
        Relationships: []
      }
      maintenance_due_overview: {
        Row: {
          current_operating_hours: number | null
          due_status: string | null
          instance_id: string | null
          internal_inventory_number: string | null
          interval_id: string | null
          interval_type:
            | Database["public"]["Enums"]["maintenance_interval_type"]
            | null
          location: string | null
          managed_product_id: string | null
          next_due_at: string | null
          next_due_hours: number | null
          product_name: string | null
          product_slug: string | null
          serial_number: string | null
          title: string | null
          warn_days_before: number | null
        }
        Relationships: []
      }
      managed_products_public: {
        Row: {
          available_locations: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          detailed_description: string | null
          drive_type: string | null
          external_manual_url: string | null
          features: string[] | null
          id: string | null
          image_alts: string[] | null
          images: string[] | null
          min_rental_months: number | null
          model_name: string | null
          name: string | null
          on_request: boolean | null
          pdf_url: string | null
          price_per_day: string | null
          price_per_month: string | null
          price_unit_label: string | null
          price_weekend: string | null
          rental_notes: string[] | null
          rentware_code: Json | null
          seo_faqs: Json | null
          seo_local_content: Json | null
          seo_meta_description: string | null
          slug: string | null
          sort_order: number | null
          specifications: Json | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string | null
          video_url: string | null
          video_urls: string[] | null
          weight_kg: number | null
        }
        Insert: {
          available_locations?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          detailed_description?: string | null
          drive_type?: string | null
          external_manual_url?: string | null
          features?: string[] | null
          id?: string | null
          image_alts?: string[] | null
          images?: string[] | null
          min_rental_months?: number | null
          model_name?: string | null
          name?: string | null
          on_request?: boolean | null
          pdf_url?: string | null
          price_per_day?: string | null
          price_per_month?: string | null
          price_unit_label?: string | null
          price_weekend?: string | null
          rental_notes?: string[] | null
          rentware_code?: Json | null
          seo_faqs?: Json | null
          seo_local_content?: Json | null
          seo_meta_description?: string | null
          slug?: string | null
          sort_order?: number | null
          specifications?: Json | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          video_url?: string | null
          video_urls?: string[] | null
          weight_kg?: number | null
        }
        Update: {
          available_locations?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          detailed_description?: string | null
          drive_type?: string | null
          external_manual_url?: string | null
          features?: string[] | null
          id?: string | null
          image_alts?: string[] | null
          images?: string[] | null
          min_rental_months?: number | null
          model_name?: string | null
          name?: string | null
          on_request?: boolean | null
          pdf_url?: string | null
          price_per_day?: string | null
          price_per_month?: string | null
          price_unit_label?: string | null
          price_weekend?: string | null
          rental_notes?: string[] | null
          rentware_code?: Json | null
          seo_faqs?: Json | null
          seo_local_content?: Json | null
          seo_meta_description?: string | null
          slug?: string | null
          sort_order?: number | null
          specifications?: Json | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          video_url?: string | null
          video_urls?: string[] | null
          weight_kg?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_todo_list: {
        Args: { _list_id: string; _user_id: string }
        Returns: boolean
      }
      complete_maintenance: {
        Args: {
          _cost: number
          _description: string
          _hours_at_service: number
          _interval_id: string
          _parts_replaced: string
          _performed_at: string
          _performed_by_name: string
        }
        Returns: string
      }
      confirm_b2b_email: { Args: { _user_id: string }; Returns: undefined }
      generate_delivery_note_number: { Args: never; Returns: string }
      generate_inquiry_offer_number: { Args: never; Returns: string }
      generate_invoice_number: { Args: never; Returns: string }
      generate_offer_number: { Args: never; Returns: string }
      generate_return_protocol_number: { Args: never; Returns: string }
      get_authorized_person_limit: {
        Args: { _user_id: string }
        Returns: number
      }
      get_authorized_profile_ids: {
        Args: { _user_id: string }
        Returns: string[]
      }
      get_b2b_profile_id_for_user: {
        Args: { _user_id: string }
        Returns: string
      }
      get_b2b_profile_locked_fields: {
        Args: { _profile_id: string }
        Returns: {
          assigned_location: string
          credit_limit: number
          internal_notes: string
          rejection_reason: string
          status: Database["public"]["Enums"]["b2b_status"]
          status_changed_by: string
          used_credit: number
          vat_id_verified: boolean
        }[]
      }
      get_user_email: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_b2b: { Args: { _user_id: string }; Returns: boolean }
      is_authorized_person: { Args: { _user_id: string }; Returns: boolean }
      is_staff_member: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_admin_login: { Args: never; Returns: undefined }
      mark_overdue_invoices: { Args: never; Returns: number }
      sign_delivery_note: {
        Args: {
          _agb_accepted?: boolean
          _note_id: string
          _signature_data: string
        }
        Returns: undefined
      }
      sign_return_protocol: {
        Args: { _protocol_id: string; _signature_data: string }
        Returns: undefined
      }
      update_b2b_profile_with_pending: {
        Args: {
          _assigned_location: string
          _billing_email: string
          _city: string
          _company_name: string
          _contact_first_name: string
          _contact_last_name: string
          _contact_phone: string
          _contact_position: string
          _house_number: string
          _legal_form: string
          _postal_code: string
          _street: string
          _tax_id: string
          _trade_register_number: string
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "standort_mitarbeiter"
        | "buchhaltung"
        | "readonly"
      b2b_status: "pending" | "approved" | "rejected"
      instance_status:
        | "available"
        | "rented"
        | "maintenance"
        | "repair"
        | "retired"
        | "lost"
      maintenance_interval_type:
        | "hours"
        | "days"
        | "months"
        | "years"
        | "one_time"
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
      app_role: [
        "admin",
        "user",
        "standort_mitarbeiter",
        "buchhaltung",
        "readonly",
      ],
      b2b_status: ["pending", "approved", "rejected"],
      instance_status: [
        "available",
        "rented",
        "maintenance",
        "repair",
        "retired",
        "lost",
      ],
      maintenance_interval_type: [
        "hours",
        "days",
        "months",
        "years",
        "one_time",
      ],
    },
  },
} as const
