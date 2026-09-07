import { queryOptions } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '#/lib/supabase/client'
import { toDateOnlyString } from '#/lib/utils/date'
import type { DebtPaymentRow, DebtWithProgress } from '#/types/debt'

/** Debt repayments are real cash outflows, so dashboard/report totals fold them in. */
export async function fetchDebtPaymentsInRange(
  from: Date,
  to: Date,
): Promise<Array<DebtPaymentRow>> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('debt_payments')
    .select('*')
    .gte('payment_date', toDateOnlyString(from))
    .lte('payment_date', toDateOnlyString(to))

  if (error) throw new Error('Terjadi kesalahan saat mengambil data.')
  return data
}

export async function fetchDebts(): Promise<Array<DebtWithProgress>> {
  const supabase = getSupabaseBrowserClient()

  const { data: debts, error: debtsError } = await supabase
    .from('debts')
    .select('*')
    .order('created_at', { ascending: false })

  if (debtsError) throw new Error('Terjadi kesalahan saat mengambil data.')
  if (debts.length === 0) return []

  const { data: payments, error: paymentsError } = await supabase
    .from('debt_payments')
    .select('*')
    .in(
      'debt_id',
      debts.map((debt) => debt.id),
    )
    .order('payment_date', { ascending: false })

  if (paymentsError) throw new Error('Terjadi kesalahan saat mengambil data.')

  return debts.map((debt) => {
    const debtPayments = payments.filter(
      (payment) => payment.debt_id === debt.id,
    )
    const paidAmount = debtPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    )
    const remainingAmount = Number(debt.total_amount) - paidAmount

    return {
      ...debt,
      paidAmount,
      remainingAmount,
      status:
        remainingAmount <= 0 ? ('lunas' as const) : ('belum-lunas' as const),
      payments: debtPayments,
    }
  })
}

export function debtsQueryOptions() {
  return queryOptions({
    queryKey: ['debts'],
    queryFn: fetchDebts,
    staleTime: 30_000,
  })
}
