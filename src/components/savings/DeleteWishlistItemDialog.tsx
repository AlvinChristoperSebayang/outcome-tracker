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
import { useDeleteWishlistItem } from '#/lib/mutations/wishlist'
import type { WishlistItemRow } from '#/types/savings'

export function DeleteWishlistItemDialog({
  item,
  onOpenChange,
}: {
  item: WishlistItemRow | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteItem = useDeleteWishlistItem()

  function handleDelete() {
    if (!item) return
    deleteItem.mutate(item.id, {
      onSuccess: () => {
        toast.success('Wishlist berhasil dihapus.')
        onOpenChange(false)
      },
      onError: () => toast.error('Wishlist gagal dihapus. Silakan coba lagi.'),
    })
  }

  return (
    <AlertDialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus wishlist ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Item wishlist yang dihapus tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteItem.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteItem.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
