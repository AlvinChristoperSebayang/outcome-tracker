import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '#/lib/supabase/client'
import { monthValueToDateOnly } from '#/lib/utils/date'
import type { IncomeInput, PocketInput } from '#/lib/validations/budget'
import type { BudgetRow } from '#/types/budget'

async function getOrCreateBudget(monthValue: string): Promise<BudgetRow> {
  const supabase = getSupabaseBrowserClient()
  const month = monthValueToDateOnly(monthValue)

  const { data: existing, error: fetchError } = await supabase
    .from('budgets')
    .select('*')
    .eq('month', month)
    .maybeSingle()

  if (fetchError) throw new Error('Anggaran gagal disimpan. Silakan coba lagi.')
  if (existing) return existing

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Anggaran gagal disimpan. Silakan coba lagi.')

  const { data: created, error: createError } = await supabase
    .from('budgets')
    .insert({ user_id: user.id, month })
    .select()
    .single()

  if (createError)
    throw new Error('Anggaran gagal disimpan. Silakan coba lagi.')
  return created
}

async function setIncome(
  monthValue: string,
  input: IncomeInput,
): Promise<void> {
  const budget = await getOrCreateBudget(monthValue)
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('budgets')
    .update({ income_amount: input.incomeAmount })
    .eq('id', budget.id)

  if (error) throw new Error('Pemasukan gagal disimpan. Silakan coba lagi.')
}

function resolvePocketAmount(input: PocketInput, incomeAmount: number): number {
  if (input.allocationMode === 'percentage') {
    return Math.round((incomeAmount * (input.percentage ?? 0)) / 100)
  }
  return input.amount ?? 0
}

async function createPocket(
  monthValue: string,
  input: PocketInput,
): Promise<void> {
  const budget = await getOrCreateBudget(monthValue)
  const supabase = getSupabaseBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    throw new Error('Kantong anggaran gagal disimpan. Silakan coba lagi.')

  const { error } = await supabase.from('budget_pockets').insert({
    budget_id: budget.id,
    user_id: user.id,
    name: input.name,
    amount: resolvePocketAmount(input, Number(budget.income_amount)),
  })

  if (error)
    throw new Error('Kantong anggaran gagal disimpan. Silakan coba lagi.')
}

async function updatePocket(
  id: string,
  input: PocketInput,
  incomeAmount: number,
): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('budget_pockets')
    .update({
      name: input.name,
      amount: resolvePocketAmount(input, incomeAmount),
    })
    .eq('id', id)

  if (error)
    throw new Error('Kantong anggaran gagal disimpan. Silakan coba lagi.')
}

async function deletePocket(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from('budget_pockets').delete().eq('id', id)
  if (error)
    throw new Error('Kantong anggaran gagal dihapus. Silakan coba lagi.')
}

function useInvalidateBudgetQueries(monthValue: string) {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: ['budget', monthValue] })
}

export function useSetIncome(monthValue: string) {
  const invalidate = useInvalidateBudgetQueries(monthValue)
  return useMutation({
    mutationFn: (input: IncomeInput) => setIncome(monthValue, input),
    onSuccess: invalidate,
  })
}

export function useCreatePocket(monthValue: string) {
  const invalidate = useInvalidateBudgetQueries(monthValue)
  return useMutation({
    mutationFn: (input: PocketInput) => createPocket(monthValue, input),
    onSuccess: invalidate,
  })
}

export function useUpdatePocket(monthValue: string) {
  const invalidate = useInvalidateBudgetQueries(monthValue)
  return useMutation({
    mutationFn: ({
      id,
      input,
      incomeAmount,
    }: {
      id: string
      input: PocketInput
      incomeAmount: number
    }) => updatePocket(id, input, incomeAmount),
    onSuccess: invalidate,
  })
}

export function useDeletePocket(monthValue: string) {
  const invalidate = useInvalidateBudgetQueries(monthValue)
  return useMutation({
    mutationFn: deletePocket,
    onSuccess: invalidate,
  })
}
