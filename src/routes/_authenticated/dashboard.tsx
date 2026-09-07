import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '#/components/EmptyState'
import { ErrorState } from '#/components/ErrorState'
import {
  SummaryCards,
  SummaryCardsSkeleton,
} from '#/components/dashboard/SummaryCards'
import { DateRangeFields } from '#/components/filters/DateRangeFields'
import { PeriodSelect } from '#/components/filters/PeriodSelect'
import { Button } from '#/components/ui/button'
import { dashboardSummaryQueryOptions } from '#/lib/queries/dashboard'
import { hasAnyExpenseQueryOptions } from '#/lib/queries/expenses'
import { dashboardSearchSchema } from '#/lib/validations/filters'

export const Route = createFileRoute('/_authenticated/dashboard')({
  validateSearch: dashboardSearchSchema,
  component: DashboardPage,
})

function DashboardPage() {
  const filters = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const summaryQuery = useQuery(dashboardSummaryQueryOptions(filters))
  const hasAnyExpenseQuery = useQuery({
    ...hasAnyExpenseQueryOptions(),
    enabled: summaryQuery.data?.count === 0,
  })

  const isEmptyOverall =
    summaryQuery.data?.count === 0 && hasAnyExpenseQuery.data === false

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ringkasan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau pengeluaran Anda dalam satu tempat.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <PeriodSelect
          value={filters.periode}
          onChange={(periode) =>
            navigate({ search: (prev) => ({ ...prev, periode }) })
          }
        />
        {filters.periode === 'custom' && (
          <DateRangeFields
            from={filters.dari}
            to={filters.sampai}
            onFromChange={(dari) =>
              navigate({ search: (prev) => ({ ...prev, dari }) })
            }
            onToChange={(sampai) =>
              navigate({ search: (prev) => ({ ...prev, sampai }) })
            }
          />
        )}
      </div>

      {summaryQuery.isPending ? (
        <SummaryCardsSkeleton />
      ) : summaryQuery.isError ? (
        <ErrorState onRetry={() => summaryQuery.refetch()} />
      ) : isEmptyOverall ? (
        <EmptyState
          actionLabel="Tambah Pengeluaran"
          onAction={() => navigate({ to: '/pengeluaran' })}
        />
      ) : (
        <>
          <SummaryCards summary={summaryQuery.data} />
          {summaryQuery.data.count === 0 && (
            <p className="text-sm text-muted-foreground">
              Tidak ada pengeluaran pada periode ini.{' '}
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => navigate({ to: '/pengeluaran' })}
              >
                Tambah pengeluaran
              </Button>
            </p>
          )}
        </>
      )}
    </div>
  )
}
