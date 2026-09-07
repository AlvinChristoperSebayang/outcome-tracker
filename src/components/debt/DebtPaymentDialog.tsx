import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { DatePicker } from '#/components/DatePicker'
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
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useAddDebtPayment } from '#/lib/mutations/debts'
import {
  formatCurrency,
  formatNumberInput,
  parseNumberInput,
} from '#/lib/utils/currency'
import { todayDateOnlyString } from '#/lib/utils/date'
import { debtPaymentSchema } from '#/lib/validations/debt'
import type { DebtWithProgress } from '#/types/debt'

export function DebtPaymentDialog({
  debt,
  onOpenChange,
}: {
  debt: DebtWithProgress | null
  onOpenChange: (open: boolean) => void
}) {
  const addPayment = useAddDebtPayment()

  const form = useForm({
    defaultValues: { amount: 0, paymentDate: todayDateOnlyString(), notes: '' },
    onSubmit: async ({ value }) => {
      if (!debt) return
      const parsed = debtPaymentSchema.parse(value)
      try {
        await addPayment.mutateAsync({ debtId: debt.id, input: parsed })
        toast.success('Pembayaran berhasil dicatat.')
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Pembayaran gagal disimpan.',
        )
      }
    },
  })

  useEffect(() => {
    if (debt)
      form.reset({ amount: 0, paymentDate: todayDateOnlyString(), notes: '' })
  }, [debt, form])

  return (
    <Dialog open={Boolean(debt)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bayar Cicilan</DialogTitle>
          <DialogDescription>
            {debt
              ? `Sisa hutang "${debt.name}": ${formatCurrency(debt.remainingAmount)}`
              : ''}
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
            name="amount"
            validators={{
              onChange: debtPaymentSchema.shape.amount,
              onSubmit: debtPaymentSchema.shape.amount,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Jumlah Pembayaran</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id={field.name}
                    inputMode="numeric"
                    className="pl-9"
                    placeholder="100.000"
                    value={
                      field.state.value
                        ? formatNumberInput(field.state.value)
                        : ''
                    }
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

          <form.Field
            name="paymentDate"
            validators={{ onSubmit: debtPaymentSchema.shape.paymentDate }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Tanggal</Label>
                <DatePicker
                  id={field.name}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                />
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
            <Button type="submit" disabled={addPayment.isPending}>
              Simpan Pembayaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
