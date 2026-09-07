/**
 * Hand-authored to match db/migrations/0001_init.sql and 0002_budget_and_debt.sql.
 * Regenerate from the real project once Supabase is provisioned:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.types.ts
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string
          category: string
          expense_date: string
          notes: string | null
          pocket_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description: string
          category: string
          expense_date: string
          notes?: string | null
          pocket_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string
          category?: string
          expense_date?: string
          notes?: string | null
          pocket_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          month: string
          income_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          income_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          income_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      budget_pockets: {
        Row: {
          id: string
          budget_id: string
          user_id: string
          name: string
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          budget_id: string
          user_id: string
          name: string
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          budget_id?: string
          user_id?: string
          name?: string
          amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          id: string
          user_id: string
          name: string
          total_amount: number
          due_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          total_amount: number
          due_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          total_amount?: number
          due_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          id: string
          debt_id: string
          user_id: string
          amount: number
          payment_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          debt_id: string
          user_id: string
          amount: number
          payment_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          debt_id?: string
          user_id?: string
          amount?: number
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
