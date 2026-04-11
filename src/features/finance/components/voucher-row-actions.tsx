import { type Row } from '@tanstack/react-table'
import { Check } from 'lucide-react'
import { DataTableRowActionsWithGroups as CommonRowActions } from '@/components/common'
import type { Voucher } from './voucher-columns'

type VoucherRowActionsProps = {
  row: Row<Voucher>
  onApprove?: (row: Voucher) => void
}

export function VoucherRowActions({ row, onApprove }: VoucherRowActionsProps) {
  const actions: any[] = []

  if (row.审核状态 === '待审核' && onApprove) {
    actions.push({
      label: '审核通过',
      icon: <Check className='h-4 w-4' />,
      onClick: (r: Voucher) => onApprove(r),
    })
  }

  return <CommonRowActions row={row} actions={actions} />
}
