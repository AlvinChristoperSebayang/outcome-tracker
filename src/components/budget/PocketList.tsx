import { AlertTriangle } from 'lucide-react'
import { ExpenseRowActions } from '#/components/expenses/ExpenseRowActions'
import { formatCurrency } from '#/lib/utils/currency'
import type { BudgetPocketWithSpending } from '#/types/budget'

export function PocketList({
  pockets,
  onEdit,
  onDelete,
}: {
  pockets: Array<BudgetPocketWithSpending>
  onEdit: (pocket: BudgetPocketWithSpending) => void
  onDelete: (pocket: BudgetPocketWithSpending) => void
}) {
  return (
    <div className="space-y-4">
      {pockets.map((pocket) => {
        const percentage =
          Number(pocket.amount) > 0
            ? (pocket.spent / Number(pocket.amount)) * 100
            : 0
        return (
          <div key={pocket.id} className="rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{pocket.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(pocket.spent)} dari{' '}
                  {formatCurrency(Number(pocket.amount))}
                </p>
              </div>
              <ExpenseRowActions
                onEdit={() => onEdit(pocket)}
                onDelete={() => onDelete(pocket)}
              />
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={
                  pocket.isOverBudget
                    ? 'h-full rounded-full bg-destructive'
                    : 'h-full rounded-full bg-primary'
                }
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            {pocket.isOverBudget ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" />
                Melebihi anggaran {formatCurrency(Math.abs(pocket.remaining))}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Sisa {formatCurrency(pocket.remaining)}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
