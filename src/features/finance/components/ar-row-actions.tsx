import { type Row } from '@tanstack/react-table'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import type { AccountsReceivable } from './ar-columns'

type ARRowActionsProps = {
  row: Row<AccountsReceivable>
  onView?: (row: AccountsReceivable) => void
  onEdit?: (row: AccountsReceivable) => void
  onDelete?: (row: AccountsReceivable) => void
}

export function ARRowActions({
  row,
  onView,
  onEdit,
  onDelete,
}: ARRowActionsProps) {
  const actions: any[] = []

  if (onView) {
    actions.push(presetActions.view((r: AccountsReceivable) => onView(r)))
  }
  if (onEdit) {
    actions.push(presetActions.edit((r: AccountsReceivable) => onEdit(r)))
  }
  if (onDelete) {
    actions.push({ separator: true, label: '', onClick: () => {} })
    actions.push(presetActions.delete((r: AccountsReceivable) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
