# 订单列表组件化重构计划

**创建时间**: 2026-04-07
**目标**: 将订单列表页面组件化，减少复杂度，提高可维护性

## 目标声明

将订单列表页面 (`OrderList.tsx` 和 `orderlist-table.tsx`) 重构为更小、更专注的组件：
1. 抽取 ExpandedOrderItems 组件（展开行）
2. 抽取 useOrderItemDialogs hook（Dialog 状态管理）
3. 重构 orderlist-table.tsx 使用 TanStack Query
4. 简化 OrderList.tsx

## 阶段

### 阶段 1: 抽取 ExpandedOrderItems 组件
**状态**: pending
**目标**: 将 orderlist-table.tsx 中的展开行逻辑抽取为独立组件

**任务**:
- [ ] 创建 `src/features/orders/components/expanded-order-items.tsx`
- [ ] 创建 OrderItemTable 子组件（用于显示订单分项）
- [ ] 更新 orderlist-table.tsx 使用新组件

**文件**:
- 创建: `src/features/orders/components/expanded-order-items.tsx`
- 修改: `src/features/orders/components/orderlist-table.tsx`

---

### 阶段 2: 抽取 useOrderItemDialogs Hook
**状态**: pending
**目标**: 将 Dialog 状态管理逻辑抽取为 hook

**任务**:
- [ ] 创建 `src/features/orders/hooks/useOrderItemDialogs.ts`
- [ ] 创建 `src/features/orders/hooks/useOrderDialogs.ts`
- [ ] 更新 OrderList.tsx 使用新 hooks

**文件**:
- 创建: `src/features/orders/hooks/useOrderItemDialogs.ts`
- 创建: `src/features/orders/hooks/useOrderDialogs.ts`
- 修改: `src/features/orders/OrderList.tsx`

---

### 阶段 3: 重构 orderlist-table.tsx 使用 TanStack Query
**状态**: pending
**目标**: 将数据获取逻辑从 useEffect 迁移到 TanStack Query

**任务**:
- [ ] 更新 orderlist-table.tsx 使用 useOrders hook
- [ ] 移除手动的 fetchData useEffect
- [ ] 简化状态管理

**文件**:
- 修改: `src/features/orders/components/orderlist-table.tsx`
- 新建/修改: `src/features/orders/hooks/useOrderTable.ts`

---

### 阶段 4: 简化 OrderList.tsx
**状态**: pending
**目标**: 清理 OrderList.tsx，移除重复的状态管理

**任务**:
- [ ] 整合 Dialog 组件到统一样式
- [ ] 移除未使用的状态
- [ ] 验证功能完整性

**文件**:
- 修改: `src/features/orders/OrderList.tsx`

---

## 技术决策

1. **ExpandedOrderItems**: 将嵌套表格抽取为独立组件，通过 props 传递数据和回调
2. **useOrderDialogs**: 抽取 Dialog 状态管理，减少 OrderList.tsx 的状态数量
3. **TanStack Query**: 使用已创建的 useOrders hook 替代手动的 useEffect + fetchData
4. **保持兼容**: 确保所有现有功能不受影响

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| 重构破坏现有功能 | 每个阶段后验证功能 |
| 状态管理复杂性 | 使用自定义 hooks 封装复杂性 |
| 组件间 prop drilling | 考虑 Context 共享（如果需要） |

## 验收标准

- [ ] 订单列表页面可正常加载
- [ ] 展开订单行显示订单分项正常
- [ ] 创建/编辑/删除订单分项功能正常
- [ ] 新增/编辑/删除订单功能正常
- [ ] 批量删除功能正常
- [ ] 筛选和分页功能正常
- [ ] 无 TypeScript 编译错误
