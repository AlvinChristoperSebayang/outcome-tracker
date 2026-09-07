import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { FieldError } from '#/components/FieldError'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { useSetIncome } from '#/lib/mutations/budgets'
import { formatNumberInput, parseNumberInput } from '#/lib/utils/currency'
import { incomeSchema } from '#/lib/validations/budget'

export function IncomeDialog({
  open,
  onOpenChange,
  monthValue,
  currentIncome,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthValue: string
  currentIncome: number
}) {
  const setIncome = useSetIncome(monthValue)

  const form = useForm({
    defaultValues: { incomeAmount: currentIncome },
    onSubmit: async ({ value }) => {
      try {
        await setIncome.mutateAsync(value)
        toast.success('Pemasukan berhasil disimpan.')
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Pemasukan gagal disimpan.',
        )
      }
    },
  })

  useEffect(() => {
    if (open) form.reset({ incomeAmount: currentIncome })
  }, [open, currentIncome, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pemasukan Bulan Ini</DialogTitle>
          <DialogDescription>
            Total pemasukan digunakan sebagai dasar saat membagi kantong
            anggaran berdasarkan persentase.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="incomeAmount"
            validators={{
              onChange: incomeSchema.shape.incomeAmount,
              onSubmit: incomeSchema.shape.incomeAmount,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Jumlah Pemasukan</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id={field.name}
                    inputMode="numeric"
                    className="pl-9"
                    placeholder="5.000.000"
                    value={
                      field.state.value
                        ? formatNumberInput(field.state.value)
                        : ''
                    }
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseNumberInput(e.target.value))
                    }
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                </div>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={setIncome.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
