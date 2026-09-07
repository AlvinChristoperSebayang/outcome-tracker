import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '#/lib/supabase/client'
import type { DebtInput, DebtPaymentInput } from '#/lib/validations/debt'
import type { DebtRow } from '#/types/debt'

async function createDebt(input: DebtInput): Promise<DebtRow> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Hutang gagal disimpan. Silakan coba lagi.')

  const { data, error } = await supabase
    .from('debts')
    .insert({
      user_id: user.id,
      name: input.name,
      total_amount: input.totalAmount,
      due_date: input.dueDate || null,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) throw new Error('Hutang gagal disimpan. Silakan coba lagi.')
  return data
}

async function deleteDebt(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from('debts').delete().eq('id', id)
  if (error) throw new Error('Hutang gagal dihapus. Silakan coba lagi.')
}

async function addDebtPayment(
  debtId: string,
  input: DebtPaymentInput,
): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Pembayaran gagal disimpan. Silakan coba lagi.')

  const { error } = await supabase.from('debt_payments').insert({
    debt_id: debtId,
    user_id: user.id,
    amount: input.amount,
    payment_date: input.paymentDate,
    notes: input.notes || null,
  })

  if (error) throw new Error('Pembayaran gagal disimpan. Silakan coba lagi.')
}

function useInvalidateDebtQueries() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['debts'] })
    queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
    queryClient.invalidateQueries({ queryKey: ['report'] })
  }
}

export function useCreateDebt() {
  const invalidate = useInvalidateDebtQueries()
  return useMutation({ mutationFn: createDebt, onSuccess: invalidate })
}

export function useDeleteDebt() {
  const invalidate = useInvalidateDebtQueries()
  return useMutation({ mutationFn: deleteDebt, onSuccess: invalidate })
}

export function useAddDebtPayment() {
  const invalidate = useInvalidateDebtQueries()
  return useMutation({
    mutationFn: ({
      debtId,
      input,
    }: {
      debtId: string
      input: DebtPaymentInput
    }) => addDebtPayment(debtId, input),
    onSuccess: invalidate,
  })
}
