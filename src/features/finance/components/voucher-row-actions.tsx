import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Voucher } from './voucher-columns'

type VoucherRowActionsProps = {
  row: Voucher
  onApprove?: (row: Voucher) => void
}

export function VoucherRowActions({ row, onApprove }: VoucherRowActionsProps) {
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
      <DropdownMenuContent align='end' className='w-[160px]'>
        {row.审核状态 === '待审核' && onApprove && (
          <DropdownMenuItem onClick={() => onApprove(row)}>
            审核通过
            <DropdownMenuShortcut>
              <Check size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
