import { useState } from 'react'
import { Package, ShoppingCart, Bell, X } from 'lucide-react'
import {
  useNotificationStore,
  type Notification,
} from '@/stores/notification-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { OrderCreatedDetailDialog } from './order-created-detail-dialog'
import { OrderShippedDetailDialog } from './order-shipped-detail-dialog'

const categoryConfig: Record<
  string,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    gradient: string
    bgClass: string
  }
> = {
  order_shipped: {
    label: '发货',
    icon: Package,
    gradient: 'from-emerald-500 to-emerald-600',
    bgClass: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-l-emerald-500',
  },
  order_created: {
    label: '新增订单',
    icon: ShoppingCart,
    gradient: 'from-blue-500 to-blue-600',
    bgClass: 'bg-blue-50/80 dark:bg-blue-950/30 border-l-blue-500',
  },
  order: {
    label: '订单',
    icon: ShoppingCart,
    gradient: 'from-primary to-primary/80',
    bgClass: 'border-l-primary',
  },
  production: {
    label: '生产',
    icon: Bell,
    gradient: 'from-amber-500 to-amber-600',
    bgClass: 'bg-amber-50/80 dark:bg-amber-950/30 border-l-amber-500',
  },
}

export function NotificationToast() {
  const { toasts, removeToast } = useNotificationStore()
  const [currentDetail, setCurrentDetail] = useState<Notification | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleToastClick = async (toast: Notification) => {
    removeToast(toast.id)
    setCurrentDetail(toast)
    setIsDialogOpen(true)
  }

  if (toasts.length === 0) return null

  return (
    <>
      <div className='fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-3'>
        {toasts.map((toast) => {
          const config =
            categoryConfig[toast.notification_type] || categoryConfig.order
          const IconComponent = config.icon

          return (
            <div
              key={toast.id}
              onClick={() => handleToastClick(toast)}
              className={cn(
                'relative flex items-start gap-3 rounded-lg border bg-background p-4 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl',
                'animate-in fade-in-0 slide-in-from-top-5',
                'max-w-[400px] min-w-[320px]',
                'cursor-pointer border-l-4',
                config.bgClass
              )}
            >
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm',
                  config.gradient
                )}
              >
                <IconComponent className='size-5' />
              </div>
              <div className='flex flex-1 flex-col gap-1'>
                <p className='text-sm font-medium'>{toast.title}</p>
                <p className='text-xs text-muted-foreground'>{toast.content}</p>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 shrink-0'
                onClick={(e) => {
                  e.stopPropagation()
                  removeToast(toast.id)
                }}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          )
        })}
      </div>

      {currentDetail && currentDetail.notification_type === 'order_shipped' && (
        <OrderShippedDetailDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          notification={currentDetail}
        />
      )}

      {currentDetail && currentDetail.notification_type === 'order_created' && (
        <OrderCreatedDetailDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          notification={currentDetail}
        />
      )}
    </>
  )
}
