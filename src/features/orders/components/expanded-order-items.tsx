import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface OrderItem {
  id: number
  订单编号: string
  合同编号: string
  订单日期: string
  交货日期: string
  规格: string
  产品类型: string
  型号: string
  数量: number
  单位: string
  销售单价: number
  金额: number
  备注: string
  结算方式: string
  客户物料编号: string
  客户名称: string
  外购: boolean
}

interface ExpandedOrderItemsProps {
  items: OrderItem[]
  onEdit?: (id: number, item: OrderItem) => void
  onDelete?: (id: number) => void
}

export function ExpandedOrderItems({
  items,
  onEdit,
  onDelete,
}: ExpandedOrderItemsProps) {
  const totalQuantity = items.reduce((sum, item) => sum + (item.数量 || 0), 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.金额 || 0), 0)

  return (
    <Table>
      <TableHeader className='bg-muted/50'>
        <TableRow>
          <TableHead>产品类型</TableHead>
          <TableHead>规格</TableHead>
          <TableHead>型号</TableHead>
          <TableHead className='text-right'>数量</TableHead>
          <TableHead>单位</TableHead>
          <TableHead className='text-right'>销售单价</TableHead>
          <TableHead className='text-right'>金额</TableHead>
          <TableHead>备注</TableHead>
          <TableHead>客户物料编号</TableHead>
          <TableHead className='w-[80px]'>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.产品类型}</TableCell>
            <TableCell>{item.规格}</TableCell>
            <TableCell>{item.型号}</TableCell>
            <TableCell className='text-right'>{item.数量}</TableCell>
            <TableCell>{item.单位}</TableCell>
            <TableCell className='text-right'>{item.销售单价}</TableCell>
            <TableCell className='text-right'>{item.金额}</TableCell>
            <TableCell>{item.备注 || '-'}</TableCell>
            <TableCell>{item.客户物料编号 || '-'}</TableCell>
            <TableCell>
              <div className='flex gap-1'>
                {onEdit && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => onEdit(item.id, item)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-red-500'
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        <TableRow className='bg-muted/30 font-medium'>
          <TableCell colSpan={3} className='text-right'>
            合计
          </TableCell>
          <TableCell className='text-right'>{totalQuantity}</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell className='text-right'>{totalAmount.toFixed(2)}</TableCell>
          <TableCell colSpan={2}></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
