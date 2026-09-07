import { z } from 'zod'

export const incomeSchema = z.object({
  incomeAmount: z
    .number('Pemasukan harus diisi.')
    .min(0, 'Pemasukan tidak boleh negatif.'),
})

export type IncomeInput = z.infer<typeof incomeSchema>

export const pocketBaseSchema = z.object({
  name: z.string().min(1, 'Nama kantong wajib diisi.'),
  allocationMode: z.enum(['amount', 'percentage']),
  amount: z.number().gt(0, 'Jumlah harus lebih besar dari 0.').optional(),
  percentage: z
    .number()
    .gt(0, 'Persentase harus lebih besar dari 0.')
    .max(100, 'Persentase maksimal 100.')
    .optional(),
})

export const pocketSchema = pocketBaseSchema.refine(
  (data) =>
    data.allocationMode === 'amount'
      ? data.amount !== undefined
      : data.percentage !== undefined,
  { message: 'Jumlah atau persentase wajib diisi.', path: ['amount'] },
)

export type PocketInput = z.infer<typeof pocketSchema>
