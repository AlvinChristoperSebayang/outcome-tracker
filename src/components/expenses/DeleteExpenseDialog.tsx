import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { useDeleteExpense } from '#/lib/mutations/expenses'
import type { ExpenseRow } from '#/types/expense'

export function DeleteExpenseDialog({
  expense,
  onOpenChange,
}: {
  expense: ExpenseRow | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteExpense = useDeleteExpense()

  function handleDelete() {
    if (!expense) return
    deleteExpense.mutate(expense.id, {
      onSuccess: () => {
        toast.success('Pengeluaran berhasil dihapus.')
        onOpenChange(false)
      },
      onError: () => {
        toast.error('Pengeluaran gagal dihapus. Silakan coba lagi.')
      },
    })
  }

  return (
    <AlertDialog open={Boolean(expense)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus pengeluaran ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Pengeluaran yang dihapus tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteExpense.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteExpense.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
