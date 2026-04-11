import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableRowActions } from './data-table-row-actions'

export function customerSampleColumns(): ColumnDef<any>[] {
  return [
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
      accessorKey: '样品单号',
      header: '样品单号',
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('样品单号')}</div>
      ),
    },
    {
      accessorKey: '客户名称',
      header: '客户名称',
    },
    {
      accessorKey: '下单日期',
      header: '下单日期',
      cell: ({ row }) => <div>{row.getValue('下单日期') || '-'}</div>,
    },
    {
      accessorKey: '规格',
      header: '规格',
      cell: ({ row }) => <div>{row.getValue('规格') || '-'}</div>,
    },
    {
      accessorKey: '型号',
      header: '型号',
      cell: ({ row }) => <div>{row.getValue('型号') || '-'}</div>,
    },
    {
      accessorKey: '数量',
      header: '数量',
      cell: ({ row }) => <div>{row.getValue('数量') || '-'}</div>,
    },
    {
      accessorKey: '单位',
      header: '单位',
      cell: ({ row }) => <div>{row.getValue('单位') || '-'}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ]
}
