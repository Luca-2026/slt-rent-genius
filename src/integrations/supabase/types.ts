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
          invoice_date: string
          invoice_number: string
          is_reverse_charge: boolean
          net_amount: number
          notes: string | null
          payment_due_days: number
          reservation_id: string | null
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
          invoice_date: string
          invoice_number: string
          is_reverse_charge?: boolean
          net_amount?: number
          notes?: string | null
          payment_due_days?: number
          reservation_id?: string | null
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
          invoice_date?: string
          invoice_number?: string
          is_reverse_charge?: boolean
          net_amount?: number
          notes?: string | null
          payment_due_days?: number
          reservation_id?: string | null
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
        ]
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
          additional_services: Json | null
          b2b_profile_id: string
          created_at: string
          delivery_cost: number
          deposit: number | null
          email_sent: boolean
          email_sent_at: string | null
          file_name: string | null
          file_url: string | null
          gross_amount: number
          id: string
          is_reverse_charge: boolean
          net_amount: number
          notes: string | null
          offer_date: string
          offer_number: string
          reservation_id: string | null
          status: string
          updated_at: string
          valid_until: string | null
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          additional_services?: Json | null
          b2b_profile_id: string
          created_at?: string
          delivery_cost?: number
          deposit?: number | null
          email_sent?: boolean
          email_sent_at?: string | null
          file_name?: string | null
          file_url?: string | null
          gross_amount?: number
          id?: string
          is_reverse_charge?: boolean
          net_amount?: number
          notes?: string | null
          offer_date: string
          offer_number: string
          reservation_id?: string | null
          status?: string
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          additional_services?: Json | null
          b2b_profile_id?: string
          created_at?: string
          delivery_cost?: number
          deposit?: number | null
          email_sent?: boolean
          email_sent_at?: string | null
          file_name?: string | null
          file_url?: string | null
          gross_amount?: number
          id?: string
          is_reverse_charge?: boolean
          net_amount?: number
          notes?: string | null
          offer_date?: string
          offer_number?: string
          reservation_id?: string | null
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
    }
    Functions: {
      confirm_b2b_email: { Args: { _user_id: string }; Returns: undefined }
      generate_delivery_note_number: { Args: never; Returns: string }
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_b2b: { Args: { _user_id: string }; Returns: boolean }
      is_authorized_person: { Args: { _user_id: string }; Returns: boolean }
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
    },
  },
} as const
