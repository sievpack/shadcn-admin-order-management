import type { Notification } from '@/stores/notification-store'
import { api } from '@/lib/api'

interface NotificationListResponse {
  code: number
  msg: string
  data: {
    list: Notification[]
    total: number
    page: number
    page_size: number
  }
}

interface MarkReadResponse {
  code: number
  msg: string
}

interface UnreadCountResponse {
  code: number
  data: number
}

export const notificationAPI = {
  getNotifications: async (page = 1, pageSize = 20) => {
    const response = await api.get<NotificationListResponse>(
      `/notifications?page=${page}&page_size=${pageSize}`
    )
    return response.data
  },

  markRead: async (notificationId: string) => {
    const response = await api.post<MarkReadResponse>(
      `/notifications/mark-read`,
      { notification_id: notificationId }
    )
    return response.data
  },

  markAllRead: async () => {
    const response = await api.post<MarkReadResponse>(
      `/notifications/mark-all-read`
    )
    return response.data
  },

  getUnreadCount: async () => {
    const response = await api.get<UnreadCountResponse>(
      `/notifications/unread-count`
    )
    return response.data
  },
}
