# 消息通知系统开发文档

## 开发时间
2026-04-10

## 功能概述
基于 WebSocket 的实时消息通知系统，支持订单发货、生产进度等业务事件实时推送。

## 技术架构

### 后端架构
```
FastAPI WebSocket
├── notification_service.py  # WebSocket 连接管理器
├── ws.py                   # WebSocket API 端点
└── order_service.py        # 业务事件触发 WebSocket 广播
```

### 前端架构
```
React + Zustand + TanStack Query
├── notification-store.ts   # 通知状态管理
├── websocket.ts            # WebSocket 客户端
├── use-notification.ts     # WebSocket Hook
└── components/
    ├── notification-icon.tsx      # 顶部铃铛图标
    ├── notification-drawer.tsx    # 通知抽屉
    ├── notification-toast.tsx     # 浮动通知
    └── notification-provider.tsx  # 全局状态提供者
```

## 核心组件

### 1. WebSocket 连接管理器 (notification_service.py)
- 管理所有 WebSocket 连接（使用 user_id 作为 key）
- 支持同一用户多个连接
- `broadcast()` 方法向用户所有连接推送消息

### 2. WebSocket 端点 (ws.py)
- 路径：`/ws/{user_id}`
- Token 认证（从 cookie 或 header 获取）
- 连接建立时注册到 manager
- 连接关闭时从 manager 移除

### 3. 前端通知状态 (notification-store.ts)
- Zustand store 管理通知列表、unread 计数、drawer 开关
- 自动重连机制（指数退避）
- 新通知时显示 toast 并播放提示音

### 4. 通知图标组件 (notification-icon.tsx)
- 显示未读计数 badge
- 点击打开通知抽屉

## 配置文件

### .env
```env
VITE_WS_URL=ws://192.168.1.100:8000/ws
```

### WebSocket URL 说明
- **必须使用 IP 地址**，不能用 localhost（跨电脑访问时无效）
- 格式：`ws://IP:PORT/ws`

## 调试过程中反复遇到的问题

### 问题1：WebSocket 连接失败 - localhost vs IP

**现象**：
- 开发环境使用 `ws://localhost:8000/ws` 连接成功
- 其他电脑访问时连接失败

**原因**：
- localhost 只会连接本机
- 跨电脑访问需要使用服务器的实际 IP 地址

**解决**：
- 统一使用 IP 地址配置
- 添加环境变量 `VITE_WS_URL`

### 问题2：asyncio.run() 在 FastAPI 异步端点中无法使用

**现象**：
```python
# 错误写法
async def mark_shipped(...):
    result = await mark_shipped_logic(...)
    await notification_manager.broadcast(user_id, message)
    # 如果 broadcast 内部使用 asyncio.run() 会报错
```

**原因**：
- FastAPI 已在事件循环中运行
- `asyncio.run()` 会创建新的事件循环，导致冲突

**解决**：
```python
# 方案A：broadcast 直接使用 await
async def broadcast(self, user_id: int, message: dict):
    # 直接在现有事件循环中执行，不使用 asyncio.run()

# 方案B：API 层直接调用
@router.post("/mark-shipped")
async def mark_shipped(...):
    await service.mark_shipped(...)
    await notification_manager.broadcast(user_id, message)
```

### 问题3：Python 脚本中 WebSocket 广播不生效

**现象**：
- 在 Python 脚本中调用 `notification_manager.broadcast()`
- 但 WebSocket 客户端没有收到消息

**原因**：
- Python 脚本创建了自己的 `NotificationManager` 实例
- 这个实例与 uvicorn 运行的实例不同
- 广播的消息发送到了错误的实例

**解决**：
- 在 API 层调用 `broadcast()`，确保在同一进程中
- 或者使用共享的 manager 实例（如通过依赖注入）

### 问题4：批量发货后 WebSocket 通知不发送

**现象**：
- 批量标记发货成功
- 但 WebSocket 通知没有发送
- 页面没有自动刷新

**排查过程**：
1. 确认后端 `mark_shipped` 函数是否返回 `notification_msg`
2. 确认 API 层是否调用了 `broadcast()`
3. 确认前端是否正确处理了通知消息

**根因**：
- `mark_shipped` 返回了 `notification_msg`，但 API 层没有使用
- 或者 broadcast 调用位置不对

**解决**：
- API 层直接 await 调用 `manager.broadcast()`
- 不要使用 `asyncio.run()` 包装

### 问题5：toast 样式不统一

**现象**：
- 有的地方使用 `toast.success()`
- 有的地方使用 `showToastWithData()`

**原因**：
- 没有统一的 toast 使用规范

**解决**：
- 根据 memory 中的 `Hook_UI_Notification_Principle` 规则
- **核心原则**：Hook 只发送通知事件，UI 层负责展示
- **统一使用 `showToastWithData`** 在 UI 层展示

### 问题6：NotificationIcon 位置问题

**现象**：
- NotificationIcon 在 Header 中固定位置
- 但需要根据页面布局灵活调整

**原因**：
- Header 是共享组件，NotificationIcon 不应该硬编码

**解决**：
- 从 Header 中移除 NotificationIcon
- 在每个页面的 Header children 中单独添加
- 位于 ThemeSwitch（太阳图标）左侧

## 代码修改记录

### 后端修改
1. `notification_service.py` - WebSocket 连接管理器
2. `ws.py` - WebSocket API 端点
3. `order_service.py` - 标记发货逻辑
4. `list.py` - 订单列表 API

### 前端修改
1. `notification-store.ts` - Zustand 状态管理
2. `websocket.ts` - WebSocket 客户端
3. `use-notification.ts` - WebSocket Hook
4. `notification-icon.tsx` - 铃铛图标
5. `notification-drawer.tsx` - 通知抽屉
6. `notification-toast.tsx` - 浮动通知
7. `notification-provider.tsx` - 全局提供者
8. `header.tsx` - 移除硬编码的 NotificationIcon
9. `authenticated-layout.tsx` - 添加 NotificationDrawer
10. **28个页面文件** - 添加 NotificationIcon 到 Header

### Toast 统一修改
1. `shipping-delete-dialog.tsx` - 改用 showToastWithData
2. `UnshippedList.tsx` - 改用 showToastWithData

## 环境配置

### 开发环境
```env
VITE_WS_URL=ws://192.168.1.100:8000/ws
```

### 生产环境
- 需要配置正确的 WebSocket URL
- 确保服务器防火墙开放 WebSocket 端口

## 测试验证

### 1. WebSocket 连接测试
```javascript
// 浏览器控制台
const ws = new WebSocket('ws://192.168.1.100:8000/ws/1')
ws.onmessage = (event) => console.log('收到消息:', JSON.parse(event.data))
ws.onopen = () => console.log('连接成功')
ws.onerror = (error) => console.error('连接错误:', error)
```

### 2. 标记发货测试
1. 登录系统
2. 进入未发货列表
3. 选择订单并标记发货
4. 观察：
   - Toast 显示成功
   - WebSocket 收到通知
   - 未发货列表自动刷新

## 相关文档
- `.opencode/documents/2026-04-10-message-system-design.md`
- `.opencode/documents/2026-04-10-message-system-plan.md`
