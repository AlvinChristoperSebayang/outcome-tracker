import { ExternalLink } from 'lucide-react'
import { ExpenseRowActions } from '#/components/expenses/ExpenseRowActions'
import { Checkbox } from '#/components/ui/checkbox'
import { useToggleWishlistAchieved } from '#/lib/mutations/wishlist'
import { cn } from '#/lib/utils'
import { formatCurrency } from '#/lib/utils/currency'
import type { WishlistItemRow } from '#/types/savings'

export function WishlistList({
  items,
  totalSavings,
  onEdit,
  onDelete,
}: {
  items: Array<WishlistItemRow>
  totalSavings: number
  onEdit: (item: WishlistItemRow) => void
  onDelete: (item: WishlistItemRow) => void
}) {
  const toggleAchieved = useToggleWishlistAchieved()

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const target = item.target_amount ? Number(item.target_amount) : null
        const percentage = target
          ? Math.min((totalSavings / target) * 100, 100)
          : null

        return (
          <div key={item.id} className="rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={item.is_achieved}
                onCheckedChange={(checked) =>
                  toggleAchieved.mutate({
                    id: item.id,
                    isAchieved: checked === true,
                  })
                }
                className="mt-1"
                aria-label="Tandai sudah dibeli"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      'font-medium',
                      item.is_achieved && 'text-muted-foreground line-through',
                    )}
                  >
                    {item.name}
                  </p>
                  <ExpenseRowActions
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item)}
                  />
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {target && <span>{formatCurrency(target)}</span>}
                  {item.product_url && (
                    <a
                      href={item.product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Lihat produk
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {percentage !== null && !item.is_achieved && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {percentage.toFixed(0)}% dari total tabungan Anda
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
