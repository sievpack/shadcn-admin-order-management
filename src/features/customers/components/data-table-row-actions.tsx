import { type Row } from '@tanstack/react-table'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import { useCustomer } from './customer-provider'
import { type Customer } from './customer-provider'

type DataTableRowActionsProps = {
  row: Row<Customer>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useCustomer()

  const actions = [
    presetActions.view((r) => {
      setCurrentRow(r)
      setOpen('view')
    }),
    presetActions.edit((r) => {
      setCurrentRow(r)
      setOpen('edit')
    }),
    { separator: true, label: '', onClick: () => {} },
    presetActions.delete((r) => {
      setCurrentRow(r)
      setOpen('delete')
    }),
  ]

  return <CommonRowActions row={row} actions={actions} />
}
