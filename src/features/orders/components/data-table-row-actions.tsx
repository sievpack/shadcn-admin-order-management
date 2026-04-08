import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Edit, Trash2, Plus, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Order } from './orderlist-columns'

type DataTableRowActionsProps = {
  row: Row<Order>
  onViewOrder: (id: number, order: Order) => void
  onEditOrder: (id: number, order: Order) => void
  onDeleteOrder: (id: number) => void
  onAddOrderItem?: (order: Order) => void
  onPrintOrder?: (id: number, orderNumber: string) => void
}

export function DataTableRowActions({
  row,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onAddOrderItem,
  onPrintOrder,
}: DataTableRowActionsProps) {
  const order = row.original
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem onClick={() => onViewOrder(order.id, order)}>
            查看
            <DropdownMenuShortcut>
              <Eye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEditOrder(order.id, order)}>
            编辑
            <DropdownMenuShortcut>
              <Edit size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {onPrintOrder && (
            <DropdownMenuItem
              onClick={() => onPrintOrder(order.id, order.order_number)}
            >
              打印加工单
              <DropdownMenuShortcut>
                <Printer size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              onAddOrderItem?.(order)
            }}
          >
            添加分项
            <DropdownMenuShortcut>
              <Plus size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDeleteOrder(order.id)}
            className='text-red-500!'
          >
            删除
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
