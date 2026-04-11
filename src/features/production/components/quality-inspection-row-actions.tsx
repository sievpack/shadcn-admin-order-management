import { type Row } from '@tanstack/react-table'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import { type QualityInspection } from './quality-inspection-columns'

type QualityInspectionRowActionsProps = {
  row: Row<QualityInspection>
  onView?: (row: QualityInspection) => void
  onDelete?: (row: QualityInspection) => void
}

export function QualityInspectionRowActions({
  row,
  onView,
  onDelete,
}: QualityInspectionRowActionsProps) {
  const actions: any[] = []

  if (onView) {
    actions.push(presetActions.view((r: QualityInspection) => onView(r)))
  }
  if (onDelete) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push(presetActions.delete((r: QualityInspection) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
