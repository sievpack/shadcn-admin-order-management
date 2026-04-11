import { type Row } from '@tanstack/react-table'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import type { AccountsPayable } from './ap-columns'

type APRowActionsProps = {
  row: Row<AccountsPayable>
  onView?: (row: AccountsPayable) => void
  onEdit?: (row: AccountsPayable) => void
  onDelete?: (row: AccountsPayable) => void
}

export function APRowActions({
  row,
  onView,
  onEdit,
  onDelete,
}: APRowActionsProps) {
  const actions: any[] = []

  if (onView) {
    actions.push(presetActions.view((r: AccountsPayable) => onView(r)))
  }
  if (onEdit) {
    actions.push(presetActions.edit((r: AccountsPayable) => onEdit(r)))
  }
  if (onDelete) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push(presetActions.delete((r: AccountsPayable) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
