import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { DateRangeFields } from '#/components/filters/DateRangeFields'
import { CategorySelect } from '#/components/filters/CategorySelect'
import { MonthSelect } from '#/components/filters/MonthSelect'
import { PeriodSelect } from '#/components/filters/PeriodSelect'
import { Input } from '#/components/ui/input'
import type { ExpenseFilters } from '#/types/expense'

export function ExpenseToolbar({
  filters,
  onChange,
}: {
  filters: ExpenseFilters
  onChange: (patch: Partial<ExpenseFilters>) => void
}) {
  const [searchValue, setSearchValue] = useState(filters.cari ?? '')

  useEffect(() => {
    setSearchValue(filters.cari ?? '')
  }, [filters.cari])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== (filters.cari ?? '')) {
        onChange({ cari: searchValue || undefined })
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchValue, filters.cari, onChange])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Cari pengeluaran..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Cari pengeluaran"
          />
        </div>
        <PeriodSelect
          value={filters.periode}
          onChange={(periode) => onChange({ periode })}
        />
        <MonthSelect
          value={filters.bulan}
          onChange={(bulan) => onChange({ bulan })}
        />
        <CategorySelect
          value={filters.kategori}
          onChange={(kategori) => onChange({ kategori })}
        />
      </div>

      {filters.periode === 'custom' && !filters.bulan && (
        <DateRangeFields
          from={filters.dari}
          to={filters.sampai}
          onFromChange={(dari) => onChange({ dari })}
          onToChange={(sampai) => onChange({ sampai })}
        />
      )}
    </div>
  )
}
