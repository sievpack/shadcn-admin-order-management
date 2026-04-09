import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Eye,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  Pause,
  Printer,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type ProductionOrder } from './production-order-columns'

type ProductionOrderRowActionsProps = {
  row: ProductionOrder
  onView?: (row: ProductionOrder) => void
  onEdit?: (row: ProductionOrder) => void
  onDelete?: (row: ProductionOrder) => void
  onStart?: (row: ProductionOrder) => void
  onFinish?: (row: ProductionOrder) => void
  onPause?: (row: ProductionOrder) => void
  onPrint?: (row: ProductionOrder) => void
  onReport?: (row: ProductionOrder) => void
}

export function ProductionOrderRowActions({
  row,
  onView,
  onEdit,
  onDelete,
  onStart,
  onFinish,
  onPause,
  onPrint,
  onReport,
}: ProductionOrderRowActionsProps) {
  return (
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
      <DropdownMenuContent align='end' className='w-[160px]'>
        {onView && (
          <DropdownMenuItem onClick={() => onView(row)}>
            查看
            <DropdownMenuShortcut>
              <Eye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(row)}>
            编辑
            <DropdownMenuShortcut>
              <Edit size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {(row.工单状态 === '待生产' || row.工单状态 === '已暂停') &&
          onStart && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onStart(row)}
                className='text-green-600'
              >
                开始生产
                <DropdownMenuShortcut>
                  <Play size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}
        {row.工单状态 === '生产中' && (
          <>
            <DropdownMenuSeparator />
            {onReport && (
              <DropdownMenuItem
                onClick={() => onReport(row)}
                className='text-cyan-600'
              >
                报工
                <DropdownMenuShortcut>
                  <ClipboardList size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
            {onFinish && (
              <DropdownMenuItem
                onClick={() => onFinish(row)}
                className='text-blue-600'
              >
                完工确认
                <DropdownMenuShortcut>
                  <CheckCircle size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
            {onPause && (
              <DropdownMenuItem
                onClick={() => onPause(row)}
                className='text-orange-500'
              >
                暂停
                <DropdownMenuShortcut>
                  <Pause size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onPrint?.(row)}
          className='text-purple-600'
        >
          打印
          <DropdownMenuShortcut>
            <Printer size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(row)}
              className='text-red-500'
            >
              删除
              <DropdownMenuShortcut>
                <Trash2 size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
