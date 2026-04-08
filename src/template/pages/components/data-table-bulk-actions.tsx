import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Order } from './template-columns'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  onBulkDelete: (ids: number[]) => void
}

export function DataTableBulkActions<TData>({
  table,
  onBulkDelete,
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
      <BulkActionsToolbar table={table} entityName='order'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={handleBulkDelete}
              className='size-8'
              aria-label='Delete selected orders'
              title='Delete selected orders'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected orders</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected orders</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <OrderMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onBulkDelete={onBulkDelete}
      />
    </>
  )
}
