import { Badge } from '#/components/ui/badge'
import { formatCurrency } from '#/lib/utils/currency'
import { formatDateShort } from '#/lib/utils/date'
import { ExpenseRowActions } from './ExpenseRowActions'
import type { ExpenseRow } from '#/types/expense'

export function ExpenseCardList({
  data,
  onEdit,
  onDelete,
}: {
  data: Array<ExpenseRow>
  onEdit: (expense: ExpenseRow) => void
  onDelete: (expense: ExpenseRow) => void
}) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {data.map((expense) => (
        <div
          key={expense.id}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium">{expense.description}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary">{expense.category}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDateShort(expense.expense_date)}
                </span>
              </div>
            </div>
            <ExpenseRowActions
              onEdit={() => onEdit(expense)}
              onDelete={() => onDelete(expense)}
            />
          </div>
          <p className="mt-3 text-lg font-semibold">
            {formatCurrency(Number(expense.amount))}
          </p>
        </div>
      ))}
    </div>
  )
}
