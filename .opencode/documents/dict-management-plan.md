# 字典管理开发计划

## 一、概述

本文档描述如何将项目中硬编码的状态值、下拉选项等改为通过字典统一管理。

### 目标

- 统一管理项目中所有枚举类型的选项
- 减少硬编码，提高可维护性
- 支持运行时动态配置选项
- 统一的状态样式管理

### 现有资源

| 类别 | 位置 | 说明 |
|------|------|------|
| 后端字典 API | `backend/app/api/dict.py` | 完整实现 |
| 前端字典 API | `src/lib/api.ts` - `dictDataAPI` | 已有 `getDataByType(dictType)` |
| 样式模型 | `DictData.css_class` | 用于 Badge 样式 |
| 前端 Select | `src/components/ui/select.tsx` | Radix UI 实现 |

---

## 二、字典 API 详情

### 后端接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取字典类型列表 | GET | `/dict/type` | 分页获取 |
| 获取所有字典类型 | GET | `/dict/type/all` | 不分页 |
| 创建字典类型 | POST | `/dict/type` | |
| 更新字典类型 | PUT | `/dict/type/{id}` | |
| 删除字典类型 | DELETE | `/dict/type/{id}` | |
| 获取字典数据列表 | GET | `/dict/data` | 分页获取 |
| **根据类型获取字典数据** | GET | `/dict/data/type/{dict_type}` | **主要使用接口** |
| 创建字典数据 | POST | `/dict/data` | |
| 更新字典数据 | PUT | `/dict/data/{id}` | |
| 删除字典数据 | DELETE | `/dict/data/{id}` | |

### 前端 API

```typescript
// src/lib/api.ts
export const dictDataAPI = {
  getData: (params?: any) => api.get('/dict/data', { params }),
  getDataByType: (dictType: string) => api.get(`/dict/data/type/${dictType}`),
  // ...
}
```

### 字典数据结构

```typescript
interface DictData {
  id: number
  dict_label: string    // 显示文本
  dict_value: string    // 实际值
  dict_type: string     // 字典类型
  dict_sort: number      // 排序
  css_class: string     // 样式类（用于 Badge）
  list_class: string     // 列表样式
  is_default: boolean   // 是否默认
  available: boolean    // 是否可用
  description?: string  // 描述
}
```

---

## 三、需要创建的内容

### 1. Hook: `useDict.ts`

位置：`src/hooks/useDict.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { dictDataAPI } from '@/lib/api'

interface DictItem {
  id: number
  dict_label: string
  dict_value: string
  dict_type: string
  dict_sort: number
  css_class?: string
  list_class?: string
  is_default?: boolean
}

interface DictResponse {
  code: number
  msg: string
  data: DictItem[]
}

export function useDict(dictType: string) {
  return useQuery<DictResponse>({
    queryKey: ['dict', dictType],
    queryFn: () => dictDataAPI.getDataByType(dictType),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    enabled: !!dictType,
  })
}

// 获取字典项的样式类
export function useDictStyles(dictType: string) {
  const { data } = useDict(dictType)
  return (dictValue: string): string => {
    const item = data?.find(d => d.dict_value === dictValue)
    return item?.css_class || ''
  }
}

// 获取字典项的显示文本
export function useDictLabels(dictType: string) {
  const { data } = useDict(dictType)
  return (dictValue: string): string => {
    const item = data?.find(d => d.dict_value === dictValue)
    return item?.dict_label || dictValue
  }
}
```

### 2. 组件: `DictBadge.tsx`

位置：`src/components/dict-badge.tsx`

```typescript
import { Badge } from '@/components/ui/badge'
import { useDictStyles } from '@/hooks/useDict'

interface DictBadgeProps {
  dictType: string
  value: string
  className?: string
}

export function DictBadge({ dictType, value, className }: DictBadgeProps) {
  const getStyle = useDictStyles(dictType)
  const style = getStyle(value)

  return (
    <Badge className={style ? `border ${style}` : className}>
      {value}
    </Badge>
  )
}
```

### 3. 组件: `DictSelect.tsx`

位置：`src/components/dict-select.tsx`

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDict } from '@/hooks/useDict'

interface DictSelectProps {
  dictType: string
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DictSelect({
  dictType,
  value,
  onValueChange,
  placeholder = '请选择',
  disabled,
  className,
}: DictSelectProps) {
  const { data, isLoading } = useDict(dictType)

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {data?.map(item => (
          <SelectItem key={item.dict_value} value={item.dict_value}>
            {item.dict_label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

---

## 四、字典初始化数据

在后端创建种子数据，建议初始化以下字典类型：

### 状态类字典（高优先级）

| 字典类型 | 字典名称 | 说明 |
|----------|----------|------|
| `work_order_status` | 工单状态 | 生产工单状态 |
| `production_plan_status` | 计划状态 | 生产计划状态 |
| `production_plan_priority` | 优先级 | 生产计划优先级 |
| `qc_result` | 质检结果 | 质检判定结果 |
| `defect_type` | 不良分类 | 质量缺陷分类 |
| `inbound_status` | 入库状态 | 成品入库状态 |
| `order_status` | 订单状态 | 订单完成状态 |
| `ar_status` | 应收状态 | 应收账款状态 |
| `ap_status` | 应付状态 | 应付账款状态 |
| `payment_method` | 收付款方式 | 收付款方式 |
| `voucher_type` | 凭证类型 | 财务凭证类型 |

### 通用类字典（中优先级）

| 字典类型 | 字典名称 | 说明 |
|----------|----------|------|
| `product_type` | 产品类型 | 产品分类 |
| `unit` | 单位 | 计量单位 |
| `settlement_type` | 结算方式 | 订单/客户结算方式 |
| `payment_term` | 账期类型 | 付款账期 |
| `process` | 工序 | 生产工序 |
| `production_line` | 产线 | 生产线 |
| `warehouse` | 仓库 | 仓库 |
| `express_company` | 快递公司 | 发货快递公司 |
| `customer_status` | 客户状态 | 客户状态 |

### 详细初始化数据

```python
# 工单状态 work_order_status
work_order_status = [
    {'dict_label': '待生产', 'dict_value': '待生产', 'css_class': 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300', 'dict_sort': 1},
    {'dict_label': '生产中', 'dict_value': '生产中', 'css_class': 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300', 'dict_sort': 2},
    {'dict_label': '已完工', 'dict_value': '已完工', 'css_class': 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300', 'dict_sort': 3},
    {'dict_label': '已暂停', 'dict_value': '已暂停', 'css_class': 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300', 'dict_sort': 4},
    {'dict_label': '已取消', 'dict_value': '已取消', 'css_class': 'border-red-500/50 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-300', 'dict_sort': 5},
]

# 质检结果 qc_result
qc_result = [
    {'dict_label': '合格', 'dict_value': '合格', 'css_class': 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700', 'dict_sort': 1},
    {'dict_label': '不合格', 'dict_value': '不合格', 'css_class': 'border-red-500/50 bg-red-500/10 text-red-700', 'dict_sort': 2},
    {'dict_label': '让步接收', 'dict_value': '让步接收', 'css_class': 'border-amber-500/50 bg-amber-500/10 text-amber-700', 'dict_sort': 3},
]

# 不良分类 defect_type
defect_type = [
    {'dict_label': '外观', 'dict_value': '外观', 'css_class': '', 'dict_sort': 1},
    {'dict_label': '尺寸', 'dict_value': '尺寸', 'css_class': '', 'dict_sort': 2},
    {'dict_label': '功能', 'dict_value': '功能', 'css_class': '', 'dict_sort': 3},
    {'dict_label': '性能', 'dict_value': '性能', 'css_class': '', 'dict_sort': 4},
    {'dict_label': '其他', 'dict_value': '其他', 'css_class': '', 'dict_sort': 5},
]

# 单位 unit
unit = [
    {'dict_label': '台', 'dict_value': '台', 'dict_sort': 1},
    {'dict_label': '件', 'dict_value': '件', 'dict_sort': 2},
    {'dict_label': '套', 'dict_value': '套', 'dict_sort': 3},
    {'dict_label': '个', 'dict_value': '个', 'dict_sort': 4},
    {'dict_label': '箱', 'dict_value': '箱', 'dict_sort': 5},
    {'dict_label': '批', 'dict_value': '批', 'dict_sort': 6},
    {'dict_label': '米', 'dict_value': '米', 'dict_sort': 7},
    {'dict_label': '千克', 'dict_value': '千克', 'dict_sort': 8},
]

# 结算方式 settlement_type
settlement_type = [
    {'dict_label': '现结', 'dict_value': '现结', 'dict_sort': 1},
    {'dict_label': '月结', 'dict_value': '月结', 'dict_sort': 2},
    {'dict_label': '账期', 'dict_value': '账期', 'dict_sort': 3},
]

# 收付款方式 payment_method
payment_method = [
    {'dict_label': '银行转账', 'dict_value': '银行转账', 'dict_sort': 1},
    {'dict_label': '现金', 'dict_value': '现金', 'dict_sort': 2},
    {'dict_label': '承兑', 'dict_value': '承兑', 'dict_sort': 3},
    {'dict_label': '微信', 'dict_value': '微信', 'dict_sort': 4},
    {'dict_label': '支付宝', 'dict_value': '支付宝', 'dict_sort': 5},
]
```

---

## 五、改造流程

### 以生产工单为例

#### 第一步：改造 `production-order-columns.tsx`（状态 Badge 显示）

**Before:**
```tsx
const styles: Record<string, string> = {
  '待生产': 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300',
  '生产中': 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300',
  '已完工': 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300',
  '已暂停': 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300',
  '已取消': 'border-red-500/50 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-300',
}
const isInProgress = status === '待生产' || status === '生产中'
return (
  <Badge className={styles[status] ?? 'border-slate-500/50 bg-slate-500/10 text-slate-700'}>
    {isInProgress && <Loader2 className='me-1 inline h-3 w-3 animate-spin' data-icon='inline-start' />}
    {status}
  </Badge>
)
```

**After:**
```tsx
const { data: statusOptions } = useDict('work_order_status')
const getStatusStyle = (status: string) => {
  const item = statusOptions?.find(d => d.dict_value === status)
  return item?.css_class || 'border-slate-500/50 bg-slate-500/10 text-slate-700'
}
const isInProgress = status === '待生产' || status === '生产中'
return (
  <Badge className={getStatusStyle(status)}>
    {isInProgress && <Loader2 className='me-1 inline h-3 w-3 animate-spin' data-icon='inline-start' />}
    {status}
  </Badge>
)
```

#### 第二步：改造 `production-order-dialogs.tsx`（状态下拉选择）

**Before:**
```tsx
const statuses = ['待生产', '生产中', '已完工', '已暂停', '已取消']

<Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
  <SelectTrigger>...</SelectTrigger>
  <SelectContent>
    {statuses.map(status => (
      <SelectItem key={status} value={status}>{status}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

**After:**
```tsx
const { data: statusOptions } = useDict('work_order_status')

<Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
  <SelectTrigger>...</SelectTrigger>
  <SelectContent>
    {statusOptions?.map(option => (
      <SelectItem key={option.dict_value} value={option.dict_value}>
        {option.dict_label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## 六、改造优先级

### P0 - 紧急（状态类硬编码）

| 模块 | 字典类型 | 改造文件 |
|------|----------|----------|
| 生产工单 | `work_order_status` | `production-order-columns.tsx`, `production-order-dialogs.tsx` |
| 生产计划 | `production_plan_status`, `production_plan_priority` | `production-plan-columns.tsx`, `production-plan-dialogs.tsx` |
| 质检记录 | `qc_result`, `defect_type` | `quality-inspection-columns.tsx` |
| 成品入库 | `inbound_status` | `product-inbound-columns.tsx` |

### P1 - 高（财务状态类）

| 模块 | 字典类型 | 改造文件 |
|------|----------|----------|
| 应收账款 | `ar_status`, `payment_term` | `ar-table.tsx` |
| 应付账款 | `ap_status`, `payment_term` | `ap-table.tsx` |
| 收款记录 | `payment_method` | `collection-table.tsx` |
| 付款记录 | `payment_method` | `payment-table.tsx` |
| 凭证 | `voucher_type` | `voucher-table.tsx` |

### P2 - 中（通用字段）

| 模块 | 字典类型 | 改造说明 |
|------|----------|----------|
| 订单状态 | `order_status` | `orderlist-columns.tsx` |
| 产品类型 | `product_type` | 各模块表单 |
| 单位 | `unit` | 各模块表单 |
| 结算方式 | `settlement_type` | 订单分项、客户管理表单 |
| 工序 | `process` | 报工记录表单 |
| 产线 | `production_line` | 生产工单表单 |
| 仓库 | `warehouse` | 成品入库表单 |
| 快递公司 | `express_company` | 发货表单 |

### P3 - 低

| 模块 | 字典类型 | 改造文件 |
|------|----------|----------|
| 客户状态 | `customer_status` | `customer-columns.tsx` |

---

## 七、注意事项

### 向后兼容

- 改造时保持 `dict_value` 与原有硬编码值一致
- 避免数据不兼容

### 样式迁移

- 将现有的硬编码 Tailwind 样式移到 `css_class` 字段
- 确保样式在明暗主题下都正常显示

### 缓存策略

- `useDict` 使用 5 分钟缓存
- 避免重复请求

### 初始化时机

- 字典数据在后端启动时初始化
- 或提供初始化接口

### 新增页面

- 新建页面时应优先使用字典组件
- 而非硬编码

---

## 八、实施步骤

1. **第一阶段：基础设施**
   - 创建 `useDict` hook
   - 创建 `DictBadge` 组件
   - 创建 `DictSelect` 组件

2. **第二阶段：P0 改造**
   - 选择质检记录作为试点
   - 验证 DictBadge 和 DictSelect 正常工作
   - 批量改造 P0 其他模块

3. **第三阶段：P1 改造**
   - 财务模块状态改造

4. **第四阶段：P2/P3 改造**
   - 通用字段改造
   - 其他模块改造

5. **第五阶段：数据初始化**
   - 在后端创建种子数据接口
   - 初始化所有字典数据
