import { queryOptions } from '@tanstack/react-query'
import { fetchDebtPaymentsInRange } from '#/lib/queries/debts'
import { fetchExpenses, resolveDateRange } from '#/lib/queries/expenses'
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
      const { from, to } = resolveDateRange(filters)
      const [expenses, debtPayments] = await Promise.all([
        fetchExpenses({ ...filters, kategori: 'semua' }),
        fetchDebtPaymentsInRange(from, to),
      ])
      return computeSummary(expenses, debtPayments)
    },
    staleTime: 30_000,
  })
}
