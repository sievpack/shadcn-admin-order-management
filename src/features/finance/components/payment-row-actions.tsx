import { type Row } from '@tanstack/react-table'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import type { PaymentRecord } from './payment-columns'

type PaymentRowActionsProps = {
  row: Row<PaymentRecord>
  onDelete?: (row: PaymentRecord) => void
}

export function PaymentRowActions({ row, onDelete }: PaymentRowActionsProps) {
  const actions: any[] = []

  if (onDelete) {
    actions.push(presetActions.delete((r: PaymentRecord) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
