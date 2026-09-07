import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { parseDateOnly } from '#/lib/utils/date'
import type { ExpenseRow } from '#/types/expense'

export interface ExpenseSummary {
  total: number
  count: number
  average: number
  topCategory: string | null
}

export function computeSummary(expenses: Array<ExpenseRow>): ExpenseSummary {
  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  )
  const count = expenses.length
  const average = count > 0 ? total / count : 0
  const topCategory = computeCategoryBreakdown(expenses)[0]?.category ?? null

  return { total, count, average, topCategory }
}

export interface CategoryBreakdownItem {
  category: string
  total: number
  percentage: number
}

export function computeCategoryBreakdown(
  expenses: Array<ExpenseRow>,
): Array<CategoryBreakdownItem> {
  const totals = new Map<string, number>()
  let grandTotal = 0

  for (const expense of expenses) {
    const amount = Number(expense.amount)
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + amount)
    grandTotal += amount
  }

  return Array.from(totals.entries())
    .map(([category, total]) => ({
      category,
      total,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

export interface TimeSeriesPoint {
  key: string
  label: string
  total: number
}

/** Buckets expenses by day when the range is short, otherwise by month — keeps the bar chart readable. */
export function computeTimeSeries(
  expenses: Array<ExpenseRow>,
  granularity: 'day' | 'month',
): Array<TimeSeriesPoint> {
  const totals = new Map<string, number>()

  for (const expense of expenses) {
    const date = parseDateOnly(expense.expense_date)
    const key =
      granularity === 'day'
        ? format(date, 'yyyy-MM-dd')
        : format(date, 'yyyy-MM')
    totals.set(key, (totals.get(key) ?? 0) + Number(expense.amount))
  }

  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => ({
      key,
      total,
      label:
        granularity === 'day'
          ? format(parseDateOnly(key), 'd MMM', { locale: id })
          : format(new Date(`${key}-01T00:00:00`), 'MMM yyyy', { locale: id }),
    }))
}
