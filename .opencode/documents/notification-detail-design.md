# 通知详情弹窗设计方案

**日期**: 2026-04-11
**状态**: 已批准

---

## 1. 概述

扩展当前的通知系统，实现：
- Redis 存储通知消息（30天过期）
- 前端分页加载历史消息
- Toast 点击打开详情 Modal
- 消息分类显示（Badge）
- 点击 Toast 自动标记已读

---

## 2. 通知类型

| 类型 | 说明 | 详情组件 |
|------|------|---------|
| order_shipped | 订单发货 | `<OrderShippedDetailDialog />` |
| order_created | 新增订单 | `<OrderCreatedDetailDialog />` |

---

## 3. 数据结构

### 3.1 通知消息结构（Redis + 前端）

```python
# 后端 Redis 存储
notification = {
    "id": "uuid",
    "type": "order_shipped",      # 消息类型
    "title": "订单已发货",
    "content": "订单 DH-20260101-123456 已发货",
    "detail": {                    # 详情数据（JSON存储）
        "发货单号": "SF123456",
        "快递单号": "SF123456789",
        "发货日期": "2026-04-11",
        "客户名称": "XXX公司",
        "发货总金额": 10000.00,
        "订单分项": [...]
    },
    "user_id": 1,
    "read": False,
    "created_at": "2026-04-11T10:00:00"
}
```

### 3.2 前端 Notification 接口

```typescript
interface Notification {
  id: string
  type: 'order_shipped' | 'order_created' | 'order' | 'production'
  title: string
  content: string
  timestamp: number
  read: boolean
  detail?: OrderShippedDetail | OrderCreatedDetail
}
```

---

## 4. 后端设计

### 4.1 Redis 存储策略

- Key: `notifications:{user_id}`
- Type: Sorted Set（按时间戳排序）
- 过期时间: 30 天
- 分页: ZREVRANGE 获取指定范围

### 4.2 新增文件

| 文件 | 说明 |
|------|------|
| `app/services/notification_service.py` | Redis 通知服务 |
| `app/api/notification.py` | 通知 API 路由 |

### 4.3 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/notifications` | 获取历史消息（分页） |
| POST | `/notifications/mark-read` | 标记单条已读 |
| POST | `/notifications/mark-all-read` | 标记全部已读 |

### 4.4 WebSocket 改进

- 推送新消息时，同时存储到 Redis
- 消息格式增加 `detail` 字段

---

## 5. 前端设计

### 5.1 组件结构

```
src/components/notifications/
├── notification-toast.tsx      # Toast（点击打开详情）
├── notification-drawer.tsx     # 消息中心 Drawer（分类 + 分页）
├── notification-detail-dialog.tsx  # 详情弹窗入口
├── order-shipped-detail-dialog.tsx  # 发货详情
└── order-created-detail-dialog.tsx  # 新增订单详情
```

### 5.2 Notification Store 扩展

```typescript
interface NotificationState {
  // 现有字段...
  notifications: Notification[]
  
  // 新增
  fetchNotifications: (page: number) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}
```

### 5.3 Toast 交互流程

```
用户收到通知
    ↓
显示 Toast（3秒后自动消失）
    ↓
用户点击 Toast
    ↓
标记消息已读（后端API）
    ↓
打开详情 Modal
    ↓
Drawer 中该消息蓝点消失
```

### 5.4 Drawer 布局

```
┌─────────────────────────────┐
│ 消息中心                    │
├─────────────────────────────┤
│ [全部] [订单] [发货] [生产] │  ← 分类 Filter
├─────────────────────────────┤
│ ● 订单已发货  3分钟前  [订单]│  ← Badge 分类
│   订单 DH-xxx 已发货       │
├─────────────────────────────┤
│   订单已创建  10分钟前 [订单]│
│   新增订单 xxx             │
├─────────────────────────────┤
│         加载更多...          │
├─────────────────────────────┤
│     [全部已读]  ← 只在有待处理消息时显示  │
└─────────────────────────────┘
```

---

## 6. 实现任务分解

### 6.1 后端任务

- [ ] 创建 `notification_service.py`
  - Redis 连接配置
  - 保存通知到 Redis
  - 获取历史通知（分页）
  - 标记已读
- [ ] 创建 `notification.py` API
  - GET `/notifications`
  - POST `/notifications/mark-read`
  - POST `/notifications/mark-all-read`
- [ ] 修改 `ws.py`
  - 发送消息时存储到 Redis

### 6.2 前端任务

- [ ] 扩展 `notification-store.ts`
  - 添加分页加载
  - 添加 markAsRead API 调用
  - 添加 markAllAsRead API 调用
- [ ] 创建 `notification-api.ts`
  - API 调用封装
- [ ] 修改 `notification-toast.tsx`
  - 点击事件处理
  - 打开详情 Modal
- [ ] 创建详情弹窗组件
  - `order-shipped-detail-dialog.tsx`
  - `order-created-detail-dialog.tsx`
- [ ] 修改 `notification-drawer.tsx`
  - 分类 Filter（Badge）
  - 分页加载
  - 全部已读按钮

---

## 7. 待扩展

- 其他通知类型（生产报工、订单审核等）
- 通知设置（用户偏好）
- 消息中心搜索功能
