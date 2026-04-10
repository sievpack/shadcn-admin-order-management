import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useNotificationStore } from '@/stores/notification-store'
import { wsClient } from '@/lib/websocket'

const WS_URL =
  import.meta.env.VITE_WS_URL || `ws://localhost:8000/ws/notifications`

export function useNotificationWebSocket() {
  const { addNotification, setWsConnected } = useNotificationStore()
  const { auth } = useAuthStore()

  useEffect(() => {
    if (!auth.accessToken) return

    wsClient.setOnStatusChange(setWsConnected)

    wsClient.connect(WS_URL, auth.accessToken)

    const unsubscribe = wsClient.onMessage((data) => {
      if (data.type === 'notification' && data.payload) {
        addNotification(data.payload)
      }
    })

    const heartbeat = setInterval(() => {
      wsClient.send('ping')
    }, 30000)

    return () => {
      unsubscribe()
      clearInterval(heartbeat)
      wsClient.disconnect()
    }
  }, [auth.accessToken, addNotification, setWsConnected])
}
