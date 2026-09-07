import { z } from 'zod'
import { EXPENSE_CATEGORIES } from '#/types/expense'

export const expenseSchema = z.object({
  amount: z
    .number('Jumlah harus lebih besar dari 0.')
    .gt(0, 'Jumlah harus lebih besar dari 0.'),
  description: z.string().min(1, 'Deskripsi wajib diisi.'),
  category: z.enum(EXPENSE_CATEGORIES, {
    error: 'Silakan pilih kategori.',
  }),
  expenseDate: z.string().min(1, 'Tanggal wajib diisi.'),
  notes: z.string().optional(),
  pocketId: z.string().optional(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>
