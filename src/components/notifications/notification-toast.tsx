// src/components/notifications/notification-toast.tsx
import { X } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function NotificationToast() {
  const { toasts, removeToast } = useNotificationStore()

  if (toasts.length === 0) return null

  return (
    <div className='fixed right-4 bottom-4 z-[100] flex flex-col gap-2'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border bg-background p-4 shadow-lg',
            'animate-in fade-in-0 slide-in-from-bottom-5',
            'max-w-[400px] min-w-[300px]'
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
            onClick={() => removeToast(toast.id)}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      ))}
    </div>
  )
}
