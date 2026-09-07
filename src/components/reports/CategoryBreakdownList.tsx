import { getCategoryColor } from '#/lib/utils/categories'
import { formatCurrency } from '#/lib/utils/currency'
import type { CategoryBreakdownItem } from '#/lib/utils/expense-stats'

export function CategoryBreakdownList({
  data,
}: {
  data: Array<CategoryBreakdownItem>
}) {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.category}>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="font-medium">{item.category}</span>
            <span className="text-muted-foreground">
              {formatCurrency(item.total)} · {item.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: getCategoryColor(item.category),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
