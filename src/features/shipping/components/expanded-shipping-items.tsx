import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { shippingAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ShippingOrderItem {
  id: number
  订单编号: string
  规格: string
  产品类型: string
  型号: string
  数量: number
  单位: string
  销售单价: number
  金额: number
  合同编号: string
  备注: string
}

interface ShippingDetail {
  发货单号: string
  快递单号: string
  快递公司: string
  客户名称: string
  发货日期: string
  快递费用: number
  备注: string
  总金额: number
  订单项目: ShippingOrderItem[]
}

interface ExpandedShippingItemsProps {
  detail: ShippingDetail | null
  onRefresh?: () => void
}

export function ExpandedShippingItems({
  detail,
  onRefresh,
}: ExpandedShippingItemsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ShippingOrderItem | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  const handleDeleteClick = (item: ShippingOrderItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    setDeleting(true)
    try {
      const response = await shippingAPI.deleteShippingItem(itemToDelete.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: response.data,
        })
        setDeleteDialogOpen(false)
        onRefresh?.()
      } else {
        showToastWithData({
          type: 'error',
          title: '删除失败',
          data: response.data,
        })
      }
    } catch (error) {
      console.error('删除发货项目失败:', error)
      showToastWithData({ type: 'error', title: '删除失败，请稍后重试' })
    } finally {
      setDeleting(false)
      setItemToDelete(null)
    }
  }

  if (!detail) {
    return (
      <div className='py-4 text-center text-muted-foreground'>暂无发货详情</div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-4'>
        <div>
          <div className='text-xs text-muted-foreground'>快递公司</div>
          <div className='font-medium'>{detail.快递公司 || '-'}</div>
        </div>
        <div>
          <div className='text-xs text-muted-foreground'>快递费用</div>
          <div className='font-medium'>
            {detail.快递费用 ? `¥${detail.快递费用}` : '-'}
          </div>
        </div>
        <div>
          <div className='text-xs text-muted-foreground'>总金额</div>
          <div className='font-medium'>
            {detail.总金额 ? `¥${detail.总金额.toFixed(2)}` : '-'}
          </div>
        </div>
        <div>
          <div className='text-xs text-muted-foreground'>备注</div>
          <div className='truncate font-medium'>{detail.备注 || '-'}</div>
        </div>
      </div>

      <Table>
        <TableHeader className='bg-muted/30'>
          <TableRow>
            <TableHead>订单编号</TableHead>
            <TableHead>规格</TableHead>
            <TableHead>产品类型</TableHead>
            <TableHead>型号</TableHead>
            <TableHead className='text-right'>数量</TableHead>
            <TableHead className='text-right'>单价</TableHead>
            <TableHead className='text-right'>金额</TableHead>
            <TableHead>合同编号</TableHead>
            <TableHead className='w-[100px]'>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {detail.订单项目?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className='font-medium'>{item.订单编号}</TableCell>
              <TableCell>{item.规格}</TableCell>
              <TableCell>{item.产品类型}</TableCell>
              <TableCell>{item.型号}</TableCell>
              <TableCell className='text-right'>
                {item.数量} {item.单位}
              </TableCell>
              <TableCell className='text-right'>
                ¥{item.销售单价.toFixed(2)}
              </TableCell>
              <TableCell className='text-right'>
                ¥{item.金额.toFixed(2)}
              </TableCell>
              <TableCell>{item.合同编号 || '-'}</TableCell>
              <TableCell>
                <div className='flex gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-red-500'
                    onClick={() => handleDeleteClick(item)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除订单项目 &quot;{itemToDelete?.订单编号}&quot; 吗？
              此操作将解除该订单与发货单的关联关系。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className='bg-destructive text-white hover:bg-destructive/90'
            >
              {deleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
