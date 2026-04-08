import { type ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface UnshippedItem {
  id: number
  订单编号: string
  客户名称: string
  规格: string
  产品类型: string
  型号: string
  数量: number
  单位: string
  交货日期: string
  ship_id: null | string
  合同编号?: string
  客户物料编号?: string
  备注?: string
  销售单价?: number
  金额?: number
  发货单号?: string
  快递单号?: string
}

export type { UnshippedItem }

export function unshippedColumns({
  onViewItem,
}: {
  onViewItem?: (id: number, item: UnshippedItem) => void
}): ColumnDef<UnshippedItem>[] {
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
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => row.getValue('id'),
      meta: {
        className: 'text-right',
      },
    },
    {
      accessorKey: '合同编号',
      header: '合同编号',
      cell: ({ row }) => row.getValue('合同编号') || '-',
      meta: {
        className: 'font-medium',
      },
    },
    {
      accessorKey: '客户名称',
      header: '客户名称',
      cell: ({ row }) => row.getValue('客户名称'),
    },
    {
      accessorKey: '规格',
      header: '规格',
      cell: ({ row }) => row.getValue('规格'),
    },
    {
      accessorKey: '产品类型',
      header: '产品类型',
      cell: ({ row }) => row.getValue('产品类型'),
    },
    {
      accessorKey: '型号',
      header: '型号',
      cell: ({ row }) => row.getValue('型号'),
    },
    {
      accessorKey: '数量',
      header: '数量',
      cell: ({ row }) => row.getValue('数量'),
      meta: {
        className: 'text-right',
      },
    },
    {
      accessorKey: '单位',
      header: '单位',
      cell: ({ row }) => row.getValue('单位') || '-',
    },
    {
      accessorKey: '交货日期',
      header: '交货日期',
      cell: ({ row }) => row.getValue('交货日期'),
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className='flex gap-2'>
            {onViewItem && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onViewItem(item.id, item)}
              >
                <Eye data-icon='inline-start' />
                <span className='sr-only'>查看</span>
              </Button>
            )}
          </div>
        )
      },
      size: 80,
    },
  ]
}
