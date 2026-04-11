import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DictTypeRowActions } from './dict-type-row-actions'

export interface DictType {
  id: number
  dict_name: string
  dict_type: string
  available: boolean
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export const dictTypeColumns = ({
  onView,
  onEdit,
  onDelete,
  onAddData,
}: {
  onView?: (row: DictType) => void
  onEdit?: (row: DictType) => void
  onDelete?: (row: DictType) => void
  onAddData?: (row: DictType) => void
}): ColumnDef<DictType>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'dict_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='字典名称' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('dict_name') || '-'}</span>
    ),
    meta: {
      className: 'min-w-[120px]',
    },
  },
  {
    accessorKey: 'dict_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='字典类型' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-sm'>{row.getValue('dict_type')}</span>
    ),
    meta: {
      className: 'min-w-[120px]',
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='描述' />
    ),
    cell: ({ row }) => (
      <div className='line-clamp-1 max-w-[200px]'>
        {row.getValue('description') || '-'}
      </div>
    ),
    meta: {
      className: 'min-w-[150px]',
    },
  },
  {
    accessorKey: 'available',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const available = row.getValue('available')
      const isEnabled =
        available == 1 || available === '1' || available === true
      return (
        <Badge variant={isEnabled ? 'default' : 'secondary'}>
          {isEnabled ? '启用' : '禁用'}
        </Badge>
      )
    },
    meta: {
      className: 'min-w-[80px]',
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DictTypeRowActions
        row={row}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddData={onAddData}
      />
    ),
    meta: {
      className: 'w-[80px]',
    },
    enableSorting: false,
    enableHiding: false,
  },
]
