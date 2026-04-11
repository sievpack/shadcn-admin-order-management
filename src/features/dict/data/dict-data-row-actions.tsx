import { type Row } from '@tanstack/react-table'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import { type DictData } from './dict-data-columns'

type DictDataRowActionsProps = {
  row: Row<DictData>
  onEdit?: (row: DictData) => void
  onDelete?: (row: DictData) => void
}

export function DictDataRowActions({
  row,
  onEdit,
  onDelete,
}: DictDataRowActionsProps) {
  const actions: any[] = []

  if (onEdit) {
    actions.push(presetActions.edit((r: DictData) => onEdit(r)))
  }
  if (onDelete) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push(presetActions.delete((r: DictData) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
