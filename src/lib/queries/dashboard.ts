import { queryOptions } from '@tanstack/react-query'
import { fetchExpenses } from '#/lib/queries/expenses'
import { computeSummary } from '#/lib/utils/expense-stats'
import type { PeriodPreset } from '#/types/expense'

export interface DashboardFilters {
  periode: PeriodPreset
  dari?: string
  sampai?: string
  bulan?: string
}

export function dashboardSummaryQueryOptions(filters: DashboardFilters) {
  return queryOptions({
    queryKey: ['expense-summary', filters],
    queryFn: async () => {
      const expenses = await fetchExpenses({ ...filters, kategori: 'semua' })
      return computeSummary(expenses)
    },
    staleTime: 30_000,
  })
}
