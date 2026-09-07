import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { cn } from '#/lib/utils'
import {
  formatDateNumeric,
  parseDateOnly,
  toDateOnlyString,
} from '#/lib/utils/date'

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  id,
  disabled,
}: {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? parseDateOnly(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start overflow-hidden font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {value ? formatDateNumeric(selected!) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(toDateOnlyString(date))
              setOpen(false)
            }
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
