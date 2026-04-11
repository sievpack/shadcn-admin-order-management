import { create } from 'zustand'

export interface Notification {
  id: string
  notification_type: string
  title: string
  content: string
  timestamp: number
  detail_id?: number
  detail_type?: string
  detail?: any
  read?: boolean
}

interface NotificationState {
  toasts: Notification[]
  notifications: Notification[]
  readIds: Set<string>
  isDrawerOpen: boolean
  wsConnected: boolean

  addToast: (notification: Notification) => void
  removeToast: (id: string) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setNotifications: (notifications: Notification[]) => void
  setDrawerOpen: (open: boolean) => void
  setWsConnected: (connected: boolean) => void
  markRead: (id: string) => void
  markAllRead: () => void
  isRead: (id: string) => boolean
  setReadIds: (ids: string[]) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  toasts: [],
  notifications: [],
  readIds: new Set<string>(),
  isDrawerOpen: false,
  wsConnected: false,

  addToast: (notification) => {
    const id =
      notification.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    // WebSocket payload 中 type 字段映射到 notification_type
    const newNotification: Notification = {
      ...notification,
      id,
      notification_type: notification.notification_type || notification.type,
    }

    set((state) => ({
      toasts: [...state.toasts, newNotification],
      notifications: [newNotification, ...state.notifications],
    }))

    setTimeout(() => {
      get().removeToast(id)
    }, 8000)
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  },

  setNotifications: (notifications) => {
    set({ notifications })
  },

  setDrawerOpen: (open) => {
    set({ isDrawerOpen: open })
  },

  setWsConnected: (connected) => {
    set({ wsConnected: connected })
  },

  markRead: (id) => {
    set((state) => {
      const newReadIds = new Set(state.readIds)
      newReadIds.add(id)
      return { readIds: newReadIds }
    })
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    )
    set({ notifications })
  },

  markAllRead: () => {
    const allIds = get().notifications.map((n) => n.id)
    set({ readIds: new Set(allIds) })
    const notifications = get().notifications.map((n) => ({ ...n, read: true }))
    set({ notifications })
  },

  isRead: (id) => {
    return get().readIds.has(id)
  },

  setReadIds: (ids) => {
    set({ readIds: new Set(ids) })
  },
}))
