import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getCategoryColor } from '#/lib/utils/categories'
import { formatCurrency } from '#/lib/utils/currency'
import type { CategoryBreakdownItem } from '#/lib/utils/expense-stats'

export function CategoryPieChart({
  data,
}: {
  data: Array<CategoryBreakdownItem>
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell
              key={entry.category}
              fill={getCategoryColor(entry.category)}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            fontSize: 13,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
