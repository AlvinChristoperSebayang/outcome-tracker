import type { Database } from './database.types'

export type BudgetRow = Database['public']['Tables']['budgets']['Row']
export type BudgetPocketRow =
  Database['public']['Tables']['budget_pockets']['Row']

export interface BudgetPocketWithSpending extends BudgetPocketRow {
  spent: number
  remaining: number
  isOverBudget: boolean
}

export interface MonthlyBudget {
  budget: BudgetRow | null
  pockets: Array<BudgetPocketWithSpending>
  totalAllocated: number
  totalSpent: number
}
