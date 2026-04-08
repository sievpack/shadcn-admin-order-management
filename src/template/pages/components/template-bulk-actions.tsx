import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { MultiDeleteDialog } from './multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  onBulkDelete: (ids: number[]) => void
  entityName?: string
}

export function DataTableBulkActions<TData>({
  table,
  onBulkDelete,
  entityName = 'item',
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      setShowDeleteConfirm(true)
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName={entityName}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={handleBulkDelete}
              className='size-8'
              aria-label={`Delete selected ${entityName}`}
              title={`Delete selected ${entityName}`}
            >
              <Trash2 />
              <span className='sr-only'>Delete selected {entityName}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected {entityName}</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <MultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onBulkDelete={onBulkDelete}
        entityName={entityName}
      />
    </>
  )
}
