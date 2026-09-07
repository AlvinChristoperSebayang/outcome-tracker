import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { EmptyState } from '#/components/EmptyState'
import { ErrorState } from '#/components/ErrorState'
import { DeleteExpenseDialog } from '#/components/expenses/DeleteExpenseDialog'
import { ExpenseCardList } from '#/components/expenses/ExpenseCardList'
import { ExpenseFormDialog } from '#/components/expenses/ExpenseFormDialog'
import { ExpenseTable } from '#/components/expenses/ExpenseTable'
import { ExpenseToolbar } from '#/components/expenses/ExpenseToolbar'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import {
  hasAnyExpenseQueryOptions,
  expensesQueryOptions,
} from '#/lib/queries/expenses'
import { expensesSearchSchema } from '#/lib/validations/filters'
import type { ExpenseRow } from '#/types/expense'

export const Route = createFileRoute('/_authenticated/pengeluaran')({
  validateSearch: expensesSearchSchema,
  component: PengeluaranPage,
})

function PengeluaranPage() {
  const filters = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseRow | undefined>(
    undefined,
  )
  const [deletingExpense, setDeletingExpense] = useState<ExpenseRow | null>(
    null,
  )

  const expensesQuery = useQuery(expensesQueryOptions(filters))
  const hasAnyExpenseQuery = useQuery({
    ...hasAnyExpenseQueryOptions(),
    enabled: expensesQuery.data?.length === 0,
  })

  const isFilterActive = Boolean(
    filters.cari ||
    filters.bulan ||
    filters.kategori !== 'semua' ||
    filters.periode !== 'bulan-ini',
  )
  const isGloballyEmpty =
    expensesQuery.data?.length === 0 &&
    hasAnyExpenseQuery.data === false &&
    !isFilterActive

  function openCreateDialog() {
    setEditingExpense(undefined)
    setFormOpen(true)
  }

  function openEditDialog(expense: ExpenseRow) {
    setEditingExpense(expense)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Pengeluaran</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </div>

      <ExpenseToolbar
        filters={filters}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }) })
        }
      />

      {expensesQuery.isPending ? (
        <ExpenseListSkeleton />
      ) : expensesQuery.isError ? (
        <ErrorState onRetry={() => expensesQuery.refetch()} />
      ) : expensesQuery.data.length === 0 ? (
        isGloballyEmpty ? (
          <EmptyState
            actionLabel="Tambah Pengeluaran"
            onAction={openCreateDialog}
          />
        ) : (
          <EmptyState
            title="Tidak ada pengeluaran"
            description="Tidak ada pengeluaran yang cocok dengan filter saat ini. Coba ubah filter atau kata kunci pencarian."
          />
        )
      ) : (
        <>
          <ExpenseTable
            data={expensesQuery.data}
            onEdit={openEditDialog}
            onDelete={setDeletingExpense}
          />
          <ExpenseCardList
            data={expensesQuery.data}
            onEdit={openEditDialog}
            onDelete={setDeletingExpense}
          />
        </>
      )}

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editingExpense}
      />
      <DeleteExpenseDialog
        expense={deletingExpense}
        onOpenChange={(open) => !open && setDeletingExpense(null)}
      />
    </div>
  )
}

function ExpenseListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  )
}
