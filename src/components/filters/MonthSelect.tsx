import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { getMonthOptions } from '#/lib/utils/date'

const MONTH_OPTIONS = getMonthOptions()

export function MonthSelect({
  value,
  onChange,
}: {
  value?: string
  onChange: (value: string | undefined) => void
}) {
  return (
    <Select
      value={value ?? 'semua'}
      onValueChange={(v) => onChange(v === 'semua' ? undefined : v)}
    >
      <SelectTrigger className="w-full sm:w-48" aria-label="Filter bulan">
        <SelectValue placeholder="Semua Bulan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="semua">Semua Bulan</SelectItem>
        {MONTH_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
