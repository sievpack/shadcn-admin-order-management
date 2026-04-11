import { type Row } from '@tanstack/react-table'
import { Eye, Edit, Trash2, Check, X, ClipboardList } from 'lucide-react'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'

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
  row: Row<ProductionPlan>
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
  const plan = row.original
  const actions: any[] = []

  if (onView) {
    actions.push(presetActions.view((r: ProductionPlan) => onView(r)))
  }
  if (onEdit) {
    actions.push(presetActions.edit((r: ProductionPlan) => onEdit(r)))
  }

  if (
    plan.计划状态 !== '待审核' &&
    onGenerateOrder &&
    plan.计划数量 > plan.已排数量
  ) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push({
      label: '生成工单',
      icon: <ClipboardList className='h-4 w-4' />,
      variant: 'secondary' as const,
      onClick: (r: ProductionPlan) => onGenerateOrder(r),
    })
  }

  if (plan.计划状态 === '待审核') {
    actions.push({ separator: true, label: '', onClick: () => {} })
    if (onApprove) {
      actions.push({
        label: '审核通过',
        icon: <Check className='h-4 w-4' />,
        variant: 'secondary' as const,
        onClick: (r: ProductionPlan) => onApprove(r),
      })
    }
    if (onReject) {
      actions.push({
        label: '驳回',
        icon: <X className='h-4 w-4' />,
        variant: 'secondary' as const,
        onClick: (r: ProductionPlan) => onReject(r),
      })
    }
  }

  if (onDelete) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push(presetActions.delete((r: ProductionPlan) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
