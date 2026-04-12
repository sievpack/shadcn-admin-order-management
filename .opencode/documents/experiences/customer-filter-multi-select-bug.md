# Bug修复记录：客户资料页面多选筛选器失效

## 问题描述
- **模块**：客户资料页面 (CustomerList)
- **症状**：
  1. 同一个筛选器同时选中多个值时，表格不显示数据
  2. 结算方式筛选器选择2个值时，会将状态筛选器的值清空
  3. 多选之后取消其中一个筛选值，表格没有做出相应筛选

## 根因分析

### 问题1：多选筛选器不生效
**原因**：`customer-table.tsx` 使用 `serverPaginationMode={true}`，但表格配置中 `getFilteredRowModel: getFilteredRowModel()` 仍然被启用。在服务器端筛选模式下，本地只有10条数据，`getFilteredRowModel()` 会在本地数据上再次筛选，导致找不到匹配行。

**修复**：将 `getFilteredRowModel` 设置为 `undefined`

```typescript
// customer-table.tsx
getFilteredRowModel: undefined, // 服务器端筛选时不使用
```

### 问题2：结算方式选择2个值时清空状态筛选器
**原因**：`toolbar.tsx` 的 `handleFilterChange` 调用 `onFilterChange(columnId, value)` 只传递当前变化的筛选器值，而不是所有筛选器的完整状态。当选择结算方式的第2个值时，只传递了结算方式的值，导致状态筛选器的值被覆盖为URL中的旧值。

**修复**：修改 `handleFilterChange`，在状态更新后遍历所有筛选器并传递完整状态

```typescript
// toolbar.tsx
setLocalFilterValues((prev) => {
  const newValues = { ...prev }
  if (value) {
    newValues[columnId] = value
  } else {
    delete newValues[columnId]
  }
  // 传递所有筛选器的完整状态
  if (onFilterChange) {
    Object.entries(newValues).forEach(([key, val]) => {
      onFilterChange(key, val)
    })
  }
  return newValues
})
```

### 问题3：取消选择筛选值不生效
**原因**：`onColumnFiltersChange` 期望接收包含所有活动筛选器的数组，但 `customer-table.tsx` 的回调只传递当前变化的筛选器，导致取消选择时其他筛选器被丢失。

**修复**：修改 `customer-table.tsx` 的 `onFilterChange` 回调，合并所有筛选器

```typescript
// customer-table.tsx
onFilterChange={(columnId, value) => {
  const currentFilters = columnFilters || []
  const otherFilters = currentFilters.filter((f) => f.id !== columnId)
  const newFilters = value
    ? [...otherFilters, { id: columnId, value: value.split(',') }]
    : otherFilters
  onColumnFiltersChange?.(newFilters)
}}
```

## 架构问题

当前 `DataTableToolbar` 和 `useTableUrlState` 的设计存在不匹配：

| 组件 | 方法 | 描述 |
|------|------|------|
| `DataTableToolbar` | `onFilterChange(columnId, value)` | 传递单个筛选器变化 |
| `useTableUrlState` | `onColumnFiltersChange(filters[])` | 期望接收所有活动筛选器数组 |

**建议**：后续应统一接口设计，让 `onFilterChange` 也传递所有筛选器的完整状态。

## 修改文件

1. **src/features/customers/components/customer-table.tsx**
   - 移除 `getFilteredRowModel`
   - 修改 `onFilterChange` 回调合并所有筛选器

2. **src/components/data-table/toolbar.tsx**
   - 修改 `handleFilterChange` 传递所有筛选器完整状态

## 验证结果
- [x] 状态筛选器多选（活跃+停用）：正常显示数据
- [x] 结算方式筛选器多选（现结+月结）：正常显示数据
- [x] 两个筛选器同时多选：正常显示交叉数据
- [x] 取消其中一个筛选值：表格正确响应

## 修复日期
2026-04-07

## 相关组件
- `CustomerTable.tsx` - 表格组件
- `DataTableToolbar.tsx` - 工具栏组件
- `DataTableFacetedFilter.tsx` - 多选筛选器组件
- `useTableUrlState` - URL状态管理hook
