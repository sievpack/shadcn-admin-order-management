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
  发货状态?: 'pending' | 'partial' | 'shipped'
}

export const orderListColumns = ({
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onAddOrderItem,
  onPrintOrder,
}: {
  onViewOrder?: (id: number, order: Order) => void
  onEditOrder?: (id: number, order: Order) => void
  onDeleteOrder?: (id: number) => void
  onAddOrderItem?: (order: Order) => void
  onPrintOrder?: (id: number, orderNumber: string) => void
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
        // 确保日期是同一天的开始时间
        rowDate.setHours(0, 0, 0, 0)

        if (filterValue instanceof Date) {
          // 处理单个日期过滤
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
      const shippingStatus = row.getValue('发货状态') as string
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const isOverdue =
        shippingStatus !== 'shipped' &&
        shippingStatus !== undefined &&
        deliveryDate &&
        new Date(deliveryDate) <= today
      try {
        if (isOverdue) {
          return (
            <Badge variant='destructive' className='px-2 py-0.5'>
              {format(new Date(deliveryDate), 'yyyy-MM-dd')}
            </Badge>
          )
        }
        return <span>{format(new Date(deliveryDate), 'yyyy-MM-dd')}</span>
      } catch {
        return <span>{deliveryDate || '-'}</span>
      }
    },
    meta: { label: '交期日期' },
  },
  {
    accessorKey: '发货状态',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='发货状态' />
    ),
    cell: ({ row }) => {
      const shippingStatus = row.getValue('发货状态') as string
      const variant =
        shippingStatus === 'shipped'
          ? 'success'
          : shippingStatus === 'partial'
            ? 'warning'
            : 'secondary'
      const label =
        shippingStatus === 'shipped'
          ? '已发货'
          : shippingStatus === 'partial'
            ? '部分发货'
            : '未发货'
      return <Badge variant={variant}>{label}</Badge>
    },
    filterFn: (row, id, filterValue) => {
      if (!filterValue) return true
      const status = row.getValue(id) as string
      const filterValues = Array.isArray(filterValue)
        ? filterValue
        : [filterValue]
      return filterValues.includes(status)
    },
    meta: { label: '发货状态' },
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
        onPrintOrder={onPrintOrder}
      />
    ),
  },
]

export type { Order }
