import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { parseDateOnly } from '#/lib/utils/date'
import type { DebtPaymentRow } from '#/types/debt'
import type { ExpenseRow } from '#/types/expense'

const DEBT_PAYMENT_CATEGORY = 'Cicilan Hutang'

export interface ExpenseSummary {
  total: number
  count: number
  average: number
  topCategory: string | null
}

export function computeSummary(
  expenses: Array<ExpenseRow>,
  debtPayments: Array<DebtPaymentRow> = [],
): ExpenseSummary {
  const expenseTotal = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  )
  const debtTotal = debtPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  )
  const total = expenseTotal + debtTotal
  const count = expenses.length + debtPayments.length
  const average = count > 0 ? total / count : 0
  const topCategory =
    computeCategoryBreakdown(expenses, debtPayments)[0]?.category ?? null

  return { total, count, average, topCategory }
}

export interface CategoryBreakdownItem {
  category: string
  total: number
  percentage: number
}

export function computeCategoryBreakdown(
  expenses: Array<ExpenseRow>,
  debtPayments: Array<DebtPaymentRow> = [],
): Array<CategoryBreakdownItem> {
  const totals = new Map<string, number>()
  let grandTotal = 0

  for (const expense of expenses) {
    const amount = Number(expense.amount)
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + amount)
    grandTotal += amount
  }

  if (debtPayments.length > 0) {
    const debtTotal = debtPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    )
    totals.set(
      DEBT_PAYMENT_CATEGORY,
      (totals.get(DEBT_PAYMENT_CATEGORY) ?? 0) + debtTotal,
    )
    grandTotal += debtTotal
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
  debtPayments: Array<DebtPaymentRow> = [],
): Array<TimeSeriesPoint> {
  const totals = new Map<string, number>()

  const addAmount = (dateValue: string, amount: number) => {
    const date = parseDateOnly(dateValue)
    const key =
      granularity === 'day'
        ? format(date, 'yyyy-MM-dd')
        : format(date, 'yyyy-MM')
    totals.set(key, (totals.get(key) ?? 0) + amount)
  }

  for (const expense of expenses) {
    addAmount(expense.expense_date, Number(expense.amount))
  }
  for (const payment of debtPayments) {
    addAmount(payment.payment_date, Number(payment.amount))
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
