import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '#/components/EmptyState'
import { ErrorState } from '#/components/ErrorState'
import { DateRangeFields } from '#/components/filters/DateRangeFields'
import { CategorySelect } from '#/components/filters/CategorySelect'
import { PeriodSelect } from '#/components/filters/PeriodSelect'
import {
  SummaryCards,
  SummaryCardsSkeleton,
} from '#/components/dashboard/SummaryCards'
import { CategoryBreakdownList } from '#/components/reports/CategoryBreakdownList'
import { CategoryPieChart } from '#/components/reports/CategoryPieChart'
import { TimeSeriesChart } from '#/components/reports/TimeSeriesChart'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { reportQueryOptions } from '#/lib/queries/reports'
import { formatDateLong } from '#/lib/utils/date'
import { generateReportPdf } from '#/lib/utils/generate-report-pdf'
import { reportSearchSchema } from '#/lib/validations/filters'

const REPORT_PERIOD_OPTIONS = [
  'bulan-ini',
  'bulan-lalu',
  'tahun-ini',
  'custom',
] as const

export const Route = createFileRoute('/_authenticated/laporan')({
  validateSearch: reportSearchSchema,
  component: LaporanPage,
})

function LaporanPage() {
  const filters = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { user } = Route.useRouteContext()
  const [isGenerating, setIsGenerating] = useState(false)

  const reportQuery = useQuery(reportQueryOptions(filters))

  async function handleGenerateReport() {
    if (!reportQuery.data) return
    setIsGenerating(true)
    try {
      await generateReportPdf(
        {
          userName: user.fullName || user.email,
          periodLabel: `${formatDateLong(reportQuery.data.range.from)} - ${formatDateLong(reportQuery.data.range.to)}`,
          summary: reportQuery.data.summary,
          breakdown: reportQuery.data.breakdown,
          expenses: reportQuery.data.expenses,
        },
        `laporan-pengeluaran-${filters.periode}.pdf`,
      )
    } catch {
      toast.error('Gagal membuat laporan. Silakan coba lagi.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Laporan Pengeluaran
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lihat ringkasan pengeluaran berdasarkan periode yang Anda pilih.
          </p>
        </div>
        <Button
          onClick={handleGenerateReport}
          disabled={
            !reportQuery.data ||
            reportQuery.data.expenses.length === 0 ||
            isGenerating
          }
        >
          <FileDown className="h-4 w-4" />
          {isGenerating ? 'Membuat laporan...' : 'Buat Laporan'}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <PeriodSelect
          value={filters.periode}
          options={[...REPORT_PERIOD_OPTIONS]}
          onChange={(periode) =>
            navigate({ search: (prev) => ({ ...prev, periode }) })
          }
        />
        <CategorySelect
          value={filters.kategori}
          onChange={(kategori) =>
            navigate({ search: (prev) => ({ ...prev, kategori }) })
          }
        />
      </div>
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

      {reportQuery.isPending ? (
        <SummaryCardsSkeleton />
      ) : reportQuery.isError ? (
        <ErrorState onRetry={() => reportQuery.refetch()} />
      ) : reportQuery.data.summary.count === 0 ? (
        <EmptyState
          title="Belum ada data untuk periode ini"
          description="Tidak ada pengeluaran pada periode atau kategori yang dipilih."
        />
      ) : (
        <>
          <SummaryCards summary={reportQuery.data.summary} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Pengeluaran berdasarkan kategori
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart data={reportQuery.data.breakdown} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Pengeluaran berdasarkan waktu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TimeSeriesChart data={reportQuery.data.timeSeries} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ringkasan Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBreakdownList data={reportQuery.data.breakdown} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
