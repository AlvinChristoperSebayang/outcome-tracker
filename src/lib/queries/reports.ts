import { queryOptions } from '@tanstack/react-query'
import { differenceInCalendarDays } from 'date-fns'
import { fetchDebtPaymentsInRange } from '#/lib/queries/debts'
import { fetchExpenses, resolveDateRange } from '#/lib/queries/expenses'
import {
  computeCategoryBreakdown,
  computeSummary,
  computeTimeSeries,
} from '#/lib/utils/expense-stats'
import type { DebtPaymentRow } from '#/types/debt'
import type { ExpenseCategory, ExpenseRow, PeriodPreset } from '#/types/expense'

export interface ReportFilters {
  periode: PeriodPreset
  dari?: string
  sampai?: string
  kategori?: ExpenseCategory | 'semua'
}

export interface ReportData {
  expenses: Array<ExpenseRow>
  debtPayments: Array<DebtPaymentRow>
  summary: ReturnType<typeof computeSummary>
  breakdown: ReturnType<typeof computeCategoryBreakdown>
  timeSeries: ReturnType<typeof computeTimeSeries>
  range: { from: Date; to: Date }
}

export function reportQueryOptions(filters: ReportFilters) {
  return queryOptions({
    queryKey: ['report', filters],
    queryFn: async (): Promise<ReportData> => {
      const range = resolveDateRange(filters)
      const includeDebt = !filters.kategori || filters.kategori === 'semua'
      const [expenses, debtPayments] = await Promise.all([
        fetchExpenses(filters),
        includeDebt
          ? fetchDebtPaymentsInRange(range.from, range.to)
          : Promise.resolve([]),
      ])
      const granularity =
        differenceInCalendarDays(range.to, range.from) <= 31 ? 'day' : 'month'

      return {
        expenses,
        debtPayments,
        summary: computeSummary(expenses, debtPayments),
        breakdown: computeCategoryBreakdown(expenses, debtPayments),
        timeSeries: computeTimeSeries(expenses, granularity, debtPayments),
        range,
      }
    },
    staleTime: 30_000,
  })
}
