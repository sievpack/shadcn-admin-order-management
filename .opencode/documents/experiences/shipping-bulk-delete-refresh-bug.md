# 已发货列表批量删除后不刷新数据

## 问题描述

在已发货列表页面执行批量删除操作后，列表数据不会自动刷新，需要手动刷新页面才能看到最新的数据状态。

## 根本原因

`ShippingBulkActions` 组件已经支持 `onDeleted` 回调，但 `shipping-table.tsx` 调用该组件时没有传递这个回调函数：

```tsx
// shipping-table.tsx 第 385 行（修复前）
<ShippingBulkActions table={table} />
```

导致批量删除成功后，无法触发 TanStack Query 的缓存失效机制来刷新数据。

## 修复方案

1. 在 `ShippingTable` 组件中添加 `handleBulkDeleted` 函数
2. 使用 `queryClient.invalidateQueries` 使 `shipping.list` 查询缓存失效
3. 将 `onDeleted={handleBulkDeleted}` 传递给 `ShippingBulkActions`

### 修改文件

**`src/features/shipping/components/shipping-table.tsx`**

添加回调函数（第 200-202 行）：
```tsx
const handleBulkDeleted = useCallback(() => {
  queryClient.invalidateQueries({ queryKey: ['shipping', 'list'] })
}, [queryClient])
```

修改组件调用（第 389 行）：
```tsx
<ShippingBulkActions table={table} onDeleted={handleBulkDeleted} />
```

## 相关代码分析

### 调用链

```
用户点击批量删除 
  → ShippingMultiDeleteDialog.handleDelete()
    → onDeleted() 回调
      → ShippingBulkActions.onDeleted
        → ShippingTable.handleBulkDeleted
          → queryClient.invalidateQueries({ queryKey: ['shipping', 'list'] })
            → TanStack Query 重新获取数据
              → 列表自动更新
```

### 关键代码位置

| 文件 | 行号 | 作用 |
|------|------|------|
| `shipping-multi-delete-dialog.tsx` | 70-72 | 调用 `onDeleted` 回调 |
| `shipping-bulk-actions.tsx` | 22 | 接收 `onDeleted` prop |
| `shipping-bulk-actions.tsx` | 105 | 传递 `onDeleted` 给对话框 |
| `shipping-table.tsx` | 200-202 | **新增** 定义刷新回调 |
| `shipping-table.tsx` | 389 | **修改** 传递刷新回调 |

## 修复后预期行为

1. 用户选择多条发货单记录
2. 点击批量删除按钮
3. 弹出确认对话框，用户输入 "DELETE" 确认
4. 删除成功后，显示成功 toast 提示
5. **列表自动刷新**，显示最新的数据状态
6. 选中状态自动清除

## 测试用例

1. 选择 1 条记录进行批量删除 → 列表刷新
2. 选择 3 条记录进行批量删除 → 全部成功则显示成功提示，列表刷新
3. 选择 3 条记录进行批量删除 → 部分失败则显示失败提示，列表刷新
4. 批量删除后表格分页正确（如果删除导致最后一页为空，应显示正确的分页）
