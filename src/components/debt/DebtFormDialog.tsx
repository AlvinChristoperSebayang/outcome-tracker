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
import { Textarea } from '#/components/ui/textarea'
import { useCreateDebt } from '#/lib/mutations/debts'
import { formatNumberInput, parseNumberInput } from '#/lib/utils/currency'
import { debtSchema } from '#/lib/validations/debt'

export function DebtFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createDebt = useCreateDebt()

  const form = useForm({
    defaultValues: { name: '', totalAmount: 0, dueDate: '', notes: '' },
    onSubmit: async ({ value }) => {
      const parsed = debtSchema.parse(value)
      try {
        await createDebt.mutateAsync(parsed)
        toast.success('Hutang berhasil ditambahkan.')
        form.reset()
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Hutang gagal disimpan.',
        )
      }
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset()
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Hutang</DialogTitle>
          <DialogDescription>
            Catat hutang baru yang perlu Anda bayar.
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
            name="name"
            validators={{
              onChange: debtSchema.shape.name,
              onSubmit: debtSchema.shape.name,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Nama / Keterangan</Label>
                <Input
                  id={field.name}
                  placeholder="Pinjaman teman"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="totalAmount"
            validators={{
              onChange: debtSchema.shape.totalAmount,
              onSubmit: debtSchema.shape.totalAmount,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Jumlah Total</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id={field.name}
                    inputMode="numeric"
                    className="pl-9"
                    placeholder="1.000.000"
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

          <form.Field name="dueDate">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Jatuh Tempo (opsional)</Label>
                <DatePicker
                  id={field.name}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="notes">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Catatan</Label>
                <Textarea
                  id={field.name}
                  placeholder="Opsional"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={2}
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
            <Button type="submit" disabled={createDebt.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
