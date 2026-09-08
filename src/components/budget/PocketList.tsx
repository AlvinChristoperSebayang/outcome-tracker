import { AlertTriangle, PiggyBank } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
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
      {pockets.map((pocket) =>
        pocket.is_savings ? (
          <div key={pocket.id} className="rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <PiggyBank
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{pocket.name}</p>
                    <Badge variant="secondary">Tabungan</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(Number(pocket.amount))} disisihkan bulan ini
                  </p>
                </div>
              </div>
              <ExpenseRowActions
                onEdit={() => onEdit(pocket)}
                onDelete={() => onDelete(pocket)}
              />
            </div>
          </div>
        ) : (
          <RegularPocketCard
            key={pocket.id}
            pocket={pocket}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
      )}
    </div>
  )
}

function RegularPocketCard({
  pocket,
  onEdit,
  onDelete,
}: {
  pocket: BudgetPocketWithSpending
  onEdit: (pocket: BudgetPocketWithSpending) => void
  onDelete: (pocket: BudgetPocketWithSpending) => void
}) {
  const percentage =
    Number(pocket.amount) > 0 ? (pocket.spent / Number(pocket.amount)) * 100 : 0

  return (
    <div className="rounded-xl border border-border p-4">
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
}
