# 消息系统设计方案

**日期**: 2026-04-10
**状态**: 已批准
**方案**: 方案A - 轻量级实现

---

## 1. 概述

### 1.1 需求

- **用途**: 业务通知（订单状态变更 + 生产进度更新）
- **推送方式**: WebSocket 实时推送
- **数据存储**: 不需要数据库，只做实时推送
- **展示方式**: 顶部图标 + 浮动通知 + 消息中心
- **消息分类**: 不需要区分，统一展示
- **重连机制**: 自动重连

### 1.2 范围

前后端完整实现：
- 前端 UI + 状态管理
- 后端 WebSocket 服务 + 消息推送触发逻辑

---

## 2. 架构设计

### 2.1 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React)                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐     │
│  │ 顶部图标  │    │ 浮动通知  │    │   消息中心抽屉    │     │
│  │  (Bell)  │    │ (Toast)  │    │  (MessageDrawer) │     │
│  └────┬─────┘    └────┬─────┘    └────────┬─────────┘     │
│       │               │                    │                │
│       └───────────────┼────────────────────┘                │
│                       ▼                                     │
│              ┌────────────────┐                              │
│              │  Zustand Store │ ◄── 全局状态管理           │
│              └────────┬───────┘                              │
│                       │                                     │
│              ┌────────▼────────┐                            │
│              │ WebSocket Client │ ◄── 实时连接              │
│              └─────────────────┘                            │
└───────────────────────────┬─────────────────────────────────┘
                            │ WebSocket (ws://)
                            ▼
┌───────────────────────────────────────────────────────────┐
│                        后端 (FastAPI)                      │
│  ┌─────────────────────┐    ┌────────────────────────┐     │
│  │  WebSocket Endpoint │◄──►│   连接管理器 (内存)   │     │
│  │  /ws/notifications  │    │   管理所有客户端连接  │     │
│  └─────────────────────┘    └────────────────────────┘     │
│           ▲                                                 │
│           │                                                 │
│  ┌────────┴────────┐                                       │
│  │   业务事件触发    │ ◄── 订单状态变更、生产进度更新       │
│  │  (Event Emitter) │                                       │
│  └─────────────────┘                                       │
└───────────────────────────────────────────────────────────┘
```

---

## 3. 后端详细设计

### 3.1 WebSocket 连接管理

**位置**: `backend/app/services/notification_service.py`

```python
class ConnectionManager:
    """WebSocket 连接管理器"""
    
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}  # user_id -> WebSocket
    
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
```

### 3.2 WebSocket API 端点

**位置**: `backend/app/api/ws.py`

```python
@router.websocket("/notifications")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    """WebSocket 通知端点"""
    # 1. 验证token获取user_id
    user_id = await verify_token(token)
    if not user_id:
        await websocket.close(code=4001)
        return
    
    # 2. 建立连接
    await manager.connect(websocket, user_id)
    try:
        while True:
            # 3. 保持连接，接收心跳
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(user_id)
```

### 3.3 事件触发集成

**位置**: `backend/app/services/order_service.py`

```python
class OrderService:
    """订单服务 - 发货时触发通知"""
    
    def mark_shipped(self, db, order_id, **kwargs):
        result = self.repository.mark_shipped(db, order_id, **kwargs)
        
        # 触发 WebSocket 通知
        notification_service.send_order_notification(
            user_id=result.客户名称,  # 或实际的用户ID字段
            title="订单已发货",
            content=f"订单 {result.订单编号} 已发货"
        )
        return result
```

---

## 4. 前端详细设计

### 4.1 目录结构

```
src/
├── stores/
│   └── notification-store.ts      # Zustand 通知状态管理
├── hooks/
│   └── use-notification.ts       # WebSocket 连接 Hook
├── components/
│   └── notifications/
│       ├── notification-icon.tsx # 顶部铃铛图标
│       ├── notification-toast.tsx # 浮动通知组件
│       ├── notification-drawer.tsx # 消息中心抽屉
│       └── notification-provider.tsx # 全局状态提供者
├── lib/
│   └── websocket.ts              # WebSocket 客户端封装
```

### 4.2 Zustand Store

**位置**: `src/stores/notification-store.ts`

```typescript
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
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  setDrawerOpen: (open: boolean) => void
  setWsConnected: (connected: boolean) => void
}
```

### 4.3 WebSocket Hook

**位置**: `src/hooks/use-notification.ts`

```typescript
export function useNotificationWebSocket() {
  const { addNotification, setWsConnected } = useNotificationStore()
  
  useEffect(() => {
    const wsUrl = `ws://localhost:8000/ws/notifications?token=${getToken()}`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => setWsConnected(true)
    ws.onclose = () => {
      setWsConnected(false)
      // 自动重连
      setTimeout(() => reconnect(), 3000)
    }
    ws.onerror = () => ws.close()
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'notification') {
        addNotification(data.payload)
      }
    }
    
    return () => ws.close()
  }, [])
}
```

---

## 5. 组件 UI 设计

### 5.1 顶部通知图标

```
┌────────────────────────────────────────────────────────────┐
│  🔔 [通知]                              [用户] [设置]       │
└────────────────────────────────────────────────────────────┘
         │
         │ 点击
         ▼
┌─────────────────┐
│  🔔 通知 (3)    │  ← 红色圆点显示未读数
├─────────────────┤
│ 📦 订单已发货    │
│ 订单DH-001已发货│
│ 10:30          │
├─────────────────┤
│ 🔧 生产计划更新  │
│ 计划PP-002已开始│
│ 10:25          │
├─────────────────┤
│ 📦 订单已发货    │
│ 订单DH-002已发货│
│ 10:20          │
├─────────────────┤
│         查看全部  → │
└─────────────────┘
```

### 5.2 浮动通知 (右下角)

```
┌──────────────────────────────────┐
│  📦 订单已发货              [×] │
│  订单DH-001已发货                   │
│  2秒前                      │
└──────────────────────────────────┘
   ▲
   │ 3秒后自动消失
```

### 5.3 消息中心抽屉 (右侧滑出)

```
┌──────────────────────────────────────────┐
│  消息中心                          [×]  │
├──────────────────────────────────────────┤
│ [全部] [已读] [未读]    [全部标为已读]  │
├──────────────────────────────────────────┤
│                                          │
│ 📦 订单已发货                    10:30  │
│    订单DH-001已发货                       │
│    订单详情 →                             │
│                                          │
├──────────────────────────────────────────┤
│ 🔧 生产计划更新                    10:25  │
│    计划PP-002已开始执行                    │
│    计划详情 →                             │
│                                          │
└──────────────────────────────────────────┘
```

---

## 6. 实施计划

### 6.1 任务分解

| 顺序 | 任务 | 描述 |
|------|------|------|
| 1 | 后端 WebSocket 服务 | 实现连接管理器 + WebSocket 端点 |
| 2 | 后端事件触发集成 | 在订单/生产服务中集成消息触发 |
| 3 | 前端 Zustand Store | 通知状态管理 |
| 4 | 前端 WebSocket Hook | WebSocket 连接 + 自动重连 |
| 5 | NotificationIcon 组件 | 顶部图标 + 下拉列表 |
| 6 | NotificationDrawer 组件 | 消息中心抽屉 |
| 7 | NotificationToast 组件 | 浮动通知 |
| 8 | 集成到 Layout | 在全局布局中启用通知功能 |
| 9 | 测试验证 | 端到端测试 |

### 6.2 检查点

1. **后端完成** → 确认 WebSocket 连接成功
2. **前端 Store + Hook 完成** → 确认状态管理和连接正常
3. **组件完成** → 确认 UI 显示正确
4. **集成测试** → 模拟订单发货验证完整流程

---

## 7. 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 19 | 现有项目 |
| 状态管理 | Zustand | 现有项目已有 |
| WebSocket | 原生 WebSocket API | 轻量级实现 |
| 后端框架 | FastAPI | 现有项目 |
| 连接管理 | 内存 dict | 轻量级实现 |
