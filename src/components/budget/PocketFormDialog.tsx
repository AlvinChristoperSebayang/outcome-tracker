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
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useCreatePocket, useUpdatePocket } from '#/lib/mutations/budgets'
import {
  formatCurrency,
  formatNumberInput,
  parseNumberInput,
} from '#/lib/utils/currency'
import { pocketBaseSchema } from '#/lib/validations/budget'
import type { BudgetPocketRow } from '#/types/budget'

export function PocketFormDialog({
  open,
  onOpenChange,
  monthValue,
  incomeAmount,
  pocket,
  defaultIsSavings = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthValue: string
  incomeAmount: number
  pocket?: BudgetPocketRow
  defaultIsSavings?: boolean
}) {
  const isEdit = Boolean(pocket)
  const createPocket = useCreatePocket(monthValue)
  const updatePocket = useUpdatePocket(monthValue)
  const isPending = createPocket.isPending || updatePocket.isPending

  const form = useForm({
    defaultValues: {
      name: pocket?.name ?? '',
      allocationMode: 'amount' as 'amount' | 'percentage',
      amount: pocket ? Number(pocket.amount) : undefined,
      percentage: undefined as number | undefined,
      isSavings: pocket?.is_savings ?? defaultIsSavings,
    },
    onSubmit: async ({ value }) => {
      if (value.allocationMode === 'amount' && !value.amount) {
        toast.error('Jumlah harus lebih besar dari 0.')
        return
      }
      if (value.allocationMode === 'percentage' && !value.percentage) {
        toast.error('Persentase harus lebih besar dari 0.')
        return
      }
      const parsed = pocketBaseSchema.parse(value)
      try {
        if (isEdit) {
          await updatePocket.mutateAsync({
            id: pocket!.id,
            input: parsed,
            incomeAmount,
          })
          toast.success('Kantong anggaran berhasil diperbarui.')
        } else {
          await createPocket.mutateAsync(parsed)
          toast.success('Kantong anggaran berhasil ditambahkan.')
        }
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Kantong anggaran gagal disimpan.',
        )
      }
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: pocket?.name ?? '',
        allocationMode: 'amount',
        amount: pocket ? Number(pocket.amount) : undefined,
        percentage: undefined,
        isSavings: pocket?.is_savings ?? defaultIsSavings,
      })
    }
  }, [open, pocket, form, defaultIsSavings])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form.Subscribe selector={(state) => state.values.isSavings}>
          {(isSavings) => (
            <DialogHeader>
              <DialogTitle>
                {isEdit
                  ? isSavings
                    ? 'Ubah Kantong Tabungan'
                    : 'Ubah Kantong Anggaran'
                  : isSavings
                    ? 'Tambah Kantong Tabungan'
                    : 'Tambah Kantong Anggaran'}
              </DialogTitle>
              <DialogDescription>
                {isSavings
                  ? 'Sisihkan sebagian pemasukan bulan ini untuk ditabung — tidak dipakai untuk pengeluaran.'
                  : 'Alokasikan sebagian anggaran bulan ini untuk kebutuhan tertentu.'}
              </DialogDescription>
            </DialogHeader>
          )}
        </form.Subscribe>

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
              onChange: pocketBaseSchema.shape.name,
              onSubmit: pocketBaseSchema.shape.name,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Nama Kantong</Label>
                <Input
                  id={field.name}
                  placeholder="Kebutuhan Sehari-hari"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="isSavings">
            {(field) => (
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor={field.name}>Kantong Tabungan</Label>
                  <p className="text-xs text-muted-foreground">
                    Uang disisihkan untuk ditabung, bukan untuk pengeluaran
                  </p>
                </div>
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="allocationMode">
            {(modeField) => (
              <div className="space-y-3">
                <Tabs
                  value={modeField.state.value}
                  onValueChange={(value) =>
                    modeField.handleChange(value as 'amount' | 'percentage')
                  }
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="amount" className="flex-1">
                      Jumlah
                    </TabsTrigger>
                    <TabsTrigger value="percentage" className="flex-1">
                      Persentase
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {modeField.state.value === 'amount' ? (
                  <form.Field name="amount">
                    {(field) => (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name}>Jumlah</Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            Rp
                          </span>
                          <Input
                            id={field.name}
                            inputMode="numeric"
                            className="pl-9"
                            placeholder="500.000"
                            value={
                              field.state.value
                                ? formatNumberInput(field.state.value)
                                : ''
                            }
                            onChange={(e) =>
                              field.handleChange(
                                parseNumberInput(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </form.Field>
                ) : (
                  <form.Field name="percentage">
                    {(field) => (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name}>
                          Persentase dari Pemasukan
                        </Label>
                        <div className="relative">
                          <Input
                            id={field.name}
                            inputMode="numeric"
                            className="pr-9"
                            placeholder="20"
                            value={field.state.value ?? ''}
                            onChange={(e) =>
                              field.handleChange(
                                Number(e.target.value) || undefined,
                              )
                            }
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            %
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ≈{' '}
                          {formatCurrency(
                            incomeAmount > 0
                              ? (incomeAmount * (field.state.value ?? 0)) / 100
                              : 0,
                          )}{' '}
                          dari pemasukan {formatCurrency(incomeAmount)}
                        </p>
                      </div>
                    )}
                  </form.Field>
                )}
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
            <Button type="submit" disabled={isPending}>
              {isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
