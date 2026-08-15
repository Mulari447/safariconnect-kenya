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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      destinations: {
        Row: {
          activities: string[]
          best_season: string | null
          category: string
          county: string
          created_at: string
          description: string | null
          featured: boolean
          highlights: string[]
          id: string
          name: string
          region: string
          slug: string
          summary: string
        }
        Insert: {
          activities?: string[]
          best_season?: string | null
          category: string
          county: string
          created_at?: string
          description?: string | null
          featured?: boolean
          highlights?: string[]
          id?: string
          name: string
          region: string
          slug: string
          summary: string
        }
        Update: {
          activities?: string[]
          best_season?: string | null
          category?: string
          county?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          highlights?: string[]
          id?: string
          name?: string
          region?: string
          slug?: string
          summary?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_kes: number
          billing_cycle: string
          company_id: string
          created_at: string
          currency: string
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          paid_at: string | null
          period_end: string
          period_start: string
          plan_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_kes?: number
          billing_cycle?: string
          company_id: string
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          plan_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_kes?: number
          billing_cycle?: string
          company_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          plan_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "operator_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "operator_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_requests: {
        Row: {
          company_id: string
          created_at: string
          id: string
          message: string | null
          status: string
          traveller_id: string
          trip_request_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          traveller_id: string
          trip_request_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          traveller_id?: string
          trip_request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "operator_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "operator_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_requests_trip_request_id_fkey"
            columns: ["trip_request_id"]
            isOneToOne: false
            referencedRelation: "trip_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_companies: {
        Row: {
          admin_note: string | null
          business_reg_number: string | null
          contact_person: string | null
          county: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          email: string | null
          employees: number | null
          id: string
          kato_membership: string | null
          kra_pin: string | null
          languages: string[]
          license_number: string | null
          logo_url: string | null
          maps_url: string | null
          name: string
          owner_id: string
          phone: string | null
          physical_address: string | null
          reviewed_at: string | null
          safari_specialties: string[]
          slug: string
          status: string
          tour_categories: string[]
          updated_at: string
          vehicle_types: string[]
          verified: boolean
          website: string | null
          whatsapp: string | null
          years_in_business: number | null
        }
        Insert: {
          admin_note?: string | null
          business_reg_number?: string | null
          contact_person?: string | null
          county?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          employees?: number | null
          id?: string
          kato_membership?: string | null
          kra_pin?: string | null
          languages?: string[]
          license_number?: string | null
          logo_url?: string | null
          maps_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          physical_address?: string | null
          reviewed_at?: string | null
          safari_specialties?: string[]
          slug: string
          status?: string
          tour_categories?: string[]
          updated_at?: string
          vehicle_types?: string[]
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
          years_in_business?: number | null
        }
        Update: {
          admin_note?: string | null
          business_reg_number?: string | null
          contact_person?: string | null
          county?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          employees?: number | null
          id?: string
          kato_membership?: string | null
          kra_pin?: string | null
          languages?: string[]
          license_number?: string | null
          logo_url?: string | null
          maps_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          physical_address?: string | null
          reviewed_at?: string | null
          safari_specialties?: string[]
          slug?: string
          status?: string
          tour_categories?: string[]
          updated_at?: string
          vehicle_types?: string[]
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      operator_subscriptions: {
        Row: {
          company_id: string
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operator_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "operator_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operator_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "operator_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operator_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          payment_id: string | null
          provider: string
          provider_invoice_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          payment_id?: string | null
          provider?: string
          provider_invoice_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          payment_id?: string | null
          provider?: string
          provider_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          channel: string
          company_id: string
          created_at: string
          due_at: string
          id: string
          invoice_id: string | null
          kind: string
          message: string | null
          sent_at: string | null
          updated_at: string
        }
        Insert: {
          channel?: string
          company_id: string
          created_at?: string
          due_at?: string
          id?: string
          invoice_id?: string | null
          kind?: string
          message?: string | null
          sent_at?: string | null
          updated_at?: string
        }
        Update: {
          channel?: string
          company_id?: string
          created_at?: string
          due_at?: string
          id?: string
          invoice_id?: string | null
          kind?: string
          message?: string | null
          sent_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "operator_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reminders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "operator_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reminders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_kes: number
          api_ref: string | null
          checkout_url: string | null
          company_id: string
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          invoice_id: string | null
          method: string
          mpesa_receipt: string | null
          payer_email: string | null
          payer_phone: string | null
          provider: string
          provider_invoice_id: string | null
          provider_state: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_kes?: number
          api_ref?: string | null
          checkout_url?: string | null
          company_id: string
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          invoice_id?: string | null
          method?: string
          mpesa_receipt?: string | null
          payer_email?: string | null
          payer_phone?: string | null
          provider?: string
          provider_invoice_id?: string | null
          provider_state?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_kes?: number
          api_ref?: string | null
          checkout_url?: string | null
          company_id?: string
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          invoice_id?: string | null
          method?: string
          mpesa_receipt?: string | null
          payer_email?: string | null
          payer_phone?: string | null
          provider?: string
          provider_invoice_id?: string | null
          provider_state?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "operator_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "operator_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          nationality: string | null
          phone: string | null
          preferred_language: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          nationality?: string | null
          phone?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          nationality?: string | null
          phone?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          review_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          review_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          review_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string | null
          body: string
          company_id: string | null
          created_at: string
          destination_slug: string | null
          helpful_count: number
          id: string
          photos: string[]
          rating: number
          title: string | null
          updated_at: string
          user_id: string
          verified_traveler: boolean
        }
        Insert: {
          author_name?: string | null
          body: string
          company_id?: string | null
          created_at?: string
          destination_slug?: string | null
          helpful_count?: number
          id?: string
          photos?: string[]
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
          verified_traveler?: boolean
        }
        Update: {
          author_name?: string | null
          body?: string
          company_id?: string | null
          created_at?: string
          destination_slug?: string | null
          helpful_count?: number
          id?: string
          photos?: string[]
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
          verified_traveler?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "operator_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "operator_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          crm_access: boolean
          description: string | null
          featured_listing: boolean
          id: string
          is_active: boolean
          lead_limit_monthly: number | null
          name: string
          package_limit: number | null
          premium_badge: boolean
          price_kes: number
          price_kes_annual: number
          priority_rank: number
          reports_access: boolean
          slug: string
          sort_order: number
          staff_accounts: number
          storage_mb: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          crm_access?: boolean
          description?: string | null
          featured_listing?: boolean
          id?: string
          is_active?: boolean
          lead_limit_monthly?: number | null
          name: string
          package_limit?: number | null
          premium_badge?: boolean
          price_kes?: number
          price_kes_annual?: number
          priority_rank?: number
          reports_access?: boolean
          slug: string
          sort_order?: number
          staff_accounts?: number
          storage_mb?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          crm_access?: boolean
          description?: string | null
          featured_listing?: boolean
          id?: string
          is_active?: boolean
          lead_limit_monthly?: number | null
          name?: string
          package_limit?: number | null
          premium_badge?: boolean
          price_kes?: number
          price_kes_annual?: number
          priority_rank?: number
          reports_access?: boolean
          slug?: string
          sort_order?: number
          staff_accounts?: number
          storage_mb?: number
          updated_at?: string
        }
        Relationships: []
      }
      trip_requests: {
        Row: {
          accommodation_type: string | null
          activities: string[]
          adults: number
          arrival_airport: string | null
          budget_usd: number | null
          children: number
          created_at: string
          destination_name: string
          destination_slug: string | null
          dietary_requirements: string | null
          end_date: string | null
          flexible_dates: boolean
          id: string
          luxury_level: string | null
          nationality: string | null
          notes: string | null
          pickup_location: string | null
          special_needs: string | null
          start_date: string | null
          status: string
          transport_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accommodation_type?: string | null
          activities?: string[]
          adults?: number
          arrival_airport?: string | null
          budget_usd?: number | null
          children?: number
          created_at?: string
          destination_name: string
          destination_slug?: string | null
          dietary_requirements?: string | null
          end_date?: string | null
          flexible_dates?: boolean
          id?: string
          luxury_level?: string | null
          nationality?: string | null
          notes?: string | null
          pickup_location?: string | null
          special_needs?: string | null
          start_date?: string | null
          status?: string
          transport_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accommodation_type?: string | null
          activities?: string[]
          adults?: number
          arrival_airport?: string | null
          budget_usd?: number | null
          children?: number
          created_at?: string
          destination_name?: string
          destination_slug?: string | null
          dietary_requirements?: string | null
          end_date?: string | null
          flexible_dates?: boolean
          id?: string
          luxury_level?: string | null
          nationality?: string | null
          notes?: string | null
          pickup_location?: string | null
          special_needs?: string | null
          start_date?: string | null
          status?: string
          transport_preference?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
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
      operator_directory: {
        Row: {
          county: string | null
          created_at: string | null
          description: string | null
          featured_listing: boolean | null
          id: string | null
          logo_url: string | null
          name: string | null
          plan_name: string | null
          premium_badge: boolean | null
          priority_rank: number | null
          slug: string | null
          verified: boolean | null
          website: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      company_plan: {
        Args: { _company_id: string }
        Returns: {
          created_at: string
          crm_access: boolean
          description: string | null
          featured_listing: boolean
          id: string
          is_active: boolean
          lead_limit_monthly: number | null
          name: string
          package_limit: number | null
          premium_badge: boolean
          price_kes: number
          price_kes_annual: number
          priority_rank: number
          reports_access: boolean
          slug: string
          sort_order: number
          staff_accounts: number
          storage_mb: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "subscription_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_accepted_lead: {
        Args: { _operator_user_id: string; _traveller_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_company: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operator" | "customer"
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
      app_role: ["admin", "operator", "customer"],
    },
  },
} as const
