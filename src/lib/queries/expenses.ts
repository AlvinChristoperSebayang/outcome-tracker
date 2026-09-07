import { queryOptions } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '#/lib/supabase/client'
import {
  getMonthRange,
  getPeriodRange,
  toDateOnlyString,
} from '#/lib/utils/date'
import type { DateRange, ExpenseFilters, ExpenseRow } from '#/types/expense'

export function resolveDateRange(filters: ExpenseFilters): DateRange {
  if (filters.bulan) return getMonthRange(filters.bulan)
  return getPeriodRange(filters.periode, {
    from: filters.dari,
    to: filters.sampai,
  })
}

export async function fetchExpenses(
  filters: ExpenseFilters,
): Promise<Array<ExpenseRow>> {
  const supabase = getSupabaseBrowserClient()
  const { from, to } = resolveDateRange(filters)

  let query = supabase
    .from('expenses')
    .select('*')
    .gte('expense_date', toDateOnlyString(from))
    .lte('expense_date', toDateOnlyString(to))
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters.kategori && filters.kategori !== 'semua') {
    query = query.eq('category', filters.kategori)
  }
  if (filters.cari) {
    query = query.ilike('description', `%${filters.cari}%`)
  }

  const { data, error } = await query
  if (error) throw new Error('Terjadi kesalahan saat mengambil data.')
  return data
}

export function expensesQueryOptions(filters: ExpenseFilters) {
  return queryOptions({
    queryKey: ['expenses', filters],
    queryFn: () => fetchExpenses(filters),
    staleTime: 30_000,
  })
}

/** Cheap existence check used for the global empty state, independent of any active filter. */
export function hasAnyExpenseQueryOptions() {
  return queryOptions({
    queryKey: ['expenses', 'has-any'],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('expenses')
        .select('id')
        .limit(1)
      if (error) throw new Error('Terjadi kesalahan saat mengambil data.')
      return data.length > 0
    },
    staleTime: 30_000,
  })
}
