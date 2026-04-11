import { create } from 'zustand'
import { notificationAPI } from '@/lib/api/notification-api'

interface Notification {
  id: string
  type: 'order_shipped' | 'order_created' | 'order' | 'production'
  title: string
  content: string
  timestamp: number
  read: boolean
  detail?: any
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isDrawerOpen: boolean
  wsConnected: boolean
  toasts: Notification[]
  // 新增分页状态
  hasMore: boolean
  currentPage: number
  isLoading: boolean
  // 详情弹窗
  detailNotification: Notification | null
  isDetailDialogOpen: boolean

  // Actions
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearNotifications: () => void
  setDrawerOpen: (open: boolean) => void
  setWsConnected: (connected: boolean) => void
  removeToast: (id: string) => void
  // 新增
  fetchNotifications: (reset?: boolean) => Promise<void>
  loadMore: () => Promise<void>
  setDetailNotification: (notification: Notification | null) => void
  setDetailDialogOpen: (open: boolean) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isDrawerOpen: false,
  wsConnected: false,
  toasts: [],
  hasMore: false,
  currentPage: 1,
  isLoading: false,
  detailNotification: null,
  isDetailDialogOpen: false,

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

  markAsRead: async (id) => {
    try {
      await notificationAPI.markRead(id)
    } catch (e) {
      console.error('Failed to mark as read:', e)
    }
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

  markAllAsRead: async () => {
    try {
      await notificationAPI.markAllRead()
    } catch (e) {
      console.error('Failed to mark all as read:', e)
    }
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

  // 新增方法
  fetchNotifications: async (reset = false) => {
    const { isLoading, currentPage } = get()
    if (isLoading) return

    set({ isLoading: true })
    try {
      const page = reset ? 1 : currentPage
      const response = await notificationAPI.getNotifications(page)
      if (response.code === 0) {
        const { list, total, page: respPage } = response.data
        set((state) => ({
          notifications: reset ? list : [...state.notifications, ...list],
          hasMore: state.notifications.length < total,
          currentPage: respPage + 1,
        }))
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  loadMore: async () => {
    await get().fetchNotifications(false)
  },

  setDetailNotification: (notification) => {
    set({ detailNotification: notification })
  },

  setDetailDialogOpen: (open) => {
    set({ isDetailDialogOpen: open })
    if (!open) {
      set({ detailNotification: null })
    }
  },
}))
