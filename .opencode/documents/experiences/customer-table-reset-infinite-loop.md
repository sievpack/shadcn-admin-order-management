# 客户资料页面重置按钮无限循环 Bug 修复

## 问题描述

客户资料页面的重置按钮点击后页面卡死（无限循环错误）。

错误信息：
```
Cannot update a component while rendering a different component
Maximum update depth exceeded
```

## 根本原因

1. `navigate` 触发 `search` prop 变化
2. `useTableUrlState` 的 effect 检测到变化后调用 `onColumnFiltersChange`
3. `onColumnFiltersChange` 又调用 `navigate`
4. 形成无限循环

## 修复方案

### 1. `use-table-url-state.ts`

**添加变化检查，防止循环调用：**
```typescript
const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
  const next = typeof updater === 'function' ? updater(columnFilters) : updater
  
  // 如果没有变化，不做任何操作
  if (JSON.stringify(next) === JSON.stringify(columnFilters)) {
    return
  }
  // ...
}
```

**修复 effect 依赖：**
```typescript
useEffect(() => {
  // ...同步逻辑
  if (JSON.stringify(newColumnFilters) !== JSON.stringify(columnFilters)) {
    setColumnFilters(newColumnFilters)
  }
}, [search, columnFiltersCfg, columnFilters]) // 添加 columnFilters 依赖
```

### 2. `toolbar.tsx`

**移除 clearKey 机制和 effect 中的状态重置：**
```typescript
// 移除 setClearFiltersKey，只保留 onReset 调用
const handleReset = useCallback(() => {
  if (serverPaginationMode) {
    if (onReset) {
      onReset()
    }
    setLocalDateRange(undefined)
    setLocalSearchValue('')
    setLocalFilterValues({})
  } else {
    // ...
  }
}, [serverPaginationMode, onReset])
```

### 3. `faceted-filter.tsx`

**修复 effect，正确处理清空状态：**
```typescript
React.useEffect(() => {
  if (serverPaginationMode && !isInternalChangeRef.current) {
    if (selectedValues === undefined || selectedValues === '') {
      setLocalSelectedValues(new Set())
    } else {
      const newSet = new Set(selectedValues.split(','))
      setLocalSelectedValues(newSet)
    }
  }
  isInternalChangeRef.current = false
}, [serverPaginationMode, selectedValues])
```

### 4. `customer-table.tsx`

**简化 onReset，直接使用 navigate：**
```typescript
onReset={() => {
  navigate({})
}}
```

## 修改的文件

- `src/hooks/use-table-url-state.ts`
- `src/components/data-table/toolbar.tsx`
- `src/components/data-table/faceted-filter.tsx`
- `src/features/customers/components/customer-table.tsx`

## 验证

点击重置按钮后：
1. URL 参数被清空
2. 筛选器 UI 状态正确重置
3. 页面不再卡死
