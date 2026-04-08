import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Eye, Edit, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type DictType } from './dict-type-columns'

type DictTypeRowActionsProps = {
  row: DictType
  onView?: (row: DictType) => void
  onEdit?: (row: DictType) => void
  onDelete?: (row: DictType) => void
  onAddData?: (row: DictType) => void
}

export function DictTypeRowActions({
  row,
  onView,
  onEdit,
  onDelete,
  onAddData,
}: DictTypeRowActionsProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>打开菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        {onView && (
          <DropdownMenuItem onClick={() => onView(row)}>
            查看
            <DropdownMenuShortcut>
              <Eye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(row)}>
            编辑
            <DropdownMenuShortcut>
              <Edit size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {onAddData && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAddData(row)}>
              添加字典数据
              <DropdownMenuShortcut>
                <Plus size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(row)}
              className='text-red-500'
            >
              删除
              <DropdownMenuShortcut>
                <Trash2 size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
