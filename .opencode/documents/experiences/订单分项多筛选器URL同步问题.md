# Bug修复记录：订单分项页面多筛选器URL同步问题

## 问题描述
- **模块**：订单分项页面 (AllOrders)
- **症状**：
  1. 两个筛选器（同步带类型、规格）同时操作时，URL不跟随变化
  2. 点击筛选值后浏览器没有发起网络请求
  3. 筛选值只在组件内部状态变化，没有同步到URL

## 根因分析

### 问题1：URL不同步
**原因**：`AllOrders.tsx` 中的 `handleSyncBeltTypeFilterChange` 和 `handleSpecFilterChange` 使用了 `startTransition` 包装 `navigate` 调用，导致URL更新被延迟或阻止。

**修复**：移除 `startTransition`，直接调用 `navigate`：
```typescript
// 错误：使用 startTransition 包装
const handleSyncBeltTypeFilterChange = useCallback(
  (value: string | undefined) => {
    startTransition(() => {
      navigate({ search: { ... } })
    })
  },
  [navigate]
)

// 正确：直接调用 navigate
const handleSyncBeltTypeFilterChange = useCallback(
  (value: string | undefined) => {
    navigate({ search: { ... } })
  },
  [navigate, search, localSpec]
)
```

### 问题2：多筛选器状态丢失
**原因**：当一个筛选器变化时，没有同时保留另一个筛选器的值到URL。

**修复**：在更新URL时，同时包含两个筛选器的值：
```typescript
const handleSyncBeltTypeFilterChange = useCallback(
  (value: string | undefined) => {
    navigate({
      search: {
        ...search,
        sync_belt_type: value || undefined,
        spec: localSpec || undefined,  // 同时保留规格筛选
      },
    })
  },
  [navigate, search, localSpec]
)
```

### 问题3：本地状态与URL不同步
**原因**：组件内部没有维护本地筛选器状态来跟踪URL参数。

**修复**：使用 `useState` + `useEffect` 管理本地筛选器状态：
```typescript
const [localSyncBeltType, setLocalSyncBeltType] = useState(syncBeltTypeParam)
const [localSpec, setLocalSpec] = useState(specParam)

useEffect(() => {
  setLocalSyncBeltType(syncBeltTypeParam)
}, [syncBeltTypeParam])

useEffect(() => {
  setLocalSpec(specParam)
}, [specParam])
```

## 修改文件

1. **src/features/orders/AllOrders.tsx**
   - 添加 `useState` 管理本地筛选器状态
   - 添加 `useEffect` 同步 URL 参数到本地状态
   - 修改 `handleSyncBeltTypeFilterChange` 直接调用 `navigate` 并保留 `spec` 值
   - 修改 `handleSpecFilterChange` 直接调用 `navigate` 并保留 `sync_belt_type` 值

2. **src/features/orders/components/allorders-table.tsx**
   - 简化 `handleSyncBeltTypeFilterChange`，直接传递筛选值给对应回调

## 验证结果
- [x] 点击同步带类型筛选值：URL正确变化 `?sync_belt_type=XXX`
- [x] 点击规格筛选值：URL正确变化 `?spec=XXX`
- [x] 同时选中多个筛选值：URL正确保留两个筛选器的值
- [x] 浏览器发起网络请求获取新数据

## 修复日期
2026-04-12

## 相关组件
- `AllOrders.tsx` - 页面组件
- `AllOrdersTable.tsx` - 表格组件
- `DataTableFacetedFilter.tsx` - 多选筛选器组件
- `DataTableToolbar.tsx` - 工具栏组件
