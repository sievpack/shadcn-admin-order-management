import { Loader2 } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'

interface TableLoadingProps {
  colSpan: number
}

export function TableLoading({ colSpan }: TableLoadingProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className='h-24 text-center'>
        <Loader2 className='mx-auto h-6 w-6 animate-spin text-primary' />
      </TableCell>
    </TableRow>
  )
}
