import { create } from 'zustand'

interface Notification {
  id: string
  type: 'order' | 'production'
  title: string
  content: string
  timestamp: number
  read: boolean
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isDrawerOpen: boolean
  wsConnected: boolean
  toasts: Notification[]

  // Actions
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  setDrawerOpen: (open: boolean) => void
  setWsConnected: (connected: boolean) => void
  removeToast: (id: string) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isDrawerOpen: false,
  wsConnected: false,
  toasts: [],

  addNotification: (notification) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false,
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 100),
      unreadCount: state.unreadCount + 1,
      toasts: [...state.toasts, newNotification],
    }))

    // 3秒后自动移除 toast
    setTimeout(() => {
      get().removeToast(id)
    }, 3000)
  },

  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      if (!notification || notification.read) return state

      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    })
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  setDrawerOpen: (open) => {
    set({ isDrawerOpen: open })
  },

  setWsConnected: (connected) => {
    set({ wsConnected: connected })
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))
