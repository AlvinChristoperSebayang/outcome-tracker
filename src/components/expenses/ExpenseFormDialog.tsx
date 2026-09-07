import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { useCreateExpense, useUpdateExpense } from '#/lib/mutations/expenses'
import { monthlyBudgetQueryOptions } from '#/lib/queries/budgets'
import {
  formatCurrency,
  formatNumberInput,
  parseNumberInput,
} from '#/lib/utils/currency'
import { parseDateOnly, todayDateOnlyString } from '#/lib/utils/date'
import { expenseSchema } from '#/lib/validations/expense'
import { EXPENSE_CATEGORIES } from '#/types/expense'
import type { BudgetPocketWithSpending } from '#/types/budget'
import type { ExpenseRow } from '#/types/expense'

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: ExpenseRow
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
}: ExpenseFormDialogProps) {
  const isEdit = Boolean(expense)
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const isPending = createExpense.isPending || updateExpense.isPending

  const form = useForm({
    defaultValues: {
      amount: expense ? Number(expense.amount) : 0,
      description: expense?.description ?? '',
      category: (expense?.category ?? '') as
        (typeof EXPENSE_CATEGORIES)[number] | '',
      expenseDate: expense?.expense_date ?? todayDateOnlyString(),
      notes: expense?.notes ?? '',
      pocketId: expense?.pocket_id ?? '',
    },
    onSubmit: async ({ value }) => {
      const parsed = expenseSchema.parse(value)
      const mutation = isEdit
        ? updateExpense.mutateAsync({ id: expense!.id, input: parsed })
        : createExpense.mutateAsync(parsed)

      try {
        await mutation
        toast.success(
          isEdit
            ? 'Perubahan berhasil disimpan.'
            : 'Pengeluaran berhasil disimpan.',
        )
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Pengeluaran gagal disimpan. Silakan coba lagi.',
        )
      }
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        amount: expense ? Number(expense.amount) : 0,
        description: expense?.description ?? '',
        category: (expense?.category ?? '') as
          (typeof EXPENSE_CATEGORIES)[number] | '',
        expenseDate: expense?.expense_date ?? todayDateOnlyString(),
        notes: expense?.notes ?? '',
        pocketId: expense?.pocket_id ?? '',
      })
    }
  }, [open, expense, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Ubah Pengeluaran' : 'Tambah Pengeluaran'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui detail pengeluaran ini.'
              : 'Catat pengeluaran baru Anda di sini.'}
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
              onChange: expenseSchema.shape.amount,
              onSubmit: expenseSchema.shape.amount,
            }}
          >
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
                    placeholder="35.000"
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

          <form.Field
            name="description"
            validators={{
              onChange: expenseSchema.shape.description,
              onSubmit: expenseSchema.shape.description,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Deskripsi</Label>
                <Input
                  id={field.name}
                  placeholder="Makan siang"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="category"
              validators={{
                onChange: expenseSchema.shape.category,
                onSubmit: expenseSchema.shape.category,
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Kategori</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as never)
                    }
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full"
                      aria-invalid={field.state.meta.errors.length > 0}
                    >
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="expenseDate"
              validators={{
                onChange: expenseSchema.shape.expenseDate,
                onSubmit: expenseSchema.shape.expenseDate,
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Tanggal</Label>
                  <DatePicker
                    id={field.name}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>

          <form.Subscribe
            selector={(state) =>
              [state.values.expenseDate, state.values.amount] as const
            }
          >
            {([expenseDate, amount]) => {
              const monthValue = format(parseDateOnly(expenseDate), 'yyyy-MM')
              const budgetQuery = useQuery(
                monthlyBudgetQueryOptions(monthValue),
              )
              const pockets = budgetQuery.data?.pockets ?? []

              if (pockets.length === 0) return null

              return (
                <form.Field name="pocketId">
                  {(field) => {
                    const selectedPocket = pockets.find(
                      (pocket: BudgetPocketWithSpending) =>
                        pocket.id === field.state.value,
                    )
                    const alreadyCountedAmount =
                      expense && expense.pocket_id === field.state.value
                        ? Number(expense.amount)
                        : 0
                    const projectedSpent = selectedPocket
                      ? selectedPocket.spent -
                        alreadyCountedAmount +
                        (amount || 0)
                      : 0
                    const willExceed =
                      Boolean(selectedPocket) &&
                      projectedSpent > Number(selectedPocket!.amount)

                    return (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name}>
                          Kantong Anggaran (opsional)
                        </Label>
                        <Select
                          value={field.state.value || 'tanpa-kantong'}
                          onValueChange={(value) =>
                            field.handleChange(
                              value === 'tanpa-kantong' ? '' : value,
                            )
                          }
                        >
                          <SelectTrigger id={field.name} className="w-full">
                            <SelectValue placeholder="Tanpa kantong" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tanpa-kantong">
                              Tanpa kantong
                            </SelectItem>
                            {pockets.map((pocket: BudgetPocketWithSpending) => (
                              <SelectItem key={pocket.id} value={pocket.id}>
                                {pocket.name} · Sisa{' '}
                                {formatCurrency(pocket.remaining)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {willExceed && (
                          <p className="flex items-center gap-1.5 text-sm text-destructive">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            Melebihi anggaran kantong &quot;
                            {selectedPocket!.name}&quot; sebesar{' '}
                            {formatCurrency(
                              projectedSpent - Number(selectedPocket!.amount),
                            )}
                          </p>
                        )}
                      </div>
                    )
                  }}
                </form.Field>
              )
            }}
          </form.Subscribe>

          <form.Field name="notes">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Catatan</Label>
                <Textarea
                  id={field.name}
                  placeholder="Opsional"
                  value={field.state.value}
                  onBlur={field.handleBlur}
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
            <Button type="submit" disabled={isPending}>
              {isEdit ? 'Simpan Perubahan' : 'Simpan Pengeluaran'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
