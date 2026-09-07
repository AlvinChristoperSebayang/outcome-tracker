const CURRENCY_FORMATTERS = new Map<string, Intl.NumberFormat>()

function getFormatter(currency: string) {
  let formatter = CURRENCY_FORMATTERS.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    CURRENCY_FORMATTERS.set(currency, formatter)
  }
  return formatter
}

export function formatCurrency(amount: number, currency = 'IDR'): string {
  return getFormatter(currency).format(amount)
}

const THOUSANDS_FORMATTER = new Intl.NumberFormat('id-ID')

/** Formats a raw number with thousand separators, for use inside form inputs (no currency symbol). */
export function formatNumberInput(value: number): string {
  if (Number.isNaN(value)) return ''
  return THOUSANDS_FORMATTER.format(value)
}

/** Parses a locale-formatted number string (e.g. "35.000") back into a plain number. */
export function parseNumberInput(value: string): number {
  const digitsOnly = value.replace(/[^0-9]/g, '')
  return digitsOnly ? Number(digitsOnly) : 0
}
