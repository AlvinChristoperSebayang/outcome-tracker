import { queryOptions } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '#/lib/supabase/client'
import {
  getMonthRange,
  monthValueToDateOnly,
  toDateOnlyString,
} from '#/lib/utils/date'
import type { MonthlyBudget } from '#/types/budget'

export async function fetchMonthlyBudget(
  monthValue: string,
): Promise<MonthlyBudget> {
  const supabase = getSupabaseBrowserClient()
  const month = monthValueToDateOnly(monthValue)

  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .select('*')
    .eq('month', month)
    .maybeSingle()

  if (budgetError) throw new Error('Terjadi kesalahan saat mengambil data.')

  if (!budget) {
    return { budget: null, pockets: [], totalAllocated: 0, totalSpent: 0 }
  }

  const { data: pockets, error: pocketsError } = await supabase
    .from('budget_pockets')
    .select('*')
    .eq('budget_id', budget.id)
    .order('created_at', { ascending: true })

  if (pocketsError) throw new Error('Terjadi kesalahan saat mengambil data.')

  if (pockets.length === 0) {
    return { budget, pockets: [], totalAllocated: 0, totalSpent: 0 }
  }

  const { from, to } = getMonthRange(monthValue)
  const pocketIds = pockets.map((pocket) => pocket.id)

  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('amount, pocket_id')
    .in('pocket_id', pocketIds)
    .gte('expense_date', toDateOnlyString(from))
    .lte('expense_date', toDateOnlyString(to))

  if (expensesError) throw new Error('Terjadi kesalahan saat mengambil data.')

  const spentByPocket = new Map<string, number>()
  for (const expense of expenses) {
    if (!expense.pocket_id) continue
    spentByPocket.set(
      expense.pocket_id,
      (spentByPocket.get(expense.pocket_id) ?? 0) + Number(expense.amount),
    )
  }

  const pocketsWithSpending = pockets.map((pocket) => {
    const spent = spentByPocket.get(pocket.id) ?? 0
    return {
      ...pocket,
      spent,
      remaining: Number(pocket.amount) - spent,
      isOverBudget: spent > Number(pocket.amount),
    }
  })

  return {
    budget,
    pockets: pocketsWithSpending,
    totalAllocated: pockets.reduce(
      (sum, pocket) => sum + Number(pocket.amount),
      0,
    ),
    totalSpent: pocketsWithSpending.reduce(
      (sum, pocket) => sum + pocket.spent,
      0,
    ),
  }
}

export function monthlyBudgetQueryOptions(monthValue: string) {
  return queryOptions({
    queryKey: ['budget', monthValue],
    queryFn: () => fetchMonthlyBudget(monthValue),
    staleTime: 30_000,
  })
}
