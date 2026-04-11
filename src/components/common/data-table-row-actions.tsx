import { type Row } from '@tanstack/react-table'
import { Eye, Edit, Trash2, Download, MoreHorizontal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type RowAction<TData> = {
  label: string
  icon?: React.ReactNode
  separator?: boolean
  variant?: 'default' | 'destructive' | 'secondary'
  disabled?: boolean
  onClick: (row: TData) => void
}

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
  actions: RowAction<TData>[]
}

export function DataTableRowActions<TData>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) {
  if (actions.length === 0) return null

  const getIcon = (label: string) => {
    switch (label) {
      case '查看':
        return <Eye size={16} />
      case '编辑':
        return <Edit size={16} />
      case '删除':
        return <Trash2 size={16} />
      case '导出':
      case '导出PDF':
        return <Download size={16} />
      case '添加分项':
      case '添加':
        return <Plus size={16} />
      default:
        return null
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>打开菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => action.onClick(row.original)}
            disabled={action.disabled}
            className={
              action.variant === 'destructive'
                ? 'text-destructive'
                : action.variant === 'secondary'
                  ? 'text-blue-600'
                  : ''
            }
          >
            {action.label}
            {action.icon && (
              <DropdownMenuShortcut>{action.icon}</DropdownMenuShortcut>
            )}
            {!action.icon && getIcon(action.label) && (
              <DropdownMenuShortcut>
                {getIcon(action.label)}
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DataTableRowActionsWithGroups<TData>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) {
  if (actions.length === 0) return null

  const getIcon = (label: string) => {
    switch (label) {
      case '查看':
        return <Eye size={16} />
      case '编辑':
        return <Edit size={16} />
      case '删除':
        return <Trash2 size={16} />
      case '导出':
      case '导出PDF':
        return <Download size={16} />
      case '添加分项':
      case '添加':
        return <Plus size={16} />
      default:
        return null
    }
  }

  const renderItems = () => {
    const items: React.ReactNode[] = []

    actions.forEach((action, index) => {
      if (action.separator) {
        if (index > 0) {
          items.push(<DropdownMenuSeparator key={`sep-${index}`} />)
        }
        return
      }

      items.push(
        <DropdownMenuItem
          key={index}
          onClick={() => action.onClick(row.original)}
          disabled={action.disabled}
          className={
            action.variant === 'destructive'
              ? 'text-destructive'
              : action.variant === 'secondary'
                ? 'text-blue-600'
                : ''
          }
        >
          {action.label}
          {action.icon && (
            <DropdownMenuShortcut>{action.icon}</DropdownMenuShortcut>
          )}
          {!action.icon && getIcon(action.label) && (
            <DropdownMenuShortcut>{getIcon(action.label)}</DropdownMenuShortcut>
          )}
        </DropdownMenuItem>
      )
    })

    return items
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>打开菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        {renderItems()}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const presetActions = {
  view: (onClick: (row: any) => void) => ({
    label: '查看',
    onClick,
  }),
  edit: (onClick: (row: any) => void) => ({
    label: '编辑',
    onClick,
  }),
  delete: (onClick: (row: any) => void) => ({
    label: '删除',
    variant: 'destructive' as const,
    onClick,
  }),
  export: (onClick: (row: any) => void) => ({
    label: '导出PDF',
    variant: 'secondary' as const,
    onClick,
  }),
  add: (onClick: (row: any) => void) => ({
    label: '添加分项',
    onClick,
  }),
}
