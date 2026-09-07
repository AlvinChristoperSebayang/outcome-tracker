import { z } from 'zod'

export const debtSchema = z.object({
  name: z.string().min(1, 'Nama hutang wajib diisi.'),
  totalAmount: z
    .number('Jumlah harus lebih besar dari 0.')
    .gt(0, 'Jumlah harus lebih besar dari 0.'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
})

export type DebtInput = z.infer<typeof debtSchema>

export const debtPaymentSchema = z.object({
  amount: z
    .number('Jumlah harus lebih besar dari 0.')
    .gt(0, 'Jumlah harus lebih besar dari 0.'),
  paymentDate: z.string().min(1, 'Tanggal wajib diisi.'),
  notes: z.string().optional(),
})

export type DebtPaymentInput = z.infer<typeof debtPaymentSchema>
