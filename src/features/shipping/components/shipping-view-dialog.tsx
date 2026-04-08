import { useState, useEffect } from 'react'
import {
  Eye,
  Package,
  Truck,
  Calendar,
  User,
  CreditCard,
  FileText,
  DollarSign,
  MessageSquare,
  ListChecks,
  Loader2,
  Edit,
  Trash2,
  Save,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { shippingAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type OrderItem = {
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

type ShippingDetail = {
  发货单号: string
  快递单号: string
  快递公司: string
  客户名称: string
  发货日期: string
  快递费用: number
  备注: string
  总金额: number
  订单项目: OrderItem[]
}

type ShippingViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: {
    发货单号: string
  }
  onRefresh?: () => void
}

export function ShippingViewDialog({
  open,
  onOpenChange,
  currentRow,
  onRefresh,
}: ShippingViewDialogProps) {
  const [detail, setDetail] = useState<ShippingDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [deletingItem, setDeletingItem] = useState<OrderItem | null>(null)

  useEffect(() => {
    if (open && currentRow?.发货单号) {
      fetchShippingDetail()
    }
  }, [open, currentRow?.发货单号])

  const fetchShippingDetail = async () => {
    if (!currentRow?.发货单号) return

    setLoading(true)
    setError('')
    try {
      const response = await shippingAPI.getShippingDetail(currentRow.发货单号)
      if (response.data.code === 0) {
        setDetail(response.data.data)
      } else {
        setError('获取发货单详情失败: ' + response.data.msg)
        setDetail(null)
      }
    } catch (error: any) {
      console.error('获取发货单详情失败:', error)
      setError('获取数据失败: ' + error.message)
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (item: OrderItem) => {
    if (!confirm('确定要删除这条发货记录吗？')) return

    setLoading(true)
    try {
      // 调用删除API，将订单表中的发货信息设置为NULL
      await shippingAPI.deleteShippingItem(item.id)
      toast.success('删除成功')
      // 重新获取发货单详情
      await fetchShippingDetail()
      // 刷新列表
      if (onRefresh) {
        onRefresh()
      }
    } catch (error: any) {
      console.error('删除失败:', error)
      toast.error('删除失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  if (loading && !detail) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Eye className='h-5 w-5' />
              发货单详情
            </DialogTitle>
            <DialogDescription>正在加载详情...</DialogDescription>
          </DialogHeader>
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Eye className='h-5 w-5' />
              发货单详情
            </DialogTitle>
            <DialogDescription>获取详情失败</DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <div className='rounded-md border border-destructive bg-destructive/10 p-4'>
              <p className='text-destructive'>{error}</p>
            </div>
          </div>
          <div className='flex justify-end'>
            <Button onClick={() => onOpenChange(false)} variant='outline'>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!detail) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='flex items-center gap-2'>
              <Eye className='h-5 w-5' />
              发货单详情
            </DialogTitle>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditing(!isEditing)}
              className='flex items-center gap-1'
            >
              {isEditing ? (
                <>
                  <X data-icon='inline-start' />
                  取消
                </>
              ) : (
                <>
                  <Edit data-icon='inline-start' />
                  编辑
                </>
              )}
            </Button>
          </div>
          <DialogDescription>查看发货单的详细信息</DialogDescription>
        </DialogHeader>

        {/* 发货单基本信息 */}
        <div className='grid grid-cols-2 gap-6 py-4'>
          {/* 发货单号 */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <FileText className='h-4 w-4' />
              <span>发货单号</span>
            </div>
            <p className='text-sm font-medium'>{detail.发货单号}</p>
          </div>

          {/* 快递单号 */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Package className='h-4 w-4' />
              <span>快递单号</span>
            </div>
            <p className='text-sm font-medium'>{detail.快递单号}</p>
          </div>

          {/* 快递公司 */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Truck className='h-4 w-4' />
              <span>快递公司</span>
            </div>
            <p className='text-sm font-medium'>{detail.快递公司 || '未填写'}</p>
          </div>

          {/* 客户名称 */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <User className='h-4 w-4' />
              <span>客户名称</span>
            </div>
            <p className='text-sm font-medium'>{detail.客户名称}</p>
          </div>

          {/* 总金额 */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <DollarSign className='h-4 w-4' />
              <span>总金额</span>
            </div>
            <p className='text-sm font-medium'>¥{detail.总金额.toFixed(2)}</p>
          </div>

          {/* 发货日期 */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Calendar className='h-4 w-4' />
              <span>发货日期</span>
            </div>
            <p className='text-sm font-medium'>{detail.发货日期 || '-'}</p>
          </div>

          {/* 快递费用 */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <CreditCard className='h-4 w-4' />
              <span>快递费用</span>
            </div>
            <p className='text-sm font-medium'>
              {detail.快递费用 ? `¥${detail.快递费用.toFixed(2)}` : '¥0.00'}
            </p>
          </div>

          {/* 备注 */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <MessageSquare className='h-4 w-4' />
              <span>备注</span>
            </div>
            <p className='text-sm font-medium'>{detail.备注 || '-'}</p>
          </div>
        </div>

        {/* 订单项目列表 */}
        <div className='mt-6'>
          <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
            <ListChecks className='h-5 w-5' />
            发货内容
          </h3>
          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合同编号</TableHead>
                  <TableHead>规格</TableHead>
                  <TableHead>产品类型</TableHead>
                  <TableHead>型号</TableHead>
                  <TableHead className='text-right'>数量</TableHead>
                  <TableHead>单位</TableHead>
                  <TableHead className='text-right'>销售单价</TableHead>
                  <TableHead className='text-right'>金额</TableHead>
                  {isEditing && (
                    <TableHead className='text-center'>操作</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.订单项目.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.合同编号 || '-'}</TableCell>
                    <TableCell>{item.规格}</TableCell>
                    <TableCell>{item.产品类型}</TableCell>
                    <TableCell>{item.型号}</TableCell>
                    <TableCell className='text-right'>{item.数量}</TableCell>
                    <TableCell>{item.单位}</TableCell>
                    <TableCell className='text-right'>
                      ¥{item.销售单价.toFixed(2)}
                    </TableCell>
                    <TableCell className='text-right'>
                      ¥{item.金额.toFixed(2)}
                    </TableCell>
                    {isEditing && (
                      <TableCell className='text-center'>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => handleDeleteItem(item)}
                          className='h-8 w-8 p-0'
                          disabled={loading}
                        >
                          <Trash2 className='h-4 w-4' />
                          <span className='sr-only'>删除</span>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {detail.订单项目.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isEditing ? 9 : 8}
                      className='text-center'
                    >
                      暂无订单项目
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className='mt-6 flex justify-end'>
          <Button onClick={() => onOpenChange(false)} variant='outline'>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
