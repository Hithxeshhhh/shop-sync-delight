export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
  }
} 