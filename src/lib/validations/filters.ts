import { z } from 'zod'
import { EXPENSE_CATEGORIES } from '#/types/expense'

const periodPresetSchema = z.enum([
  'hari-ini',
  'minggu-ini',
  'bulan-ini',
  'bulan-lalu',
  'tahun-ini',
  'custom',
])

const categoryFilterSchema = z.enum([...EXPENSE_CATEGORIES, 'semua'])

export const dashboardSearchSchema = z.object({
  periode: periodPresetSchema.catch('bulan-ini').default('bulan-ini'),
  dari: z.string().optional(),
  sampai: z.string().optional(),
})

export const expensesSearchSchema = z.object({
  periode: periodPresetSchema.catch('bulan-ini').default('bulan-ini'),
  dari: z.string().optional(),
  sampai: z.string().optional(),
  bulan: z.string().optional(),
  kategori: categoryFilterSchema.catch('semua').default('semua'),
  cari: z.string().optional(),
})

export const reportSearchSchema = z.object({
  periode: periodPresetSchema.catch('bulan-ini').default('bulan-ini'),
  dari: z.string().optional(),
  sampai: z.string().optional(),
  kategori: categoryFilterSchema.catch('semua').default('semua'),
})
