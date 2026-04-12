# 消息系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现基于 WebSocket 的实时消息通知系统，包括后端 WebSocket 服务、前端状态管理和 UI 组件

**Architecture:** 使用 FastAPI WebSocket + 内存连接管理器 + React Zustand 状态管理，前端展示包括顶部图标、浮动通知和消息中心抽屉

**Tech Stack:** 
- 后端: FastAPI WebSocket, Python
- 前端: React 19, Zustand, TypeScript

---

## 文件结构

```
backend/app/
├── api/
│   └── ws.py                          # WebSocket API 端点
├── services/
│   └── notification_service.py         # 消息通知服务（新建）
└── main.py                            # 注册 WebSocket 路由

src/
├── stores/
│   └── notification-store.ts           # Zustand 通知状态管理（新建）
├── hooks/
│   └── use-notification.ts             # WebSocket Hook（新建）
├── lib/
│   └── websocket.ts                    # WebSocket 客户端封装（新建）
├── components/
│   └── notifications/
│       ├── notification-icon.tsx       # 顶部图标（新建）
│       ├── notification-toast.tsx      # 浮动通知（新建）
│       ├── notification-drawer.tsx     # 消息中心抽屉（新建）
│       └── notification-provider.tsx    # 全局提供者（新建）
└── features/
    └── layout/                        # 集成到布局
```

---

## Task 1: 后端 WebSocket 服务

**Files:**
- Create: `backend/app/services/notification_service.py`
- Create: `backend/app/api/ws.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: 创建 notification_service.py - 连接管理器**

```python
# backend/app/services/notification_service.py
from typing import Optional
from fastapi import WebSocket


class ConnectionManager:
    """WebSocket 连接管理器"""
    
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """客户端连接"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        """客户端断开"""
        self.active_connections.pop(user_id, None)
    
    async def send_message(self, user_id: str, message: dict):
        """向指定用户发送消息"""
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)
    
    async def broadcast(self, message: dict):
        """广播消息给所有连接"""
        for connection in self.active_connections.values():
            await connection.send_json(message)


notification_manager = ConnectionManager()


def get_notification_manager() -> ConnectionManager:
    return notification_manager
```

- [ ] **Step 2: 创建 ws.py - WebSocket API 端点**

```python
# backend/app/api/ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.services.notification_service import get_notification_manager
from app.api.auth import get_current_active_user
from app.db.database import get_db_jns
from jose import jwt, JWTError
from sqlalchemy.orm import Session

router = APIRouter()


@router.websocket("/notifications")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    """WebSocket 通知端点"""
    manager = get_notification_manager()
    
    # 解析 token 获取用户ID
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
    except JWTError:
        await websocket.close(code=4001)
        return
    
    # 建立连接
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(user_id)
```

- [ ] **Step 3: 注册 WebSocket 路由到 main.py**

查看 main.py 找到注册路由的位置，添加:
```python
from app.api.ws import router as ws_router
app.include_router(ws_router, prefix="/ws")
```

---

## Task 2: 后端事件触发集成

**Files:**
- Modify: `backend/app/services/order_service.py`
- Modify: `backend/app/services/production_service.py`

- [ ] **Step 1: 在 order_service.py 添加消息触发**

在 `mark_shipped` 方法中添加:
```python
from app.services.notification_service import get_notification_manager

def mark_shipped(self, db: Session, order_id: int, **kwargs):
    # ... 原有代码 ...
    result = self.repository.mark_shipped(db, order_id, **kwargs)
    
    # 触发通知
    manager = get_notification_manager()
    notification = {
        "type": "notification",
        "payload": {
            "type": "order",
            "title": "订单已发货",
            "content": f"订单 {result.订单编号} 已发货",
            "timestamp": int(datetime.now().timestamp())
        }
    }
    # 发送给所有用户（或指定用户）
    await manager.broadcast(notification)
    
    return result
```

- [ ] **Step 2: 在 production_service.py 添加消息触发**

在生产计划/工单状态变更方法中添加类似的通知触发代码

---

## Task 3: 前端 Zustand Store

**Files:**
- Create: `src/stores/notification-store.ts`

- [ ] **Step 1: 创建 notification-store.ts**

```typescript
// src/stores/notification-store.ts
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
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
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
      const notification = state.notifications.find(n => n.id === id)
      if (!notification || notification.read) return state
      
      return {
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    })
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
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
      toasts: state.toasts.filter(t => t.id !== id),
    }))
  },
}))
```

---

## Task 4: 前端 WebSocket Hook

**Files:**
- Create: `src/hooks/use-notification.ts`
- Create: `src/lib/websocket.ts`

- [ ] **Step 1: 创建 websocket.ts - WebSocket 客户端封装**

```typescript
// src/lib/websocket.ts
type MessageHandler = (data: any) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string = ''
  private token: string = ''
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectInterval: number = 3000
  private handlers: Set<MessageHandler> = new Set()
  private onStatusChange: ((connected: boolean) => void) | null = null
  
  connect(url: string, token: string) {
    this.url = url
    this.token = token
    this.createConnection()
  }
  
  private createConnection() {
    if (this.ws) {
      this.ws.close()
    }
    
    const fullUrl = `${this.url}?token=${this.token}`
    this.ws = new WebSocket(fullUrl)
    
    this.ws.onopen = () => {
      this.onStatusChange?.(true)
    }
    
    this.ws.onclose = () => {
      this.onStatusChange?.(false)
      this.scheduleReconnect()
    }
    
    this.ws.onerror = () => {
      this.ws?.close()
    }
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handlers.forEach(handler => handler(data))
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e)
      }
    }
  }
  
  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.reconnectTimer = setTimeout(() => {
      this.createConnection()
    }, this.reconnectInterval)
  }
  
  send(data: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    }
  }
  
  onMessage(handler: MessageHandler) {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }
  
  setOnStatusChange(callback: (connected: boolean) => void) {
    this.onStatusChange = callback
  }
  
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.ws?.close()
  }
}

export const wsClient = new WebSocketClient()
```

- [ ] **Step 2: 创建 use-notification.ts - WebSocket Hook**

```typescript
// src/hooks/use-notification.ts
import { useEffect } from 'react'
import { wsClient } from '@/lib/websocket'
import { useNotificationStore } from '@/stores/notification-store'
import { useAuthStore } from '@/stores/auth-store'

export function useNotificationWebSocket() {
  const { addNotification, setWsConnected } = useNotificationStore()
  const { auth } = useAuthStore()
  
  useEffect(() => {
    if (!auth.accessToken) return
    
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications`
    
    wsClient.setOnStatusChange(setWsConnected)
    
    wsClient.connect(wsUrl, auth.accessToken)
    
    const unsubscribe = wsClient.onMessage((data) => {
      if (data.type === 'notification' && data.payload) {
        addNotification(data.payload)
      }
    })
    
    // 心跳
    const heartbeat = setInterval(() => {
      wsClient.send('ping')
    }, 30000)
    
    return () => {
      unsubscribe()
      clearInterval(heartbeat)
    }
  }, [auth.accessToken, addNotification, setWsConnected])
}
```

---

## Task 5: NotificationIcon 组件

**Files:**
- Create: `src/components/notifications/notification-icon.tsx`

- [ ] **Step 1: 创建 notification-icon.tsx**

```tsx
// src/components/notifications/notification-icon.tsx
import { Bell, BellOff } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification-store'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns'

export function NotificationIcon() {
  const {
    notifications,
    unreadCount,
    wsConnected,
    setDrawerOpen,
    markAsRead,
  } = useNotificationStore()
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {wsConnected ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-medium">通知</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={() => setDrawerOpen(true)}
            >
              查看全部
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              暂无通知
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer',
                    !notification.read && 'bg-muted/30'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.timestamp, {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
```

---

## Task 6: NotificationDrawer 组件

**Files:**
- Create: `src/components/notifications/notification-drawer.tsx`

- [ ] **Step 1: 创建 notification-drawer.tsx**

```tsx
// src/components/notifications/notification-drawer.tsx
import { useState } from 'react'
import { X, Check, Trash2 } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification-store'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns'

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
  
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications
  
  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full sm:max-w-[480px] p-0">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle>消息中心</SheetTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="mr-1 h-4 w-4" />
                全部已读
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                disabled={notifications.length === 0}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                清空
              </Button>
            </div>
          </div>
        </SheetHeader>
        
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <div className="border-b px-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all">
                全部 {notifications.length}
              </TabsTrigger>
              <TabsTrigger value="unread">
                未读 {unreadCount}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={filter} className="m-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {filteredNotifications.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  {filter === 'unread' ? '暂无未读通知' : '暂无通知'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex gap-3 px-6 py-4 hover:bg-muted/50 cursor-pointer',
                        !notification.read && 'bg-muted/20'
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.content}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 self-start mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
```

---

## Task 7: NotificationToast 组件

**Files:**
- Create: `src/components/notifications/notification-toast.tsx`

- [ ] **Step 1: 创建 notification-toast.tsx**

```tsx
// src/components/notifications/notification-toast.tsx
import { X } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NotificationToast() {
  const { toasts, removeToast } = useNotificationStore()
  
  if (toasts.length === 0) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border bg-background p-4 shadow-lg',
            'animate-in slide-in-from-bottom-5 fade-in-0',
            'min-w-[300px] max-w-[400px]'
          )}
        >
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{toast.title}</p>
            <p className="text-xs text-muted-foreground">{toast.content}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => removeToast(toast.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
```

---

## Task 8: NotificationProvider 组件

**Files:**
- Create: `src/components/notifications/notification-provider.tsx`

- [ ] **Step 1: 创建 notification-provider.tsx**

```tsx
// src/components/notifications/notification-provider.tsx
import { useNotificationWebSocket } from '@/hooks/use-notification'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useNotificationWebSocket()
  
  return <>{children}</>
}
```

---

## Task 9: 集成到 Layout

**Files:**
- Modify: `src/features/layout/index.tsx` 或 `src/app.tsx` (查找布局组件位置)

- [ ] **Step 1: 在布局中集成 NotificationProvider**

在根布局或 Header 组件中添加:
```tsx
import { NotificationProvider } from '@/components/notifications/notification-provider'
import { NotificationIcon } from '@/components/notifications/notification-icon'
import { NotificationDrawer } from '@/components/notifications/notification-drawer'
import { NotificationToast } from '@/components/notifications/notification-toast'

// 在 Header 中添加
<NotificationIcon />

// 在布局底部添加
<NotificationProvider />
<NotificationDrawer />
<NotificationToast />
```

首先需要找到布局组件的位置

---

## Task 10: 验证测试

**Files:**
- 测试 WebSocket 连接
- 测试订单发货触发通知
- 测试 UI 组件显示

- [ ] **Step 1: 验证 WebSocket 连接**

启动后端并检查 WebSocket 端点是否可访问

- [ ] **Step 2: 验证完整流程**

1. 登录系统
2. 在另一个浏览器/标签页打开系统
3. 在一个浏览器中进行订单发货操作
4. 检查另一个浏览器是否收到通知
5. 检查通知图标、浮动通知、消息中心是否正常工作
