# Bug修复记录：客户资料页面搜索功能失效

## 问题描述
- **模块**：客户资料页面 (CustomerList)
- **症状**：输入搜索内容后，输入框不显示内容，重置按钮不出现；必须输入相同内容两次才能正常工作
- **影响**：搜索功能无法正常使用

## 根因分析

### 问题定位
客户资料页面 (`CustomerList.tsx`) 和订单列表页面 (`OrderList.tsx`) 使用了不同的工具栏状态管理架构：

| 页面 | 状态管理方式 | 工具栏 onReset 实现 |
|------|------------|-------------------|
| 订单列表（正确） | `OrderListTable` 内部管理状态 | `navigate({ search: {} })` |
| 客户资料（错误） | `CustomerList` 管理状态，通过 props 传递 | `onGlobalFilterChange('')` |

### 根本原因

1. **架构问题**：`CustomerList` 调用 `useTableUrlState`，然后把状态通过 props 传给 `CustomerTable`。这种架构导致状态同步复杂化。

2. **`onReset` 实现错误**：之前调用 `onGlobalFilterChange('')` 只是清空了内部状态，但没有清空 URL 中的 `filter` 参数。当 `navigate({ search: {} })` 被调用时，URL 被清空，所有筛选条件正确重置。

3. **状态同步问题**：当用户输入搜索时，`localSearchValue` 和 `globalFilter`（URL）可能不同步，导致输入框显示和重置按钮逻辑异常。

## 修复方案

### 修改文件

1. **重写 `src/features/customers/components/customer-table.tsx`**
   - 完全参照 `orderlist-table.tsx` 的架构
   - 内部调用 `route.useSearch()`、`route.useNavigate()` 和 `useTableUrlState`
   - 内部管理数据获取 `fetchData`
   - `onReset` 使用 `navigate({ search: {} })`

2. **简化 `src/features/customers/CustomerList.tsx`**
   - 从 143 行简化为 57 行
   - 移除所有数据获取相关代码
   - 只保留 UI 布局

### 关键代码修改

**CustomerTable onReset 实现：**
```typescript
onReset={() => {
  navigate({ search: {} })
}}
```

## 架构对比

### 修复前（错误）
```
CustomerList
  ├── useTableUrlState() ← 管理状态
  ├── 传递 props 给 CustomerTable
  │     ├── globalFilter
  │     ├── onGlobalFilterChange
  │     └── ...
  └── onReset: onGlobalFilterChange('') ← 只清状态，不清URL
```

### 修复后（正确）
```
CustomerList (简化后)
  └── CustomerTable
        ├── route.useSearch()
        ├── route.useNavigate()
        ├── useTableUrlState() ← 内部管理状态
        └── onReset: navigate({ search: {} }) ← 清空URL
```

## 验证结果
- TypeScript 类型检查通过
- 搜索输入框正常显示内容
- 重置按钮在有搜索内容时正确显示
- 重置后输入框清空，URL 参数清除，数据恢复全部显示

## 修复日期
2026-04-07

## 相关组件
- `CustomerList.tsx` - 页面组件（已简化）
- `CustomerTable.tsx` - 表格组件（已重写）
- `OrderListTable.tsx` - 参考实现
- `DataTableToolbar.tsx` - 工具栏组件
- `useTableUrlState` - URL状态管理hook

## 经验总结

**工具栏状态管理最佳实践：**
1. 状态管理应该放在使用工具栏的组件内部（如 `OrderListTable`）
2. 使用 `navigate({ search: {} })` 清空所有 URL 参数
3. 避免通过 props 传递 `useTableUrlState` 的回调函数，这会导致状态同步问题
