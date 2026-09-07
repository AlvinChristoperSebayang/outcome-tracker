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
import { useDeleteDebt } from '#/lib/mutations/debts'
import type { DebtWithProgress } from '#/types/debt'

export function DeleteDebtDialog({
  debt,
  onOpenChange,
}: {
  debt: DebtWithProgress | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteDebt = useDeleteDebt()

  function handleDelete() {
    if (!debt) return
    deleteDebt.mutate(debt.id, {
      onSuccess: () => {
        toast.success('Hutang berhasil dihapus.')
        onOpenChange(false)
      },
      onError: () => toast.error('Hutang gagal dihapus. Silakan coba lagi.'),
    })
  }

  return (
    <AlertDialog open={Boolean(debt)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus hutang ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Seluruh riwayat pembayaran untuk hutang ini juga akan dihapus dan
            tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteDebt.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteDebt.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
