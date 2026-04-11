import { type Row } from '@tanstack/react-table'
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
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import { type ProductionOrder } from './production-order-columns'

type ProductionOrderRowActionsProps = {
  row: Row<ProductionOrder>
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
  const order = row.original
  const actions: any[] = []

  if (onView) {
    actions.push(presetActions.view((r: ProductionOrder) => onView(r)))
  }
  if (onEdit) {
    actions.push(presetActions.edit((r: ProductionOrder) => onEdit(r)))
  }

  if (order.工单状态 === '待生产' || order.工单状态 === '已暂停') {
    if (onStart) {
      actions.push({ separator: true, label: '', onClick: () => {} })
      actions.push({
        label: '开始生产',
        icon: <Play className='h-4 w-4' />,
        variant: 'secondary' as const,
        onClick: (r: ProductionOrder) => onStart(r),
      })
    }
  }

  if (order.工单状态 === '生产中') {
    actions.push({ separator: true, label: '', onClick: () => {} })
    if (onReport) {
      actions.push({
        label: '报工',
        icon: <ClipboardList className='h-4 w-4' />,
        variant: 'secondary' as const,
        onClick: (r: ProductionOrder) => onReport(r),
      })
    }
    if (onFinish) {
      actions.push({
        label: '完工确认',
        icon: <CheckCircle className='h-4 w-4' />,
        variant: 'secondary' as const,
        onClick: (r: ProductionOrder) => onFinish(r),
      })
    }
    if (onPause) {
      actions.push({
        label: '暂停',
        icon: <Pause className='h-4 w-4' />,
        variant: 'secondary' as const,
        onClick: (r: ProductionOrder) => onPause(r),
      })
    }
  }

  if (onPrint) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push({
      label: '打印',
      icon: <Printer className='h-4 w-4' />,
      variant: 'secondary' as const,
      onClick: (r: ProductionOrder) => onPrint(r),
    })
  }

  if (onDelete) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push(presetActions.delete((r: ProductionOrder) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
