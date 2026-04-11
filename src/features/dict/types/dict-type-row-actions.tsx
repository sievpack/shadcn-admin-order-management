import { type Row } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import { type DictType } from './dict-type-columns'

type DictTypeRowActionsProps = {
  row: Row<DictType>
  onView?: (row: DictType) => void
  onEdit?: (row: DictType) => void
  onDelete?: (row: DictType) => void
  onAddData?: (row: DictType) => void
}

export function DictTypeRowActions({
  row,
  onView,
  onEdit,
  onDelete,
  onAddData,
}: DictTypeRowActionsProps) {
  const actions: any[] = []

  if (onView) {
    actions.push(presetActions.view((r: DictType) => onView(r)))
  }
  if (onEdit) {
    actions.push(presetActions.edit((r: DictType) => onEdit(r)))
  }
  if (onAddData) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push({
      label: '添加字典数据',
      icon: <Plus className='h-4 w-4' />,
      onClick: (r: DictType) => onAddData(r),
    })
  }
  if (onDelete) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push(presetActions.delete((r: DictType) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
