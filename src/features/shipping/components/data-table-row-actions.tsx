import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Edit, Trash2, Printer, Plus } from 'lucide-react'
import { printDelivery } from '@/lib/print'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type ShippingItem } from './shipping-provider'
import { useShipping } from './shipping-provider'

type DataTableRowActionsProps = {
  row: Row<ShippingItem>
  onEditShipping?: (id: number, item: ShippingItem) => void
  onAddItem?: (item: ShippingItem) => void
}

export function DataTableRowActions({
  row,
  onEditShipping,
  onAddItem,
}: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useShipping()

  const handlePrint = () => {
    printDelivery(row.original.id)
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>打开菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('view')
            }}
          >
            查看
            <DropdownMenuShortcut>
              <Eye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (onEditShipping) {
                onEditShipping(row.original.id, row.original)
              } else {
                setCurrentRow(row.original)
                setOpen('edit')
              }
            }}
          >
            编辑
            <DropdownMenuShortcut>
              <Edit size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              if (onAddItem) {
                onAddItem(row.original)
              } else {
                setCurrentRow(row.original)
                setOpen('addItem')
              }
            }}
          >
            添加分项
            <DropdownMenuShortcut>
              <Plus size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handlePrint} className='text-purple-600'>
            打印
            <DropdownMenuShortcut>
              <Printer size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
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
