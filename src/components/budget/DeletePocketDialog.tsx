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
import { useDeletePocket } from '#/lib/mutations/budgets'
import type { BudgetPocketRow } from '#/types/budget'

export function DeletePocketDialog({
  pocket,
  monthValue,
  onOpenChange,
}: {
  pocket: BudgetPocketRow | null
  monthValue: string
  onOpenChange: (open: boolean) => void
}) {
  const deletePocket = useDeletePocket(monthValue)

  function handleDelete() {
    if (!pocket) return
    deletePocket.mutate(pocket.id, {
      onSuccess: () => {
        toast.success('Kantong anggaran berhasil dihapus.')
        onOpenChange(false)
      },
      onError: () =>
        toast.error('Kantong anggaran gagal dihapus. Silakan coba lagi.'),
    })
  }

  return (
    <AlertDialog open={Boolean(pocket)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus kantong anggaran ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Pengeluaran yang sudah tercatat di kantong ini tidak akan terhapus,
            tapi tidak lagi terhubung ke kantong manapun.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePocket.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePocket.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
