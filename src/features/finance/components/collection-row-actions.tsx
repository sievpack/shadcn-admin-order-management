import { type Row } from '@tanstack/react-table'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import type { CollectionRecord } from './collection-columns'

type CollectionRowActionsProps = {
  row: Row<CollectionRecord>
  onDelete?: (row: CollectionRecord) => void
}

export function CollectionRowActions({
  row,
  onDelete,
}: CollectionRowActionsProps) {
  const actions: any[] = []

  if (onDelete) {
    actions.push(presetActions.delete((r: CollectionRecord) => onDelete(r)))
  }

  return <CommonRowActions row={row} actions={actions} />
}
