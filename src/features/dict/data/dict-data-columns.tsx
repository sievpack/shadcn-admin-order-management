import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DictDataRowActions } from './dict-data-row-actions'

export interface DictData {
  id: number
  dict_sort: number
  dict_label: string
  dict_value: string
  dict_type: string
  css_class: string | null
  list_class: string | null
  is_default: boolean
  available: boolean
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export const dictDataColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit?: (row: DictData) => void
  onDelete?: (row: DictData) => void
}): ColumnDef<DictData>[] => [
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
    accessorKey: 'dict_sort',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='排序' />
    ),
    cell: ({ row }) => (
      <div className='text-center'>{row.getValue('dict_sort')}</div>
    ),
    meta: {
      className: 'w-[60px]',
    },
  },
  {
    accessorKey: 'dict_label',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='字典标签' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('dict_label')}</span>
    ),
    meta: {
      className: 'min-w-[120px]',
    },
  },
  {
    accessorKey: 'dict_value',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='字典值' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-sm'>{row.getValue('dict_value')}</span>
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
      <div className='text-muted-foreground'>{row.getValue('dict_type')}</div>
    ),
    meta: {
      className: 'min-w-[100px]',
    },
  },
  {
    accessorKey: 'is_default',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='默认' />
    ),
    cell: ({ row }) => {
      const isDefault = row.getValue('is_default')
      const isDefaultTrue =
        isDefault == 1 || isDefault === '1' || isDefault === true
      return isDefaultTrue ? (
        <Badge variant='default'>是</Badge>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
    meta: {
      className: 'w-[60px]',
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
      className: 'w-[80px]',
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DictDataRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
    ),
    meta: {
      className: 'w-[80px]',
    },
    enableSorting: false,
    enableHiding: false,
  },
]
