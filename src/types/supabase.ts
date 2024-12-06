export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          is_team: boolean
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          is_team?: boolean
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_team?: boolean
          email?: string
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
        }
      }
      riddles: {
        Row: {
          id: number
          question: string
          answer: string
          hint1: string
          hint2: string
          order_number: number
          created_at: string
          updated_at: string
          is_active: boolean
          riddle_type: string
          reference_image_url: string | null
        }
        Insert: {
          id?: number
          question: string
          answer: string
          hint1: string
          hint2: string
          order_number: number
          created_at?: string
          updated_at?: string
          is_active: boolean
          riddle_type: string
          reference_image_url?: string | null
        }
        Update: {
          id?: number
          question?: string
          answer?: string
          hint1?: string
          hint2?: string
          order_number?: number
          created_at?: string
          updated_at?: string
          is_active?: boolean
          riddle_type?: string
          reference_image_url?: string | null
        }
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          riddle_id: number
          answer: string
          image_url: string
          is_approved: boolean | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          riddle_id: number
          answer: string
          image_url: string
          is_approved?: boolean | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          riddle_id?: number
          answer?: string
          image_url?: string
          is_approved?: boolean | null
          submitted_at?: string
          updated_at?: string
        }
      }
      leaderboard: {
        Row: {
          id: number
          user_id: string
          score: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          score: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          score?: number
          created_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          current_riddle_id: number
          updated_at: string
          hint1_visible: boolean
          hint2_visible: boolean
          start_time: string | null
        }
        Insert: {
          id?: string
          user_id: string
          current_riddle_id: number
          updated_at?: string
          hint1_visible: boolean
          hint2_visible: boolean
          start_time?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          current_riddle_id?: number
          updated_at?: string
          hint1_visible?: boolean
          hint2_visible?: boolean
          start_time?: string | null
        }
      }
      app_settings: {
        Row: {
          id: number
          riddles_visible: boolean
        }
        Insert: {
          id?: number
          riddles_visible: boolean
        }
        Update: {
          id?: number
          riddles_visible?: boolean
        }
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Riddle = Tables<'riddles'>
export type User = Tables<'users'>
export type Team = Tables<'teams'>
export type Submission = Tables<'submissions'>
export type LeaderboardEntry = Tables<'leaderboard'>
export type Admin = Tables<'admins'>
export type UserProgress = Tables<'user_progress'>
export type AppSettings = Tables<'app_settings'>

