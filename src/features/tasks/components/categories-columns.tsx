import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import type { DbCategory } from '@/lib/supabase/queries'
import { CategoryEditDialog } from './category-edit-dialog'

type StickyColumn<TData> = ColumnDef<TData> & { meta?: { className?: string; sticky?: 'left' | 'right' } }

export const getCategoriesColumns = (onUpdated?: () => void): StickyColumn<DbCategory>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => <div className='w-[80px] truncate'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
    meta: { sticky: 'left' as const, className: '' },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground block max-w-xl truncate'>
        {row.getValue('description')}
      </span>
    ),
  },
  {
    accessorKey: 'max_points',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Max Points' />
    ),
  },
  {
    accessorKey: 'levels',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Levels' />
    ),
    cell: ({ row }) => {
      const levels = row.getValue('levels') as string[] | null
      return levels?.length ? (
        <div className='flex flex-wrap gap-1'>
          {levels.map((lv) => (
            <span key={lv} className='rounded bg-muted px-2 py-0.5 text-xs'>
              {lv}
            </span>
          ))}
        </div>
      ) : (
        <span className='text-muted-foreground'>—</span>
      )
    },
  },
  {
    accessorKey: 'strategies',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Strategies' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground block max-w-xl truncate'>
        {row.getValue('strategies')}
      </span>
    ),
  },
  {
    accessorKey: 'icon_key',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Icon' />
    ),
  },
  {
    id: 'actions',
    header: () => <span className='sr-only'>Actions</span>,
    cell: ({ row }) => {
      const cat = row.original as DbCategory
      return (
        <div className='flex justify-end'>
          <CategoryEditDialog category={cat} onUpdated={onUpdated} />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    meta: { sticky: 'right' as const, className: '' },
  },
]
