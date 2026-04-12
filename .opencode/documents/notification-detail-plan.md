# 通知详情弹窗实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现通知详情弹窗功能，支持 Redis 存储、分页加载、Toast 点击打开详情

**Architecture:** 前后端分离架构，后端用 Redis 存储通知消息（30天过期），前端通过 API 获取历史消息，WebSocket 实时推送新消息

**Tech Stack:** 
- 后端: Python/FastAPI, Redis (redis-py)
- 前端: React/Zustand, TanStack Query

---

## 文件结构

```
backend/app/
├── services/
│   └── notification_service.py    # Redis 通知服务
├── api/
│   └── notification.py             # 通知 API 路由

src/
├── lib/
│   └── api/
│       └── notification-api.ts     # 通知 API 调用
├── stores/
│   └── notification-store.ts       # 通知状态管理
└── components/notifications/
    ├── notification-toast.tsx      # Toast（点击打开详情）
    ├── notification-drawer.tsx     # 消息中心 Drawer
    ├── order-shipped-detail-dialog.tsx  # 发货详情弹窗
    └── order-created-detail-dialog.tsx  # 新增订单详情弹窗
```

---

## 实施任务

### Task 1: 后端 Redis 通知服务

**Files:**
- Create: `backend/app/services/notification_service.py`
- Modify: `backend/app/services/__init__.py`

- [ ] **Step 1: 创建 notification_service.py**

```python
# backend/app/services/notification_service.py
import json
import redis
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session

# Redis 配置
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB = 0
NOTIFICATION_TTL = 30 * 24 * 60 * 60  # 30天

class NotificationService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            decode_responses=True
        )

    def _get_key(self, user_id: int) -> str:
        return f"notifications:{user_id}"

    def save(self, user_id: int, notification: dict) -> str:
        """保存通知到 Redis"""
        key = self._get_key(user_id)
        notification['created_at'] = datetime.now().isoformat()
        notification_id = notification.get('id', f"{user_id}:{datetime.now().timestamp()}")
        notification['id'] = notification_id
        
        # 使用 Sorted Set 存储，score 为时间戳
        self.redis_client.zadd(key, {json.dumps(notification): datetime.now().timestamp()})
        # 设置过期时间
        self.redis_client.expire(key, NOTIFICATION_TTL)
        return notification_id

    def get_list(self, user_id: int, page: int = 1, page_size: int = 20) -> List[dict]:
        """分页获取通知列表"""
        key = self._get_key(user_id)
        start = (page - 1) * page_size
        end = start + page_size - 1
        
        # 按时间倒序获取
        results = self.redis_client.zrevrange(key, start, end)
        notifications = [json.loads(r) for r in results]
        
        # 获取总数
        total = self.redis_client.zcard(key)
        
        return notifications, total

    def mark_read(self, user_id: int, notification_id: str) -> bool:
        """标记单条已读"""
        key = self._get_key(user_id)
        # 获取所有通知
        results = self.redis_client.zrange(key, 0, -1)
        for r in results:
            notification = json.loads(r)
            if notification.get('id') == notification_id:
                notification['read'] = True
                # 更新通知
                score = self.redis_client.zscore(key, r)
                self.redis_client.zrem(key, r)
                self.redis_client.zadd(key, {json.dumps(notification): score})
                return True
        return False

    def mark_all_read(self, user_id: int) -> int:
        """标记全部已读"""
        key = self._get_key(user_id)
        results = self.redis_client.zrange(key, 0, -1)
        count = 0
        for r in results:
            notification = json.loads(r)
            if not notification.get('read', False):
                notification['read'] = True
                score = self.redis_client.zscore(key, r)
                self.redis_client.zrem(key, r)
                self.redis_client.zadd(key, {json.dumps(notification): score})
                count += 1
        return count

    def get_unread_count(self, user_id: int) -> int:
        """获取未读数量"""
        key = self._get_key(user_id)
        results = self.redis_client.zrange(key, 0, -1)
        return sum(1 for r in results if not json.loads(r).get('read', False))


notification_service = NotificationService()
```

- [ ] **Step 2: 更新 __init__.py 导出**

```python
# backend/app/services/__init__.py
from app.services.notification_service import notification_service
__all__ = [..., "notification_service"]
```

- [ ] **Step 3: 验证导入**

```bash
cd backend && python -c "from app.services.notification_service import notification_service; print('OK')"
```

- [ ] **Step 4: 提交**

```bash
git add backend/app/services/notification_service.py backend/app/services/__init__.py
git commit -m "feat: 添加 Redis 通知服务"
```

---

### Task 2: 后端通知 API

**Files:**
- Create: `backend/app/api/notification.py`
- Modify: `backend/app/main.py` (注册路由)

- [ ] **Step 1: 创建 notification.py API**

```python
# backend/app/api/notification.py
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.notification_service import notification_service

router = APIRouter()


class MarkReadRequest(BaseModel):
    notification_id: str


@router.get("")
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user)
):
    """获取历史通知（分页）"""
    notifications, total = notification_service.get_list(
        current_user.id, page, page_size
    )
    return {
        "code": 0,
        "msg": "success",
        "data": {
            "list": notifications,
            "total": total,
            "page": page,
            "page_size": page_size
        }
    }


@router.post("/mark-read")
async def mark_notification_read(
    req: MarkReadRequest,
    current_user: User = Depends(get_current_active_user)
):
    """标记单条已读"""
    success = notification_service.mark_read(current_user.id, req.notification_id)
    return {"code": 0 if success else 1, "msg": "success" if success else "notification not found"}


@router.post("/mark-all-read")
async def mark_all_read(
    current_user: User = Depends(get_current_active_user)
):
    """标记全部已读"""
    count = notification_service.mark_all_read(current_user.id)
    return {"code": 0, "msg": f"marked {count} notifications as read"}


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_active_user)
):
    """获取未读数量"""
    count = notification_service.get_unread_count(current_user.id)
    return {"code": 0, "msg": "success", "data": count}
```

- [ ] **Step 2: 注册路由到 main.py**

```python
# backend/app/main.py 添加
from app.api.notification import router as notification_router

app.include_router(notification_router, prefix="/api/notifications", tags=["notifications"])
```

- [ ] **Step 3: 验证导入**

```bash
cd backend && python -c "from app.api.notification import router; print('notification router OK')"
```

- [ ] **Step 4: 提交**

```bash
git add backend/app/api/notification.py backend/app/main.py
git commit -m "feat: 添加通知 API 接口"
```

---

### Task 3: 修改 WebSocket 存储通知到 Redis

**Files:**
- Modify: `backend/app/api/ws.py`

- [ ] **Step 1: 查看当前 ws.py 结构**

```bash
cat backend/app/api/ws.py
```

- [ ] **Step 2: 修改发送消息时存储到 Redis**

在 WebSocket 发送消息的回调中添加：
```python
from app.services.notification_service import notification_service

# 在发送消息的代码块中添加：
# 解析消息，获取 user_id 和 notification 数据
notification_data = json.loads(message)
user_id = notification_data.get('user_id')
if user_id and notification_data.get('type'):
    # 存储到 Redis
    notification_service.save(user_id, notification_data)
```

- [ ] **Step 3: 验证**

```bash
cd backend && python -c "from app.api.ws import router; print('ws router OK')"
```

- [ ] **Step 4: 提交**

```bash
git add backend/app/api/ws.py
git commit -m "feat: WebSocket 发送时存储通知到 Redis"
```

---

### Task 4: 前端通知 API 调用

**Files:**
- Create: `src/lib/api/notification-api.ts`

- [ ] **Step 1: 创建 notification-api.ts**

```typescript
// src/lib/api/notification-api.ts
import { api } from './api'
import type { Notification } from '@/stores/notification-store'

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
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/api/notification-api.ts
git commit -m "feat: 添加通知 API 调用封装"
```

---

### Task 5: 扩展通知 Store

**Files:**
- Modify: `src/stores/notification-store.ts`

- [ ] **Step 1: 查看当前 store 结构并修改**

```typescript
// src/stores/notification-store.ts
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
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
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
```

- [ ] **Step 2: 提交**

```bash
git add src/stores/notification-store.ts
git commit -m "feat: 扩展通知 Store 支持分页和详情"
```

---

### Task 6: 修改 Toast 支持点击打开详情

**Files:**
- Modify: `src/components/notifications/notification-toast.tsx`

- [ ] **Step 1: 修改 notification-toast.tsx**

```typescript
// src/components/notifications/notification-toast.tsx
import { X } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function NotificationToast() {
  const { toasts, removeToast, markAsRead, setDetailNotification, setDetailDialogOpen } =
    useNotificationStore()

  if (toasts.length === 0) return null

  const handleToastClick = (toast: (typeof toasts)[0]) => {
    // 标记已读
    if (!toast.read) {
      markAsRead(toast.id)
    }
    // 打开详情弹窗
    setDetailNotification(toast)
    setDetailDialogOpen(true)
    // 移除 toast
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
```

- [ ] **Step 2: 提交**

```bash
git add src/components/notifications/notification-toast.tsx
git commit -m "feat: Toast 支持点击打开详情弹窗"
```

---

### Task 7: 创建详情弹窗组件

**Files:**
- Create: `src/components/notifications/order-shipped-detail-dialog.tsx`
- Create: `src/components/notifications/order-created-detail-dialog.tsx`

- [ ] **Step 1: 创建 order-shipped-detail-dialog.tsx**

```typescript
// src/components/notifications/order-shipped-detail-dialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useNotificationStore } from '@/stores/notification-store'

export function OrderShippedDetailDialog() {
  const { isDetailDialogOpen, detailNotification, setDetailDialogOpen } =
    useNotificationStore()

  if (!detailNotification || detailNotification.type !== 'order_shipped') {
    return null
  }

  const detail = detailNotification.detail || {}

  return (
    <Dialog open={isDetailDialogOpen} onOpenChange={setDetailDialogOpen}>
      <DialogContent className='max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {detailNotification.title}
            <Badge variant='outline'>发货</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-muted-foreground'>发货单号</p>
              <p className='font-medium'>{detail.发货单号 || '-'}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>快递单号</p>
              <p className='font-medium'>{detail.快递单号 || '-'}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>发货日期</p>
              <p className='font-medium'>{detail.发货日期 || '-'}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>客户名称</p>
              <p className='font-medium'>{detail.客户名称 || '-'}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>发货总金额</p>
              <p className='font-medium'>
                {detail.发货总金额 != null ? `¥${Number(detail.发货总金额).toFixed(2)}` : '-'}
              </p>
            </div>
          </div>

          {detail.订单分项 && detail.订单分项.length > 0 && (
            <div>
              <p className='mb-2 text-sm text-muted-foreground'>订单分项</p>
              <div className='max-h-[200px] overflow-auto rounded border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/50'>
                    <tr>
                      <th className='px-2 py-1 text-left'>产品名称</th>
                      <th className='px-2 py-1 text-left'>规格</th>
                      <th className='px-2 py-1 text-right'>数量</th>
                      <th className='px-2 py-1 text-right'>单价</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {detail.订单分项.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className='px-2 py-1'>{item.产品名称 || '-'}</td>
                        <td className='px-2 py-1'>{item.规格 || '-'}</td>
                        <td className='px-2 py-1 text-right'>{item.数量 || 0}</td>
                        <td className='px-2 py-1 text-right'>
                          {item.单价 != null ? `¥${Number(item.单价).toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: 创建 order-created-detail-dialog.tsx**

```typescript
// src/components/notifications/order-created-detail-dialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useNotificationStore } from '@/stores/notification-store'

export function OrderCreatedDetailDialog() {
  const { isDetailDialogOpen, detailNotification, setDetailDialogOpen } =
    useNotificationStore()

  if (!detailNotification || detailNotification.type !== 'order_created') {
    return null
  }

  const detail = detailNotification.detail || {}

  return (
    <Dialog open={isDetailDialogOpen} onOpenChange={setDetailDialogOpen}>
      <DialogContent className='max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {detailNotification.title}
            <Badge variant='outline'>订单</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-muted-foreground'>订单编号</p>
              <p className='font-medium'>{detail.订单编号 || '-'}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>客户名称</p>
              <p className='font-medium'>{detail.客户名称 || '-'}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>订单日期</p>
              <p className='font-medium'>{detail.订单日期 || '-'}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>交货日期</p>
              <p className='font-medium'>{detail.交货日期 || '-'}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>订单总金额</p>
              <p className='font-medium'>
                {detail.订单总金额 != null ? `¥${Number(detail.订单总金额).toFixed(2)}` : '-'}
              </p>
            </div>
          </div>

          {detail.订单分项 && detail.订单分项.length > 0 && (
            <div>
              <p className='mb-2 text-sm text-muted-foreground'>订单分项</p>
              <div className='max-h-[200px] overflow-auto rounded border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/50'>
                    <tr>
                      <th className='px-2 py-1 text-left'>产品名称</th>
                      <th className='px-2 py-1 text-left'>规格</th>
                      <th className='px-2 py-1 text-right'>数量</th>
                      <th className='px-2 py-1 text-right'>单价</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {detail.订单分项.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className='px-2 py-1'>{item.产品名称 || '-'}</td>
                        <td className='px-2 py-1'>{item.规格 || '-'}</td>
                        <td className='px-2 py-1 text-right'>{item.数量 || 0}</td>
                        <td className='px-2 py-1 text-right'>
                          {item.单价 != null ? `¥${Number(item.单价).toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/notifications/order-shipped-detail-dialog.tsx src/components/notifications/order-created-detail-dialog.tsx
git commit -m "feat: 添加订单发货和新增订单详情弹窗"
```

---

### Task 8: 修改消息中心 Drawer

**Files:**
- Modify: `src/components/notifications/notification-drawer.tsx`

- [ ] **Step 1: 查看 authenticated-layout.tsx 中如何引入组件**

确保详情弹窗组件在布局中被正确引入。

- [ ] **Step 2: 修改 notification-drawer.tsx**

主要改动：
1. 添加分类 Filter（Badge 样式）
2. 添加分页加载（滚动加载）
3. 全部已读按钮（有待处理消息时显示）

```typescript
// src/components/notifications/notification-drawer.tsx
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Check, Trash2, Loader2 } from 'lucide-react'
import { useNotificationStore } from '@/stores/notification-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type FilterType = 'all' | 'order_shipped' | 'order_created'

export function NotificationDrawer() {
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    setDrawerOpen,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    fetchNotifications,
    loadMore,
    hasMore,
    isLoading,
    setDetailNotification,
    setDetailDialogOpen,
  } = useNotificationStore()

  const [filter, setFilter] = useState<FilterType>('all')

  // 打开 Drawer 时加载历史消息
  useEffect(() => {
    if (isDrawerOpen) {
      fetchNotifications(true)
    }
  }, [isDrawerOpen])

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true
    return n.type === filter
  })

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    setDetailNotification(notification)
    setDetailDialogOpen(true)
  }

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className='w-full p-0 sm:max-w-[480px]'>
        <SheetHeader className='border-b px-6 py-4'>
          <div className='flex items-center justify-between'>
            <SheetTitle>消息中心</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={markAllAsRead}
              >
                <Check className='mr-1 h-4 w-4' />
                全部已读
              </Button>
            )}
          </div>
        </SheetHeader>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <div className='border-b px-6'>
            <TabsList className='w-full justify-start'>
              <TabsTrigger value='all'>全部</TabsTrigger>
              <TabsTrigger value='order_created'>
                订单 <Badge variant='secondary' className='ml-1'>订单</Badge>
              </TabsTrigger>
              <TabsTrigger value='order_shipped'>
                发货 <Badge variant='secondary' className='ml-1'>发货</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={filter} className='m-0'>
            <ScrollArea
              className='h-[calc(100vh-220px)]'
              onBottomReached={() => {
                if (hasMore && !isLoading) {
                  loadMore()
                }
              }}
            >
              {filteredNotifications.length === 0 ? (
                <div className='flex h-[200px] items-center justify-center text-sm text-muted-foreground'>
                  暂无通知
                </div>
              ) : (
                <div className='divide-y'>
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex cursor-pointer gap-3 px-6 py-4 hover:bg-muted/50',
                        !notification.read && 'bg-muted/20'
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className='flex-1 space-y-1'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <p className='font-medium'>{notification.title}</p>
                            <Badge
                              variant={
                                notification.type === 'order_shipped'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className='text-xs'
                            >
                              {notification.type === 'order_shipped'
                                ? '发货'
                                : '订单'}
                            </Badge>
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                          </p>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {notification.content}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className='mt-2 h-2 w-2 self-start rounded-full bg-blue-500' />
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className='flex items-center justify-center py-4'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      <span className='ml-2 text-sm text-muted-foreground'>
                        加载中...
                      </span>
                    </div>
                  )}
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

- [ ] **Step 3: 提交**

```bash
git add src/components/notifications/notification-drawer.tsx
git commit -m "feat: 消息中心支持分类筛选和分页加载"
```

---

### Task 9: 在布局中引入详情弹窗

**Files:**
- Modify: `src/components/layout/authenticated-layout.tsx`

- [ ] **Step 1: 查看当前 authenticated-layout.tsx**

```bash
cat src/components/layout/authenticated-layout.tsx
```

- [ ] **Step 2: 添加详情弹窗组件引入**

```typescript
// 添加引入
import { OrderShippedDetailDialog } from '@/components/notifications/order-shipped-detail-dialog'
import { OrderCreatedDetailDialog } from '@/components/notifications/order-created-detail-dialog'

// 在组件 return 中添加
// <NotificationDrawer />
<OrderShippedDetailDialog />
<OrderCreatedDetailDialog />
```

- [ ] **Step 3: 提交**

```bash
git add src/components/layout/authenticated-layout.tsx
git commit -m "feat: 引入通知详情弹窗组件"
```

---

### Task 10: 修改后端发货和新增订单通知

**Files:**
- Modify: `backend/app/services/order_service.py` (mark_shipped 方法)
- Modify: `backend/app/api/order/list.py` (create_order 方法)

- [ ] **Step 1: 查看 mark_shipped 方法当前实现**

需要确保推送的 WebSocket 消息包含 detail 字段。

- [ ] **Step 2: 修改 mark_shipped 通知消息**

```python
# 在 mark_shipped 方法中，修改 notification_msg
# 添加 detail 字段
notification_msg = {
    "type": "notification",
    "payload": {
        "type": "order_shipped",  # 改为具体类型
        "title": "订单已发货",
        "content": f"订单 {', '.join(order_nums)} 已发货，快递: {快递单号}",
        "detail": {
            "发货单号": 发货单号,
            "快递单号": 快递单号,
            "发货日期": datetime.now().strftime('%Y-%m-%d'),
            "客户名称": 客户名称,
            "发货总金额": total_amount,  # 需要计算
            "订单分项": [...]  # 需要查询
        },
        "timestamp": int(datetime.now().timestamp())
    }
}
```

- [ ] **Step 3: 修改 create_order 通知消息**

类似 mark_shipped，添加订单详情。

- [ ] **Step 4: 提交**

```bash
git add backend/app/services/order_service.py backend/app/api/order/list.py
git commit -m "feat: 完善发货和新增订单通知详情"
```

---

## 自检清单

- [ ] Spec coverage: 所有设计要求都有对应任务实现
- [ ] Placeholder scan: 无 TBD/TODO
- [ ] Type consistency: 前后端类型定义一致
- [ ] 测试：后端 API 测试、前端功能测试
