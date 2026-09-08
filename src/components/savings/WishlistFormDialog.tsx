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
import {
  useCreateWishlistItem,
  useUpdateWishlistItem,
} from '#/lib/mutations/wishlist'
import { formatNumberInput, parseNumberInput } from '#/lib/utils/currency'
import { wishlistItemSchema } from '#/lib/validations/wishlist'
import type { WishlistItemRow } from '#/types/savings'

export function WishlistFormDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: WishlistItemRow
}) {
  const isEdit = Boolean(item)
  const createItem = useCreateWishlistItem()
  const updateItem = useUpdateWishlistItem()
  const isPending = createItem.isPending || updateItem.isPending

  const form = useForm({
    defaultValues: {
      name: item?.name ?? '',
      productUrl: item?.product_url ?? '',
      targetAmount: item?.target_amount
        ? Number(item.target_amount)
        : undefined,
    },
    onSubmit: async ({ value }) => {
      const parsed = wishlistItemSchema.parse(value)
      try {
        if (isEdit) {
          await updateItem.mutateAsync({ id: item!.id, input: parsed })
          toast.success('Wishlist berhasil diperbarui.')
        } else {
          await createItem.mutateAsync(parsed)
          toast.success('Wishlist berhasil ditambahkan.')
        }
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Wishlist gagal disimpan.',
        )
      }
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: item?.name ?? '',
        productUrl: item?.product_url ?? '',
        targetAmount: item?.target_amount
          ? Number(item.target_amount)
          : undefined,
      })
    }
  }, [open, item, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Ubah Wishlist' : 'Tambah Wishlist'}
          </DialogTitle>
          <DialogDescription>
            Catat barang yang ingin Anda beli dari tabungan.
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
              onChange: wishlistItemSchema.shape.name,
              onSubmit: wishlistItemSchema.shape.name,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Nama Barang</Label>
                <Input
                  id={field.name}
                  placeholder="Sepatu lari"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="targetAmount">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Harga (opsional)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id={field.name}
                    inputMode="numeric"
                    className="pl-9"
                    placeholder="1.500.000"
                    value={
                      field.state.value
                        ? formatNumberInput(field.state.value)
                        : ''
                    }
                    onChange={(e) =>
                      field.handleChange(
                        parseNumberInput(e.target.value) || undefined,
                      )
                    }
                  />
                </div>
              </div>
            )}
          </form.Field>

          <form.Field
            name="productUrl"
            validators={{ onSubmit: wishlistItemSchema.shape.productUrl }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Link Produk (opsional)</Label>
                <Input
                  id={field.name}
                  type="url"
                  placeholder="https://..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
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
            <Button type="submit" disabled={isPending}>
              {isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
