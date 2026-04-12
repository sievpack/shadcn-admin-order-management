import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Package,
  ShoppingCart,
  Bell,
  Clock,
  User,
  Building,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface NotificationDetailDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  notification: {
    id: string
    notification_type: string
    title: string
    content: string
    timestamp?: number
    detail?: Record<string, any>
  } | null
}

const categoryConfig: Record<
  string,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    gradient: string
    color: string
  }
> = {
  order_shipped: {
    label: '发货通知',
    icon: Package,
    gradient: 'from-blue-500 to-blue-600',
    color: 'text-blue-500',
  },
  order_created: {
    label: '新订单',
    icon: ShoppingCart,
    gradient: 'from-emerald-500 to-emerald-600',
    color: 'text-emerald-500',
  },
  order: {
    label: '订单',
    icon: FileText,
    gradient: 'from-primary to-primary/80',
    color: 'text-primary',
  },
  production: {
    label: '生产',
    icon: Bell,
    gradient: 'from-amber-500 to-amber-600',
    color: 'text-amber-500',
  },
}

const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return '-'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function NotificationDetailDialog({
  open = false,
  onOpenChange,
  notification,
}: NotificationDetailDialogProps) {
  if (!notification) return null

  const config =
    categoryConfig[notification.notification_type] || categoryConfig.order
  const IconComponent = config.icon
  const detail = notification.detail || {}

  const renderOrderItems = (items: any[], title: string) => {
    if (!items || items.length === 0) {
      return (
        <div className='py-4 text-center text-muted-foreground'>
          暂无项目数据
        </div>
      )
    }

    return (
      <div className='overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='font-medium'>项目</TableHead>
              <TableHead className='text-right font-medium'>数量</TableHead>
              <TableHead className='text-right font-medium'>单位</TableHead>
              <TableHead className='text-right font-medium'>单价</TableHead>
              <TableHead className='text-right font-medium'>金额</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: any, index: number) => (
              <TableRow
                key={index}
                className='transition-colors hover:bg-muted/30'
              >
                <TableCell className='font-medium'>
                  {item.产品类型 || item.spec || '-'}
                </TableCell>
                <TableCell className='text-right'>{item.数量 || 0}</TableCell>
                <TableCell className='text-right'>
                  {item.单位 || '件'}
                </TableCell>
                <TableCell className='text-right'>
                  ¥{formatNumber(item.销售单价 || item.price)}
                </TableCell>
                <TableCell className='text-right font-medium'>
                  ¥{formatNumber(item.金额 || item.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader className='space-y-4'>
          <div className='flex items-start gap-4'>
            <div
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg',
                config.gradient
              )}
            >
              <IconComponent className='size-6' />
            </div>
            <div className='flex-1 space-y-1'>
              <DialogTitle className='text-lg font-semibold'>
                {notification.title}
              </DialogTitle>
              <DialogDescription className='text-sm text-muted-foreground'>
                {notification.content}
              </DialogDescription>
            </div>
          </div>
          {notification.timestamp && (
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Clock className='size-3.5' />
              <span>
                {format(notification.timestamp * 1000, 'yyyy年MM月dd日 HH:mm', {
                  locale: zhCN,
                })}
              </span>
            </div>
          )}
        </DialogHeader>

        <Separator className='my-2' />

        <div className='flex flex-col gap-6 py-4'>
          {/* 订单/发货通用信息 */}
          {(detail.订单编号 || detail.发货单号 || detail.客户名称) && (
            <div className='grid grid-cols-2 gap-4'>
              {detail.订单编号 && (
                <Card className='p-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-xs text-muted-foreground'>
                      订单编号
                    </span>
                    <span className='font-mono text-sm font-medium'>
                      {detail.订单编号}
                    </span>
                  </div>
                </Card>
              )}
              {detail.发货单号 && (
                <Card className='p-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-xs text-muted-foreground'>
                      发货单号
                    </span>
                    <span className='font-mono text-sm font-medium'>
                      {detail.发货单号}
                    </span>
                  </div>
                </Card>
              )}
              {detail.快递单号 && (
                <Card className='p-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-xs text-muted-foreground'>
                      快递单号
                    </span>
                    <span className='font-mono text-sm font-medium'>
                      {detail.快递单号}
                    </span>
                  </div>
                </Card>
              )}
              {detail.客户名称 && (
                <Card className='p-4'>
                  <div className='flex items-center gap-2'>
                    <Building className='size-4 text-muted-foreground' />
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-xs text-muted-foreground'>
                        客户
                      </span>
                      <span className='text-sm font-medium'>
                        {detail.客户名称}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* 日期信息 */}
          {(detail.订单日期 || detail.交货日期 || detail.发货日期) && (
            <div className='grid grid-cols-2 gap-4'>
              {detail.订单日期 && (
                <Card className='p-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-xs text-muted-foreground'>
                      订单日期
                    </span>
                    <span className='text-sm font-medium'>
                      {format(new Date(detail.订单日期), 'yyyy-MM-dd')}
                    </span>
                  </div>
                </Card>
              )}
              {detail.交货日期 && (
                <Card className='p-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-xs text-muted-foreground'>
                      交货日期
                    </span>
                    <span className='text-sm font-medium'>
                      {format(new Date(detail.交货日期), 'yyyy-MM-dd')}
                    </span>
                  </div>
                </Card>
              )}
              {detail.发货日期 && (
                <Card className='p-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-xs text-muted-foreground'>
                      发货日期
                    </span>
                    <span className='text-sm font-medium'>
                      {format(new Date(detail.发货日期), 'yyyy-MM-dd')}
                    </span>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* 金额信息 */}
          {(detail.订单总金额 || detail.发货总金额) && (
            <Card className='border-primary/20 bg-primary/5 p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {detail.订单总金额 ? '订单总金额' : '发货总金额'}
                </span>
                <span className='text-xl font-bold text-primary'>
                  ¥{formatNumber(detail.订单总金额 || detail.发货总金额)}
                </span>
              </div>
            </Card>
          )}

          {/* 订单/发货项目 */}
          {detail.订单项目 && (
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>
                订单项目
              </h4>
              {renderOrderItems(detail.订单项目, '订单项目')}
            </div>
          )}

          {detail.发货项目 && (
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>
                发货项目
              </h4>
              {renderOrderItems(detail.发货项目, '发货项目')}
            </div>
          )}

          {/* 无详情时显示提示 */}
          {Object.keys(detail).length === 0 && (
            <div className='py-8 text-center'>
              <div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted'>
                <FileText className='size-6 text-muted-foreground' />
              </div>
              <p className='text-sm text-muted-foreground'>暂无详细信息</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
