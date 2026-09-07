import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { formatCurrency } from '#/lib/utils/currency'
import { formatDateShort } from '#/lib/utils/date'
import type { DebtWithProgress } from '#/types/debt'

export function DebtList({
  debts,
  onPay,
  onDelete,
}: {
  debts: Array<DebtWithProgress>
  onPay: (debt: DebtWithProgress) => void
  onDelete: (debt: DebtWithProgress) => void
}) {
  return (
    <div className="space-y-4">
      {debts.map((debt) => (
        <DebtCard key={debt.id} debt={debt} onPay={onPay} onDelete={onDelete} />
      ))}
    </div>
  )
}

function DebtCard({
  debt,
  onPay,
  onDelete,
}: {
  debt: DebtWithProgress
  onPay: (debt: DebtWithProgress) => void
  onDelete: (debt: DebtWithProgress) => void
}) {
  const [showHistory, setShowHistory] = useState(false)
  const isLunas = debt.status === 'lunas'
  const percentage =
    Number(debt.total_amount) > 0
      ? (debt.paidAmount / Number(debt.total_amount)) * 100
      : 0

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{debt.name}</p>
            <Badge
              variant={isLunas ? 'secondary' : 'destructive'}
              className={
                isLunas ? 'bg-success text-success-foreground' : undefined
              }
            >
              {isLunas ? 'Lunas' : 'Belum Lunas'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(debt.paidAmount)} dari{' '}
            {formatCurrency(Number(debt.total_amount))}
            {debt.due_date
              ? ` · Jatuh tempo ${formatDateShort(debt.due_date)}`
              : ''}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          aria-label="Hapus hutang"
          onClick={() => onDelete(debt)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {isLunas
            ? 'Sudah lunas'
            : `Sisa ${formatCurrency(debt.remainingAmount)}`}
        </p>
        <div className="flex items-center gap-2">
          {debt.payments.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory((v) => !v)}
            >
              Riwayat ({debt.payments.length})
              {showHistory ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          {!isLunas && (
            <Button size="sm" onClick={() => onPay(debt)}>
              Bayar Cicilan
            </Button>
          )}
        </div>
      </div>

      {showHistory && (
        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
          {debt.payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">
                {formatDateShort(payment.payment_date)}
              </span>
              <span className="font-medium">
                {formatCurrency(Number(payment.amount))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
