import { useMemo, useState } from 'react'
import { flexRender } from '@tanstack/react-table'
import type { SortingState } from '@tanstack/react-table'
import {
  getCoreRowModel,
  getSortedRowModel,
  legacyCreateColumnHelper as createColumnHelper,
  useLegacyTable as useReactTable,
} from '@tanstack/react-table/legacy'
import type { LegacyColumnDef } from '@tanstack/react-table/legacy'
import { ArrowUpDown } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { formatCurrency } from '#/lib/utils/currency'
import { formatDateShort } from '#/lib/utils/date'
import { ExpenseRowActions } from './ExpenseRowActions'
import type { ExpenseRow } from '#/types/expense'

const columnHelper = createColumnHelper<ExpenseRow>()

export function ExpenseTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Array<ExpenseRow>
  onEdit: (expense: ExpenseRow) => void
  onDelete: (expense: ExpenseRow) => void
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'expense_date', desc: true },
  ])

  // `any` sidesteps TanStack Table's per-column TValue variance, which otherwise
  // rejects mixing string/number accessor columns in a single array literal.
  const columns = useMemo<Array<LegacyColumnDef<ExpenseRow, any>>>(
    () => [
      columnHelper.accessor('expense_date', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Tanggal
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        ),
        cell: (info) => formatDateShort(info.getValue()),
      }),
      columnHelper.accessor('description', {
        header: 'Deskripsi',
        cell: (info) => (
          <div>
            <p className="font-medium">{info.getValue()}</p>
            {info.row.original.notes ? (
              <p className="text-xs text-muted-foreground">
                {info.row.original.notes}
              </p>
            ) : null}
          </div>
        ),
      }),
      columnHelper.accessor('category', {
        header: 'Kategori',
        cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor('amount', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-mr-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Jumlah
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        ),
        cell: (info) => (
          <span className="font-medium">
            {formatCurrency(Number(info.getValue()))}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <ExpenseRowActions
            onEdit={() => onEdit(info.row.original)}
            onDelete={() => onDelete(info.row.original)}
          />
        ),
      }),
    ],
    [onEdit, onDelete],
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="hidden overflow-hidden rounded-xl border border-border md:block">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.id === 'amount' ? 'text-right' : ''}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cell.column.id === 'amount' ? 'text-right' : ''}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
