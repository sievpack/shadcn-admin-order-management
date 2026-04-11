import { type Row } from '@tanstack/react-table'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import { type MaterialConsumption } from './material-consumption-columns'

type MaterialConsumptionRowActionsProps = {
  row: Row<MaterialConsumption>
  onDelete?: (row: MaterialConsumption) => void
}

export function MaterialConsumptionRowActions({
  row,
  onDelete,
}: MaterialConsumptionRowActionsProps) {
  const actions: any[] = []

  if (onDelete) {
    actions.push(presetActions.delete((r: MaterialConsumption) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
