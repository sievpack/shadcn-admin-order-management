import { type Row } from '@tanstack/react-table'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import { type ProductInbound } from './product-inbound-columns'

type ProductInboundRowActionsProps = {
  row: Row<ProductInbound>
  onView?: (row: ProductInbound) => void
  onDelete?: (row: ProductInbound) => void
}

export function ProductInboundRowActions({
  row,
  onView,
  onDelete,
}: ProductInboundRowActionsProps) {
  const actions: any[] = []

  if (onView) {
    actions.push(presetActions.view((r: ProductInbound) => onView(r)))
  }
  if (onDelete) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push(presetActions.delete((r: ProductInbound) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
