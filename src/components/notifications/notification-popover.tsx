import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Package, ShoppingCart, Bell, CheckCheck, X } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import {
  useNotificationStore,
  type Notification,
} from '@/stores/notification-store'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { OrderCreatedDetailDialog } from './order-created-detail-dialog'
import { OrderShippedDetailDialog } from './order-shipped-detail-dialog'

const categoryConfig: Record<
  string,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    gradient: string
  }
> = {
  order_shipped: {
    label: '发货',
    icon: Package,
    gradient: 'from-blue-500 to-blue-600',
  },
  order_created: {
    label: '新增订单',
    icon: ShoppingCart,
    gradient: 'from-emerald-500 to-emerald-600',
  },
  order: {
    label: '订单',
    icon: ShoppingCart,
    gradient: 'from-primary to-primary/80',
  },
  production: {
    label: '生产',
    icon: Bell,
    gradient: 'from-amber-500 to-amber-600',
  },
}

export function NotificationPopover() {
  const { notifications, isDrawerOpen, setDrawerOpen, markRead, isRead } =
    useNotificationStore()
  const { auth } = useAuthStore()
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !isRead(n.id)).length

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification)
    setIsDialogOpen(true)

    if (!isRead(notification.id)) {
      markRead(notification.id)

      try {
        await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({ notification_id: notification.id }),
        })
      } catch (e) {
        console.error('Failed to mark as read:', e)
      }
    }
  }

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!isRead(n.id)) {
        markRead(n.id)
        try {
          await fetch('/api/notifications/mark-read', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify({ notification_id: n.id }),
          })
        } catch (e) {
          console.error('Failed to mark as read:', e)
        }
      }
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='ghost' size='icon' className='relative'>
            {useNotificationStore.getState().wsConnected ? (
              <Bell data-icon='inline-start' />
            ) : (
              <Bell
                data-icon='inline-start'
                className='text-muted-foreground'
              />
            )}
            {unreadCount > 0 && (
              <span className='absolute -top-1 -right-1 flex h-5 w-5 animate-in items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-medium text-white shadow-lg zoom-in-50'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[380px] p-0' align='end' sideOffset={8}>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <div className='flex items-center gap-2'>
              <h3 className='font-semibold'>通知中心</h3>
              {unreadCount > 0 && (
                <Badge variant='secondary' className='text-[10px] font-normal'>
                  {unreadCount} 未读
                </Badge>
              )}
            </div>
            <div className='flex items-center gap-1'>
              {unreadCount > 0 && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={handleMarkAllRead}
                >
                  <CheckCheck className='h-4 w-4' />
                </Button>
              )}
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => setOpen(false)}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <ScrollArea className='h-[415px]'>
            {notifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='mb-3 flex size-12 items-center justify-center rounded-full bg-muted'>
                  <Bell className='size-6 text-muted-foreground' />
                </div>
                <p className='text-sm font-medium'>暂无通知</p>
                <p className='text-xs text-muted-foreground'>
                  收到新消息时会在此处显示
                </p>
              </div>
            ) : (
              <div className='divide-y'>
                {notifications.map((notification) => {
                  const config =
                    categoryConfig[notification.notification_type] ||
                    categoryConfig.order
                  const IconComponent = config.icon
                  const isMessageRead = isRead(notification.id)

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'group relative cursor-pointer px-4 py-3',
                        'transition-colors hover:bg-muted/50',
                        isMessageRead && 'opacity-60'
                      )}
                    >
                      <div className='flex gap-3'>
                        <div
                          className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm',
                            config.gradient
                          )}
                        >
                          <IconComponent className='size-5' />
                        </div>
                        <div className='flex-1 space-y-1.5'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <p className='text-sm font-medium'>
                                {notification.title}
                              </p>
                              {!isMessageRead && (
                                <span className='size-2 rounded-full bg-blue-500' />
                              )}
                            </div>
                            <p className='text-[10px] text-muted-foreground'>
                              {formatDistanceToNow(
                                notification.timestamp * 1000,
                                {
                                  addSuffix: true,
                                  locale: zhCN,
                                }
                              )}
                            </p>
                          </div>
                          <p className='line-clamp-2 text-xs text-muted-foreground'>
                            {notification.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <div className='border-t p-2'>
              <Button
                variant='ghost'
                className='w-full text-xs text-muted-foreground'
                onClick={() => setDrawerOpen(true)}
              >
                查看全部通知
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {selectedNotification &&
        selectedNotification.notification_type === 'order_shipped' && (
          <OrderShippedDetailDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            notification={selectedNotification}
          />
        )}

      {selectedNotification &&
        selectedNotification.notification_type === 'order_created' && (
          <OrderCreatedDetailDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            notification={selectedNotification}
          />
        )}
    </>
  )
}
