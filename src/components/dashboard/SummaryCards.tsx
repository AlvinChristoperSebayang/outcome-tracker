import { Layers, Receipt, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { formatCurrency } from '#/lib/utils/currency'
import type { ExpenseSummary } from '#/lib/utils/expense-stats'

const CARD_META = [
  { key: 'total', label: 'Total Pengeluaran', icon: Wallet },
  { key: 'count', label: 'Jumlah Transaksi', icon: Receipt },
  { key: 'average', label: 'Rata-rata Pengeluaran', icon: TrendingUp },
  { key: 'topCategory', label: 'Kategori Terbesar', icon: Layers },
] as const

export function SummaryCards({ summary }: { summary: ExpenseSummary }) {
  const values: Record<(typeof CARD_META)[number]['key'], string> = {
    total: formatCurrency(summary.total),
    count: `${summary.count} transaksi`,
    average: formatCurrency(summary.average),
    topCategory: summary.topCategory ?? '—',
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARD_META.map((meta) => (
        <Card key={meta.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {meta.label}
            </CardTitle>
            <meta.icon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {values[meta.key]}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARD_META.map((meta) => (
        <Card key={meta.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {meta.label}
            </CardTitle>
            <meta.icon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
