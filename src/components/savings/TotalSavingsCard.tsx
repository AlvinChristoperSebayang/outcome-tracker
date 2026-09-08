import { PiggyBank } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { formatCurrency } from '#/lib/utils/currency'
import type { SavingsSummary } from '#/types/savings'

export function TotalSavingsCard({ summary }: { summary: SavingsSummary }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Total Tabungan</CardTitle>
        <PiggyBank
          className="h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">
          {formatCurrency(summary.total)}
        </p>
        {summary.contributions.length > 0 && (
          <div className="mt-4 space-y-1.5 border-t border-border pt-3">
            {summary.contributions.map((contribution) => (
              <div
                key={contribution.month}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {contribution.month}
                </span>
                <span className="font-medium">
                  {formatCurrency(contribution.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
