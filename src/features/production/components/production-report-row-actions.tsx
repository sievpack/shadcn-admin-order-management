import { type Row } from '@tanstack/react-table'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import { type ProductionReport } from './production-report-columns'

type ProductionReportRowActionsProps = {
  row: Row<ProductionReport>
  onView?: (row: ProductionReport) => void
  onDelete?: (row: ProductionReport) => void
}

export function ProductionReportRowActions({
  row,
  onView,
  onDelete,
}: ProductionReportRowActionsProps) {
  const actions: any[] = []

  if (onView) {
    actions.push(presetActions.view((r: ProductionReport) => onView(r)))
  }
  if (onDelete) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push(presetActions.delete((r: ProductionReport) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
