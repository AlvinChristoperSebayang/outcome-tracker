import type { Database } from './database.types'

export type ExpenseRow = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export const EXPENSE_CATEGORIES = [
  'Makanan',
  'Belanja',
  'Transportasi',
  'Tagihan',
  'Hiburan',
  'Kesehatan',
  'Perjalanan',
  'Pendidikan',
  'Lainnya',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export type PeriodPreset =
  | 'hari-ini'
  | 'minggu-ini'
  | 'bulan-ini'
  | 'bulan-lalu'
  | 'tahun-ini'
  | 'custom'

export interface ExpenseFilters {
  periode: PeriodPreset
  dari?: string
  sampai?: string
  bulan?: string
  kategori?: ExpenseCategory | 'semua'
  cari?: string
}

export interface DateRange {
  from: Date
  to: Date
}
