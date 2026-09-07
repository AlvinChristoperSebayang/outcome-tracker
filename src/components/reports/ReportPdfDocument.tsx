import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatCurrency } from '#/lib/utils/currency'
import { formatDateShort } from '#/lib/utils/date'
import type {
  CategoryBreakdownItem,
  ExpenseSummary,
} from '#/lib/utils/expense-stats'
import type { ExpenseRow } from '#/types/expense'

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 10, color: '#555', marginBottom: 2 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 8 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: { flexGrow: 1 },
  summaryLabel: { fontSize: 9, color: '#555' },
  summaryValue: { fontSize: 13, fontWeight: 700, marginTop: 2 },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 4,
  },
  colDate: { width: '18%' },
  colDesc: { width: '38%' },
  colCategory: { width: '24%' },
  colAmount: { width: '20%', textAlign: 'right' },
})

export interface ReportPdfData {
  userName: string
  periodLabel: string
  summary: ExpenseSummary
  breakdown: Array<CategoryBreakdownItem>
  expenses: Array<ExpenseRow>
}

export function ReportPdfDocument({
  userName,
  periodLabel,
  summary,
  breakdown,
  expenses,
}: ReportPdfData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Laporan Pengeluaran</Text>
        <Text style={styles.meta}>Nama: {userName}</Text>
        <Text style={styles.meta}>Periode: {periodLabel}</Text>

        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Pengeluaran</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.total)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Jumlah Transaksi</Text>
              <Text style={styles.summaryValue}>{summary.count}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Rata-rata</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.average)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RINGKASAN KATEGORI</Text>
          {breakdown.map((item) => (
            <View key={item.category} style={styles.breakdownRow}>
              <Text>{item.category}</Text>
              <Text>
                {formatCurrency(item.total)} ({item.percentage.toFixed(1)}%)
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DAFTAR TRANSAKSI</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colDate}>Tanggal</Text>
            <Text style={styles.colDesc}>Deskripsi</Text>
            <Text style={styles.colCategory}>Kategori</Text>
            <Text style={styles.colAmount}>Jumlah</Text>
          </View>
          {expenses.map((expense) => (
            <View key={expense.id} style={styles.tableRow} wrap={false}>
              <Text style={styles.colDate}>
                {formatDateShort(expense.expense_date)}
              </Text>
              <Text style={styles.colDesc}>{expense.description}</Text>
              <Text style={styles.colCategory}>{expense.category}</Text>
              <Text style={styles.colAmount}>
                {formatCurrency(Number(expense.amount))}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}
