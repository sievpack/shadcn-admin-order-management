import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Eye, Edit, Trash2, Check, X, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface ProductionPlan {
  id: number
  计划编号: string
  计划名称: string
  关联订单: string
  产品类型: string
  产品型号: string
  规格: string
  计划数量: number
  已排数量: number
  单位: string
  计划开始日期: string
  计划完成日期: string
  实际开始日期: string
  实际完成日期: string
  优先级: string
  计划状态: string
  负责人: string
  备注: string
  create_at: string
}

type DataTableRowActionsProps = {
  row: ProductionPlan
  onView?: (row: ProductionPlan) => void
  onEdit?: (row: ProductionPlan) => void
  onDelete?: (row: ProductionPlan) => void
  onApprove?: (row: ProductionPlan) => void
  onReject?: (row: ProductionPlan) => void
  onGenerateOrder?: (row: ProductionPlan) => void
}

export function ProductionPlanRowActions({
  row,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onGenerateOrder,
}: DataTableRowActionsProps) {
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
        {row.计划状态 !== '待审核' &&
          onGenerateOrder &&
          row.计划数量 > row.已排数量 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onGenerateOrder(row)}>
                生成工单
                <DropdownMenuShortcut>
                  <ClipboardList size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}
        {row.计划状态 === '待审核' && onApprove && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onApprove(row)}>
              审核通过
              <DropdownMenuShortcut>
                <Check size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onReject?.(row)}
              className='text-orange-500'
            >
              驳回
              <DropdownMenuShortcut>
                <X size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
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
