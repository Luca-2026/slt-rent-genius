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
          b2b_profile_id: string
          created_at: string
          delivery_cost: number
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
          b2b_profile_id: string
          created_at?: string
          delivery_cost?: number
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
          b2b_profile_id?: string
          created_at?: string
          delivery_cost?: number
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
          deletion_requested_at: string | null
          document_filename: string | null
          document_url: string | null
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
          deletion_requested_at?: string | null
          document_filename?: string | null
          document_url?: string | null
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
          deletion_requested_at?: string | null
          document_filename?: string | null
          document_url?: string | null
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
          b2b_profile_id: string
          category_slug: string | null
          created_at: string
          discounted_price: number | null
          end_date: string | null
          id: string
          location: string
          notes: string | null
          original_price: number | null
          product_id: string
          product_name: string | null
          quantity: number
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          b2b_profile_id: string
          category_slug?: string | null
          created_at?: string
          discounted_price?: number | null
          end_date?: string | null
          id?: string
          location: string
          notes?: string | null
          original_price?: number | null
          product_id: string
          product_name?: string | null
          quantity?: number
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          b2b_profile_id?: string
          category_slug?: string | null
          created_at?: string
          discounted_price?: number | null
          end_date?: string | null
          id?: string
          location?: string
          notes?: string | null
          original_price?: number | null
          product_id?: string
          product_name?: string | null
          quantity?: number
          start_date?: string
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
        ]
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
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
      generate_offer_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_b2b: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
      b2b_status: ["pending", "approved", "rejected"],
    },
  },
} as const
