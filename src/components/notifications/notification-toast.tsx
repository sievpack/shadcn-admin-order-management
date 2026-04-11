// src/components/notifications/notification-toast.tsx
import { X } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function NotificationToast() {
  const {
    toasts,
    removeToast,
    markAsRead,
    setDetailNotification,
    setDetailDialogOpen,
  } = useNotificationStore()

  if (toasts.length === 0) return null

  const handleToastClick = (toast: (typeof toasts)[0]) => {
    if (!toast.read) {
      markAsRead(toast.id)
    }
    setDetailNotification(toast)
    setDetailDialogOpen(true)
    removeToast(toast.id)
  }

  return (
    <div className='fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => handleToastClick(toast)}
          className={cn(
            'flex items-start gap-3 rounded-lg border bg-background p-4 shadow-lg',
            'animate-in fade-in-0 slide-in-from-top-5',
            'max-w-[400px] min-w-[300px]',
            'cursor-pointer hover:bg-muted/50'
          )}
        >
          <div className='flex-1 space-y-1'>
            <p className='text-sm font-medium'>{toast.title}</p>
            <p className='text-xs text-muted-foreground'>{toast.content}</p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={(e) => {
              e.stopPropagation()
              removeToast(toast.id)
            }}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      ))}
    </div>
  )
}
