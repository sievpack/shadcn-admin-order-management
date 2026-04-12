import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Package, ShoppingCart, Bell, CheckCheck, X, Inbox } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { NotificationDetailDialog } from './notification-detail-dialog'

const categoryConfig: Record<
  string,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    gradient: string
    bgGradient: string
  }
> = {
  order_shipped: {
    label: '发货',
    icon: Package,
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'bg-blue-500/10',
  },
  order_created: {
    label: '新订单',
    icon: ShoppingCart,
    gradient: 'from-emerald-500 to-emerald-600',
    bgGradient: 'bg-emerald-500/10',
  },
  order: {
    label: '订单',
    icon: ShoppingCart,
    gradient: 'from-primary to-primary/80',
    bgGradient: 'bg-primary/10',
  },
  production: {
    label: '生产',
    icon: Bell,
    gradient: 'from-amber-500 to-amber-600',
    bgGradient: 'bg-amber-500/10',
  },
}

export function NotificationPopover() {
  const { notifications, setDrawerOpen, markRead, isRead } =
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
          <Button
            variant='ghost'
            size='icon'
            className='relative transition-transform duration-200 hover:scale-105 active:scale-95'
          >
            {useNotificationStore.getState().wsConnected ? (
              <Bell
                data-icon='inline-start'
                className='transition-colors duration-200'
              />
            ) : (
              <Bell
                data-icon='inline-start'
                className='text-muted-foreground transition-colors duration-200'
              />
            )}
            {unreadCount > 0 && (
              <span className='absolute -top-1 -right-1 flex size-5 animate-in items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[10px] font-medium text-white shadow-lg ring-2 ring-background duration-200 zoom-in-75'>
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
                <Badge
                  variant='secondary'
                  className='animate-in text-[10px] font-normal fade-in-50 zoom-in-95'
                >
                  {unreadCount} 未读
                </Badge>
              )}
            </div>
            <div className='flex items-center gap-0.5'>
              {unreadCount > 0 && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 transition-colors hover:bg-primary/10 hover:text-primary'
                  onClick={handleMarkAllRead}
                >
                  <CheckCheck className='size-4' />
                </Button>
              )}
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 transition-colors hover:bg-muted'
                onClick={() => setOpen(false)}
              >
                <X className='size-4' />
              </Button>
            </div>
          </div>

          <ScrollArea className='h-[380px]'>
            {notifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='mb-4 flex size-14 items-center justify-center rounded-full bg-muted'>
                  <Inbox className='size-7 text-muted-foreground' />
                </div>
                <p className='mb-1 text-sm font-medium'>暂无通知</p>
                <p className='text-xs text-muted-foreground'>
                  收到新消息时会在此处显示
                </p>
              </div>
            ) : (
              <div className='py-1'>
                {notifications.map((notification, index) => {
                  const config =
                    categoryConfig[notification.notification_type] ||
                    categoryConfig.order
                  const IconComponent = config.icon
                  const isMessageRead = isRead(notification.id)

                  return (
                    <div key={notification.id}>
                      <div
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          'group relative cursor-pointer px-4 py-3 transition-all duration-200',
                          'hover:bg-muted/50',
                          isMessageRead && 'opacity-60',
                          !isMessageRead && 'bg-primary/[0.02]'
                        )}
                        style={{
                          animationDelay: `${index * 30}ms`,
                        }}
                      >
                        <div className='flex gap-3'>
                          <div
                            className={cn(
                              'relative flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md',
                              config.gradient
                            )}
                          >
                            <IconComponent className='size-5' />
                            {!isMessageRead && (
                              <span className='absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-white'>
                                <span className='absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-75' />
                                <span className='relative block size-2.5 rounded-full bg-blue-500' />
                              </span>
                            )}
                          </div>
                          <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
                            <div className='flex items-center justify-between gap-2'>
                              <div className='flex items-center gap-2'>
                                <p className='truncate text-sm leading-none font-medium'>
                                  {notification.title}
                                </p>
                                <Badge
                                  variant='outline'
                                  className='ml-1 shrink-0 text-[10px] font-normal'
                                >
                                  {config.label}
                                </Badge>
                              </div>
                              <p className='shrink-0 text-[10px] text-muted-foreground'>
                                {formatDistanceToNow(
                                  notification.timestamp * 1000,
                                  {
                                    addSuffix: true,
                                    locale: zhCN,
                                  }
                                )}
                              </p>
                            </div>
                            <p className='line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
                              {notification.content}
                            </p>
                          </div>
                        </div>
                        {!isMessageRead && (
                          <div className='absolute top-1/2 left-0 -translate-y-1/2'>
                            <div className='ml-1.5 size-1.5 rounded-full bg-primary' />
                          </div>
                        )}
                      </div>
                      {index < notifications.length - 1 && (
                        <Separator className='mx-4' />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <>
              <Separator className='my-2' />
              <div className='p-2'>
                <Button
                  variant='ghost'
                  className='w-full text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  onClick={() => setDrawerOpen(true)}
                >
                  查看全部通知
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>

      <NotificationDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        notification={selectedNotification}
      />
    </>
  )
}
