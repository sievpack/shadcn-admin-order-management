import { type Table } from '@tanstack/react-table'
import { Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'

type BulkAction<TData> = {
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline'
  onClick: (rows: TData[]) => void | Promise<void>
  disabled?: boolean
}

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  actions: BulkAction<TData>[]
  entityName?: string
}

export function DataTableBulkActions<TData>({
  table,
  actions,
  entityName = 'item',
}: DataTableBulkActionsProps<TData>) {
  if (actions.length === 0) return null

  return (
    <BulkActionsToolbar table={table} entityName={entityName}>
      {actions.map((action, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Button
              variant={action.variant || 'outline'}
              size='icon'
              onClick={() =>
                action.onClick(
                  table
                    .getFilteredSelectedRowModel()
                    .rows.map((r) => r.original)
                )
              }
              disabled={action.disabled}
            >
              {action.icon || action.label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{action.label}</TooltipContent>
        </Tooltip>
      ))}
    </BulkActionsToolbar>
  )
}

// 常用批量操作预设
export const presetBulkActions = {
  export: (onExport: (rows: any[]) => void) => ({
    label: '导出',
    icon: <Download className='h-4 w-4' />,
    onClick: onExport,
  }),
  delete: (onDelete: (rows: any[]) => void) => ({
    label: '删除',
    icon: <Trash2 className='h-4 w-4' />,
    variant: 'destructive' as const,
    onClick: onDelete,
  }),
}
