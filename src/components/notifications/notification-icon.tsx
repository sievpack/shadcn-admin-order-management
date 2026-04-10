// src/components/notifications/notification-icon.tsx
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Bell, BellOff } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

export function NotificationIcon() {
  const { notifications, unreadCount, wsConnected, setDrawerOpen, markAsRead } =
    useNotificationStore()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          {wsConnected ? (
            <Bell className='h-5 w-5' />
          ) : (
            <BellOff className='h-5 w-5 text-muted-foreground' />
          )}
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-[380px] p-0'>
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <h4 className='font-medium'>通知</h4>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-auto p-0 text-xs text-muted-foreground'
              onClick={() => setDrawerOpen(true)}
            >
              查看全部
            </Button>
          )}
        </div>
        <ScrollArea className='h-[300px]'>
          {notifications.length === 0 ? (
            <div className='flex h-[200px] items-center justify-center text-sm text-muted-foreground'>
              暂无通知
            </div>
          ) : (
            <div className='divide-y'>
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex cursor-pointer gap-3 px-4 py-3 hover:bg-muted/50',
                    !notification.read && 'bg-muted/30'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium'>{notification.title}</p>
                    <p className='text-xs text-muted-foreground'>
                      {notification.content}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {formatDistanceToNow(notification.timestamp, {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className='h-2 w-2 rounded-full bg-blue-500' />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
