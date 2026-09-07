import { queryOptions } from '@tanstack/react-query'
import { differenceInCalendarDays } from 'date-fns'
import { fetchExpenses, resolveDateRange } from '#/lib/queries/expenses'
import {
  computeCategoryBreakdown,
  computeSummary,
  computeTimeSeries,
} from '#/lib/utils/expense-stats'
import type { ExpenseCategory, ExpenseRow, PeriodPreset } from '#/types/expense'

export interface ReportFilters {
  periode: PeriodPreset
  dari?: string
  sampai?: string
  kategori?: ExpenseCategory | 'semua'
}

export interface ReportData {
  expenses: Array<ExpenseRow>
  summary: ReturnType<typeof computeSummary>
  breakdown: ReturnType<typeof computeCategoryBreakdown>
  timeSeries: ReturnType<typeof computeTimeSeries>
  range: { from: Date; to: Date }
}

export function reportQueryOptions(filters: ReportFilters) {
  return queryOptions({
    queryKey: ['report', filters],
    queryFn: async (): Promise<ReportData> => {
      const expenses = await fetchExpenses(filters)
      const range = resolveDateRange(filters)
      const granularity =
        differenceInCalendarDays(range.to, range.from) <= 31 ? 'day' : 'month'

      return {
        expenses,
        summary: computeSummary(expenses),
        breakdown: computeCategoryBreakdown(expenses),
        timeSeries: computeTimeSeries(expenses, granularity),
        range,
      }
    },
    staleTime: 30_000,
  })
}
