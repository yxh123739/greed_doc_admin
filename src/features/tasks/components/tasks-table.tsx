import { useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type DataTableProps<TData> = {
  data: TData[]
  columns: ColumnDef<TData, any>[]
}

export function TasksTable<TData>({ data, columns }: DataTableProps<TData>) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const getStickyClass = (pos?: 'left' | 'right') => {
    if (pos === 'left') return 'sticky left-0 z-10 bg-background'
    if (pos === 'right') return 'sticky right-0 z-10 bg-background'
    return ''
  }

  return (
    <div className='space-y-4'>
      <div className='overflow-auto rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sticky = (header.column.columnDef as any)?.meta
                    ?.sticky as 'left' | 'right'
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={getStickyClass(sticky)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const sticky = (cell.column.columnDef as any)?.meta
                      ?.sticky as 'left' | 'right'
                    return (
                      <TableCell
                        key={cell.id}
                        className={getStickyClass(sticky)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
