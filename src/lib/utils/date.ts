import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from 'date-fns'
import { id } from 'date-fns/locale'
import type { DateRange, PeriodPreset } from '#/types/expense'

/** Parses a "YYYY-MM-DD" (DATE column) string as a local calendar date, avoiding UTC day-shift. */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Formats a Date as "YYYY-MM-DD" using local calendar fields (safe for DATE columns). */
export function toDateOnlyString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function todayDateOnlyString(): string {
  return toDateOnlyString(new Date())
}

/** "7 September 2026" */
export function formatDateLong(value: string | Date): string {
  const date = typeof value === 'string' ? parseDateOnly(value) : value
  return format(date, 'd MMMM yyyy', { locale: id })
}

/** "7 Sep 2026" */
export function formatDateShort(value: string | Date): string {
  const date = typeof value === 'string' ? parseDateOnly(value) : value
  return format(date, 'd MMM yyyy', { locale: id })
}

/** "08-08-2026" — compact numeric form, used where space is tight (e.g. date pickers on mobile). */
export function formatDateNumeric(value: string | Date): string {
  const date = typeof value === 'string' ? parseDateOnly(value) : value
  return format(date, 'dd-MM-yyyy')
}

export function getPeriodRange(
  preset: PeriodPreset,
  custom?: { from?: string; to?: string },
): DateRange {
  const now = new Date()

  switch (preset) {
    case 'hari-ini':
      return { from: now, to: now }
    case 'minggu-ini':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      }
    case 'bulan-ini':
      return { from: startOfMonth(now), to: endOfMonth(now) }
    case 'bulan-lalu': {
      const lastMonth = subMonths(now, 1)
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
    }
    case 'tahun-ini':
      return { from: startOfYear(now), to: endOfYear(now) }
    case 'custom':
      return {
        from: custom?.from ? parseDateOnly(custom.from) : startOfMonth(now),
        to: custom?.to ? parseDateOnly(custom.to) : now,
      }
    default:
      return { from: startOfMonth(now), to: endOfMonth(now) }
  }
}

export function getMonthRange(monthValue: string): DateRange {
  const [year, month] = monthValue.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return { from: startOfMonth(date), to: endOfMonth(date) }
}

/** "2026-09" -> "2026-09-01", matching how budgets.month (a DATE column) is stored. */
export function monthValueToDateOnly(monthValue: string): string {
  return `${monthValue}-01`
}

export function currentMonthValue(): string {
  return format(new Date(), 'yyyy-MM')
}

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  'hari-ini': 'Hari ini',
  'minggu-ini': 'Minggu ini',
  'bulan-ini': 'Bulan ini',
  'bulan-lalu': 'Bulan lalu',
  'tahun-ini': 'Tahun ini',
  custom: 'Periode khusus',
}

/** Generates {value, label} options for the month/year dropdown filter, most recent first. */
export function getMonthOptions(monthsBack = 24) {
  const now = new Date()
  return Array.from({ length: monthsBack }, (_, i) => {
    const date = subMonths(now, i)
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: id }),
    }
  })
}
