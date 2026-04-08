import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'

interface Order {
  id: number
  order_number: string
  customer_name: string
  order_date: string
  delivery_date: string
  status: boolean
}

export const templateColumns = ({
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onAddOrderItem,
}: {
  onViewOrder?: (id: number, order: Order) => void
  onEditOrder?: (id: number, order: Order) => void
  onDeleteOrder?: (id: number) => void
  onAddOrderItem?: (order: Order) => void
}): ColumnDef<Order>[] => [
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => <span>{row.getValue('id') || '-'}</span>,
    meta: { label: 'ID' },
  },
  {
    accessorKey: 'order_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='订单编号' />
    ),
    cell: ({ row }) => <span>{row.getValue('order_number') || '-'}</span>,
    meta: { label: '订单编号' },
  },

  {
    accessorKey: 'customer_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='客户名称' />
    ),
    cell: ({ row }) => <span>{row.getValue('customer_name') || '-'}</span>,
    meta: { label: '客户名称' },
  },
  {
    accessorKey: 'order_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='订单日期' />
    ),
    cell: ({ row }) => {
      const orderDate = row.getValue('order_date')
      try {
        return <span>{format(new Date(orderDate), 'yyyy-MM-dd')}</span>
      } catch {
        return <span>{orderDate || '-'}</span>
      }
    },
    filterFn: (row, id, filterValue) => {
      if (!filterValue) return true
      const orderDate = row.getValue(id)
      try {
        const rowDate = new Date(orderDate)
        rowDate.setHours(0, 0, 0, 0)

        if (filterValue instanceof Date) {
          const filterDate = new Date(filterValue)
          filterDate.setHours(0, 0, 0, 0)
          const nextDay = new Date(filterDate)
          nextDay.setDate(nextDay.getDate() + 1)
          return rowDate >= filterDate && rowDate < nextDay
        }
        return true
      } catch {
        return false
      }
    },
    meta: { label: '订单日期' },
  },
  {
    accessorKey: 'delivery_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='交期日期' />
    ),
    cell: ({ row }) => {
      const deliveryDate = row.getValue('delivery_date')
      try {
        return <span>{format(new Date(deliveryDate), 'yyyy-MM-dd')}</span>
      } catch {
        return <span>{deliveryDate || '-'}</span>
      }
    },
    meta: { label: '交期日期' },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <Badge variant={status ? 'default' : 'outline'}>
          {status ? '已完成' : '未完成'}
        </Badge>
      )
    },
    filterFn: (row, id, filterValue) => {
      if (!filterValue) return true
      const status = row.getValue(id) as boolean
      const filterValues = Array.isArray(filterValue)
        ? filterValue
        : [filterValue]
      return filterValues.includes(status.toString())
    },
    meta: { label: '状态' },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        onViewOrder={onViewOrder!}
        onEditOrder={onEditOrder!}
        onDeleteOrder={onDeleteOrder!}
        onAddOrderItem={onAddOrderItem}
      />
    ),
  },
]

export type { Order }

export interface OrderItem {
  id: number
  订单编号: string
  合同编号: string
  订单日期: string
  交货日期: string
  规格: string
  产品类型: string
  型号: string
  数量: number
  单位: string
  销售单价: number
  金额: number
  备注: string
  结算方式: string
  客户物料编号: string
  客户名称: string
  外购: boolean
}
