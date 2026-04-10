// src/components/notifications/notification-provider.tsx
import { useNotificationWebSocket } from '@/hooks/use-notification'

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useNotificationWebSocket()

  return <>{children}</>
}
