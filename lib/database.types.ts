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
      admin_activity_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
          rarity: string | null
          type: string | null
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          rarity?: string | null
          type?: string | null
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          rarity?: string | null
          type?: string | null
        }
        Relationships: []
      }
      challenge_comments: {
        Row: {
          challenge_id: string
          content: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          content: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_comments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          allowed_stack: string[] | null
          client_scenario: string | null
          created_at: string | null
          deadline: string | null
          evaluation_criteria: Json | null
          functional_requirements: string[] | null
          generated_at: string | null
          id: string
          mode: string | null
          participants_count: number | null
          performance_constraints: string[] | null
          required_roles: string[] | null
          short_description: string | null
          status: string | null
          submissions_count: number | null
          tags: string[] | null
          technical_constraints: string[] | null
          tier: number | null
          title: string
        }
        Insert: {
          allowed_stack?: string[] | null
          client_scenario?: string | null
          created_at?: string | null
          deadline?: string | null
          evaluation_criteria?: Json | null
          functional_requirements?: string[] | null
          generated_at?: string | null
          id?: string
          mode?: string | null
          participants_count?: number | null
          performance_constraints?: string[] | null
          required_roles?: string[] | null
          short_description?: string | null
          status?: string | null
          submissions_count?: number | null
          tags?: string[] | null
          technical_constraints?: string[] | null
          tier?: number | null
          title: string
        }
        Update: {
          allowed_stack?: string[] | null
          client_scenario?: string | null
          created_at?: string | null
          deadline?: string | null
          evaluation_criteria?: Json | null
          functional_requirements?: string[] | null
          generated_at?: string | null
          id?: string
          mode?: string | null
          participants_count?: number | null
          performance_constraints?: string[] | null
          required_roles?: string[] | null
          short_description?: string | null
          status?: string | null
          submissions_count?: number | null
          tags?: string[] | null
          technical_constraints?: string[] | null
          tier?: number | null
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      participations: {
        Row: {
          challenge_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_announcements: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      squad_members: {
        Row: {
          contribution_percentage: number | null
          is_leader: boolean | null
          joined_squad_at: string | null
          role: string | null
          squad_id: string
          user_id: string
        }
        Insert: {
          contribution_percentage?: number | null
          is_leader?: boolean | null
          joined_squad_at?: string | null
          role?: string | null
          squad_id: string
          user_id: string
        }
        Update: {
          contribution_percentage?: number | null
          is_leader?: boolean | null
          joined_squad_at?: string | null
          role?: string | null
          squad_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      squads: {
        Row: {
          avatar_emoji: string | null
          avg_ai_score: number | null
          created_at: string | null
          description: string | null
          github_repos: string[] | null
          global_rank: number | null
          id: string
          is_recruiting: boolean | null
          name: string
          project_count: number | null
          required_roles: string[] | null
          tags: string[] | null
          total_points: number | null
        }
        Insert: {
          avatar_emoji?: string | null
          avg_ai_score?: number | null
          created_at?: string | null
          description?: string | null
          github_repos?: string[] | null
          global_rank?: number | null
          id?: string
          is_recruiting?: boolean | null
          name: string
          project_count?: number | null
          required_roles?: string[] | null
          tags?: string[] | null
          total_points?: number | null
        }
        Update: {
          avatar_emoji?: string | null
          avg_ai_score?: number | null
          created_at?: string | null
          description?: string | null
          github_repos?: string[] | null
          global_rank?: number | null
          id?: string
          is_recruiting?: boolean | null
          name?: string
          project_count?: number | null
          required_roles?: string[] | null
          tags?: string[] | null
          total_points?: number | null
        }
        Relationships: []
      }
      submission_comments: {
        Row: {
          created_at: string
          id: string
          submission_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          submission_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          submission_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_comments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_upvotes: {
        Row: {
          created_at: string
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_upvotes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          ai_review_summary: string | null
          challenge_id: string | null
          challenge_title: string | null
          commit_count: number | null
          contribution_breakdown: Json | null
          description: string | null
          evaluated_at: string | null
          github_repos: string[] | null
          id: string
          is_flagged: boolean | null
          live_url: string | null
          peer_score: number | null
          scores: Json | null
          screenshot_url: string | null
          showcase_enabled: boolean
          squad_id: string | null
          squad_name: string | null
          status: string | null
          submitted_at: string | null
          tier: number | null
          total_score: number | null
          upvotes: number
          user_id: string | null
          username: string | null
          validation_steps: Json | null
        }
        Insert: {
          ai_review_summary?: string | null
          challenge_id?: string | null
          challenge_title?: string | null
          commit_count?: number | null
          contribution_breakdown?: Json | null
          description?: string | null
          evaluated_at?: string | null
          github_repos?: string[] | null
          id?: string
          is_flagged?: boolean | null
          live_url?: string | null
          peer_score?: number | null
          scores?: Json | null
          screenshot_url?: string | null
          showcase_enabled?: boolean
          squad_id?: string | null
          squad_name?: string | null
          status?: string | null
          submitted_at?: string | null
          tier?: number | null
          total_score?: number | null
          upvotes?: number
          user_id?: string | null
          username?: string | null
          validation_steps?: Json | null
        }
        Update: {
          ai_review_summary?: string | null
          challenge_id?: string | null
          challenge_title?: string | null
          commit_count?: number | null
          contribution_breakdown?: Json | null
          description?: string | null
          evaluated_at?: string | null
          github_repos?: string[] | null
          id?: string
          is_flagged?: boolean | null
          live_url?: string | null
          peer_score?: number | null
          scores?: Json | null
          screenshot_url?: string | null
          showcase_enabled?: boolean
          squad_id?: string | null
          squad_name?: string | null
          status?: string | null
          submitted_at?: string | null
          tier?: number | null
          total_score?: number | null
          upvotes?: number
          user_id?: string | null
          username?: string | null
          validation_steps?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          avg_ai_score: number | null
          avg_peer_score: number | null
          bio: string | null
          display_name: string
          email: string
          github_connected: boolean | null
          github_username: string | null
          global_rank: number | null
          id: string
          is_admin: boolean | null
          joined_at: string | null
          last_active_at: string | null
          league: string | null
          location: string | null
          notification_prefs: Json | null
          project_count: number | null
          role: string | null
          role_rank: number | null
          solo_projects: number | null
          squad_id: string | null
          squad_projects: number | null
          status: string | null
          streak: number | null
          tech_stack: Json | null
          total_points: number | null
          username: string
          website: string | null
        }
        Insert: {
          avatar?: string | null
          avg_ai_score?: number | null
          avg_peer_score?: number | null
          bio?: string | null
          display_name: string
          email: string
          github_connected?: boolean | null
          github_username?: string | null
          global_rank?: number | null
          id: string
          is_admin?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          league?: string | null
          location?: string | null
          notification_prefs?: Json | null
          project_count?: number | null
          role?: string | null
          role_rank?: number | null
          solo_projects?: number | null
          squad_id?: string | null
          squad_projects?: number | null
          status?: string | null
          streak?: number | null
          tech_stack?: Json | null
          total_points?: number | null
          username: string
          website?: string | null
        }
        Update: {
          avatar?: string | null
          avg_ai_score?: number | null
          avg_peer_score?: number | null
          bio?: string | null
          display_name?: string
          email?: string
          github_connected?: boolean | null
          github_username?: string | null
          global_rank?: number | null
          id?: string
          is_admin?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          league?: string | null
          location?: string | null
          notification_prefs?: Json | null
          project_count?: number | null
          role?: string | null
          role_rank?: number | null
          solo_projects?: number | null
          squad_id?: string | null
          squad_projects?: number | null
          status?: string | null
          streak?: number | null
          tech_stack?: Json | null
          total_points?: number | null
          username?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_squad"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
