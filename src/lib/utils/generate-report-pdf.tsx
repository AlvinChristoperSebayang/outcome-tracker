import type { ReportPdfData } from '#/components/reports/ReportPdfDocument'

/** Lazily loads @react-pdf/renderer (heavy) only when the user actually asks for a PDF. */
export async function generateReportPdf(data: ReportPdfData, fileName: string) {
  const [{ pdf }, { ReportPdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('#/components/reports/ReportPdfDocument'),
  ])

  const blob = await pdf(<ReportPdfDocument {...data} />).toBlob()
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
