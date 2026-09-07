import { DatePicker } from '#/components/DatePicker'
import { Label } from '#/components/ui/label'

export function DateRangeFields({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from?: string
  to?: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="dari" className="text-xs text-muted-foreground">
          Tanggal mulai
        </Label>
        <DatePicker id="dari" value={from} onChange={onFromChange} />
      </div>
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="sampai" className="text-xs text-muted-foreground">
          Tanggal akhir
        </Label>
        <DatePicker id="sampai" value={to} onChange={onToChange} />
      </div>
    </div>
  )
}
