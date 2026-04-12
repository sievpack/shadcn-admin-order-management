// src/components/notifications/notification-drawer.tsx
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Check, Trash2 } from 'lucide-react'
import {
  useNotificationStore,
  type Notification,
} from '@/stores/notification-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationDetailDialog } from './notification-detail-dialog'

type FilterType = 'all' | 'unread'

export function NotificationDrawer() {
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    setDrawerOpen,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotificationStore()

  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsDialogOpen(true)
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  return (
    <>
      <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          className='flex w-full flex-col p-0 sm:max-w-[480px]'
          showCloseButton={false}
        >
          <SheetHeader className='border-b px-6 py-4'>
            <div className='flex items-center justify-between'>
              <SheetTitle>消息中心</SheetTitle>
              <div className='flex gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Check className='mr-1 h-4 w-4' />
                  全部已读
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearNotifications}
                  disabled={notifications.length === 0}
                >
                  <Trash2 className='mr-1 h-4 w-4' />
                  清空
                </Button>
              </div>
            </div>
          </SheetHeader>

          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as FilterType)}
          >
            <div className='border-b px-6'>
              <TabsList className='w-full justify-start'>
                <TabsTrigger value='all'>
                  全部 {notifications.length}
                </TabsTrigger>
                <TabsTrigger value='unread'>未读 {unreadCount}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={filter} className='m-0 flex-1'>
              <ScrollArea className='h-[calc(100vh-240px)]'>
                {filteredNotifications.length === 0 ? (
                  <div className='flex h-[200px] items-center justify-center text-sm text-muted-foreground'>
                    {filter === 'unread' ? '暂无未读通知' : '暂无通知'}
                  </div>
                ) : (
                  <div className='divide-y'>
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'flex cursor-pointer gap-3 px-6 py-4 hover:bg-muted/50',
                          !notification.read && 'bg-muted/20'
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className='flex flex-1 flex-col gap-1'>
                          <div className='flex items-center justify-between'>
                            <p className='font-medium'>{notification.title}</p>
                            <p className='text-xs text-muted-foreground'>
                              {formatDistanceToNow(notification.timestamp, {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </p>
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {notification.content}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className='mt-2 h-2 w-2 self-start rounded-full bg-blue-500' />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <Separator className='my-4' />
          <div className='p-4'>
            <Button
              variant='default'
              className='w-full'
              onClick={() => setDrawerOpen(false)}
            >
              关闭
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <NotificationDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        notification={selectedNotification}
      />
    </>
  )
}
