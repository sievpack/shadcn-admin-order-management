import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useNotificationStore } from '@/stores/notification-store'
import { wsClient } from '@/lib/websocket'

const WS_URL =
  import.meta.env.VITE_WS_URL || `ws://localhost:8000/ws/notifications`

async function fetchHistoryNotifications(token: string) {
  if (!token) return

  try {
    const response = await fetch('/api/notifications?page=1&page_size=5', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const result = await response.json()
    if (result.code === 0 && Array.isArray(result.data)) {
      // 后端返回 result.data 是数组，需要映射字段
      const notifications = result.data.map((item: any) => ({
        id: item.id,
        notification_type: item.type || item.notification_type,
        title: item.title,
        content: item.content,
        timestamp:
          item.timestamp ||
          (item.created_at
            ? new Date(item.created_at).getTime() / 1000
            : Date.now() / 1000),
        detail_id: item.detail_id,
        detail_type: item.detail_type,
        detail: item.detail,
        read: item.read,
      }))

      // 初始化已读状态
      const readIds = result.data
        .filter((item: any) => item.read === true)
        .map((item: any) => item.id)

      const { setNotifications, setReadIds } = useNotificationStore.getState()
      setNotifications(notifications)
      setReadIds(readIds)
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
  }
}

export function useNotificationWebSocket() {
  const { addToast, setWsConnected } = useNotificationStore()
  const { auth } = useAuthStore()

  useEffect(() => {
    if (!auth.accessToken) return

    wsClient.setOnStatusChange((connected) => {
      setWsConnected(connected)
      if (connected) {
        fetchHistoryNotifications(auth.accessToken!)
      }
    })

    wsClient.connect(WS_URL, auth.accessToken)

    const unsubscribe = wsClient.onMessage((data) => {
      if (data.type === 'notification' && data.payload) {
        addToast(data.payload)
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
  }, [auth.accessToken, addToast, setWsConnected])
}
