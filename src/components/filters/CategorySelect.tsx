import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { EXPENSE_CATEGORIES } from '#/types/expense'
import type { ExpenseCategory } from '#/types/expense'

export function CategorySelect({
  value,
  onChange,
  allLabel = 'Semua Kategori',
}: {
  value?: ExpenseCategory | 'semua'
  onChange: (value: ExpenseCategory | 'semua') => void
  allLabel?: string
}) {
  return (
    <Select
      value={value ?? 'semua'}
      onValueChange={(v) => onChange(v as ExpenseCategory | 'semua')}
    >
      <SelectTrigger className="w-full sm:w-44" aria-label="Filter kategori">
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="semua">{allLabel}</SelectItem>
        {EXPENSE_CATEGORIES.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
