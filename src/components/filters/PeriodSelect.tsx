import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { PERIOD_LABELS } from '#/lib/utils/date'
import type { PeriodPreset } from '#/types/expense'

const ALL_OPTIONS = Object.keys(PERIOD_LABELS) as Array<PeriodPreset>

export function PeriodSelect({
  value,
  onChange,
  options = ALL_OPTIONS,
}: {
  value: PeriodPreset
  onChange: (value: PeriodPreset) => void
  options?: Array<PeriodPreset>
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PeriodPreset)}>
      <SelectTrigger className="w-full sm:w-44" aria-label="Filter periode">
        <SelectValue placeholder="Periode" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {PERIOD_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
