import type { Database } from './database.types'

export type DebtRow = Database['public']['Tables']['debts']['Row']
export type DebtPaymentRow =
  Database['public']['Tables']['debt_payments']['Row']

export interface DebtWithProgress extends DebtRow {
  paidAmount: number
  remainingAmount: number
  status: 'belum-lunas' | 'lunas'
  payments: Array<DebtPaymentRow>
}
