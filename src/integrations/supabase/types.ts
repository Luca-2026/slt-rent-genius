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
      b2b_profiles: {
        Row: {
          city: string
          company_name: string
          contact_email: string
          contact_first_name: string
          contact_last_name: string
          contact_phone: string
          contact_position: string | null
          country: string | null
          created_at: string
          document_filename: string | null
          document_url: string | null
          house_number: string | null
          id: string
          internal_notes: string | null
          legal_form: string | null
          postal_code: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["b2b_status"]
          status_changed_at: string | null
          status_changed_by: string | null
          street: string
          tax_id: string | null
          trade_register_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          company_name: string
          contact_email: string
          contact_first_name: string
          contact_last_name: string
          contact_phone: string
          contact_position?: string | null
          country?: string | null
          created_at?: string
          document_filename?: string | null
          document_url?: string | null
          house_number?: string | null
          id?: string
          internal_notes?: string | null
          legal_form?: string | null
          postal_code: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["b2b_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          street: string
          tax_id?: string | null
          trade_register_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          company_name?: string
          contact_email?: string
          contact_first_name?: string
          contact_last_name?: string
          contact_phone?: string
          contact_position?: string | null
          country?: string | null
          created_at?: string
          document_filename?: string | null
          document_url?: string | null
          house_number?: string | null
          id?: string
          internal_notes?: string | null
          legal_form?: string | null
          postal_code?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["b2b_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          street?: string
          tax_id?: string | null
          trade_register_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_requests: {
        Row: {
          additional_services: string | null
          attachment_urls: string[] | null
          created_at: string
          delivery_required: boolean | null
          end_date: string | null
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
