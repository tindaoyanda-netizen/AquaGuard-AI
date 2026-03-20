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
      api_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          function_name: string
          id: string
          request_metadata: Json | null
          status_code: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          function_name: string
          id?: string
          request_metadata?: Json | null
          status_code?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          function_name?: string
          id?: string
          request_metadata?: Json | null
          status_code?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      environmental_reports: {
        Row: {
          ai_analysis: string | null
          ai_confidence_score: number | null
          county_id: string
          created_at: string
          description: string | null
          duplicate_of: string | null
          escalated: boolean | null
          escalated_at: string | null
          id: string
          image_url: string | null
          is_duplicate: boolean | null
          landmark: string | null
          latitude: number
          longitude: number
          photo_validation: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          reporter_id: string
          road_name: string | null
          severity_level: string | null
          status: Database["public"]["Enums"]["report_status"]
          sub_location: string | null
          town_name: string | null
          updated_at: string
        }
        Insert: {
          ai_analysis?: string | null
          ai_confidence_score?: number | null
          county_id: string
          created_at?: string
          description?: string | null
          duplicate_of?: string | null
          escalated?: boolean | null
          escalated_at?: string | null
          id?: string
          image_url?: string | null
          is_duplicate?: boolean | null
          landmark?: string | null
          latitude: number
          longitude: number
          photo_validation?: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          reporter_id: string
          road_name?: string | null
          severity_level?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          sub_location?: string | null
          town_name?: string | null
          updated_at?: string
        }
        Update: {
          ai_analysis?: string | null
          ai_confidence_score?: number | null
          county_id?: string
          created_at?: string
          description?: string | null
          duplicate_of?: string | null
          escalated?: boolean | null
          escalated_at?: string | null
          id?: string
          image_url?: string | null
          is_duplicate?: boolean | null
          landmark?: string | null
          latitude?: number
          longitude?: number
          photo_validation?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          reporter_id?: string
          road_name?: string | null
          severity_level?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          sub_location?: string | null
          town_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "environmental_reports_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "environmental_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      flood_predictions: {
        Row: {
          ai_summary: string | null
          confidence: number
          county_id: string
          created_at: string
          factors: Json | null
          id: string
          prediction_date: string
          risk_level: string
        }
        Insert: {
          ai_summary?: string | null
          confidence?: number
          county_id: string
          created_at?: string
          factors?: Json | null
          id?: string
          prediction_date?: string
          risk_level?: string
        }
        Update: {
          ai_summary?: string | null
          confidence?: number
          county_id?: string
          created_at?: string
          factors?: Json | null
          id?: string
          prediction_date?: string
          risk_level?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          county_id: string
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          county_id: string
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          county_id?: string
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      report_replies: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          message: string
          report_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          message: string
          report_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          message?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_replies_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "environmental_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_verifications: {
        Row: {
          action: Database["public"]["Enums"]["report_status"]
          admin_id: string
          comment: string | null
          created_at: string
          id: string
          report_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["report_status"]
          admin_id: string
          comment?: string | null
          created_at?: string
          id?: string
          report_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["report_status"]
          admin_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_verifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "environmental_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      water_metrics_history: {
        Row: {
          county_id: string
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          recorded_at: string
          source: string | null
        }
        Insert: {
          county_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          recorded_at?: string
          source?: string | null
        }
        Update: {
          county_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string
          source?: string | null
        }
        Relationships: []
      }
      water_stress_index: {
        Row: {
          calculated_at: string
          components: Json | null
          county_id: string
          id: string
          stress_score: number
          valid_until: string
        }
        Insert: {
          calculated_at?: string
          components?: Json | null
          county_id: string
          id?: string
          stress_score?: number
          valid_until?: string
        }
        Update: {
          calculated_at?: string
          components?: Json | null
          county_id?: string
          id?: string
          stress_score?: number
          valid_until?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_county: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "resident" | "county_admin" | "sub_admin"
      report_status: "pending" | "verified" | "rejected"
      report_type:
        | "flooded_road"
        | "dry_borehole"
        | "broken_kiosk"
        | "overflowing_river"
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
      app_role: ["resident", "county_admin", "sub_admin"],
      report_status: ["pending", "verified", "rejected"],
      report_type: [
        "flooded_road",
        "dry_borehole",
        "broken_kiosk",
        "overflowing_river",
      ],
    },
  },
} as const
