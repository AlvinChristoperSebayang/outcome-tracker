import { queryOptions } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '#/lib/supabase/client'
import { formatMonthLabel } from '#/lib/utils/date'
import type { SavingsSummary } from '#/types/savings'

export async function fetchSavingsSummary(): Promise<SavingsSummary> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from('budget_pockets')
    .select('amount, budget:budgets(month)')
    .eq('is_savings', true)

  if (error) throw new Error('Terjadi kesalahan saat mengambil data.')

  const totalsByMonth = new Map<string, number>()
  for (const row of data) {
    const month = row.budget.month
    totalsByMonth.set(
      month,
      (totalsByMonth.get(month) ?? 0) + Number(row.amount),
    )
  }

  const contributions = Array.from(totalsByMonth.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, amount]) => ({ month: formatMonthLabel(month), amount }))

  return {
    total: data.reduce((sum, row) => sum + Number(row.amount), 0),
    contributions,
  }
}

export function savingsSummaryQueryOptions() {
  return queryOptions({
    queryKey: ['savings', 'summary'],
    queryFn: fetchSavingsSummary,
    staleTime: 30_000,
  })
}
