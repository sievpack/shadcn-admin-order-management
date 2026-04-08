# 发货管理功能开发 Spec

## Why
当前系统的发货管理功能仅包含基础的发货单列表和未发货列表页面，缺乏完整的 data-table 组件支持，无法实现查询、修改、删除和多选操作等功能。需要参考订单列表页面的实现方式，重构发货管理模块，提供更完整的数据操作能力。

## What Changes
- 重构发货单列表页面 (ShippingList)，使用 data-table 组件
- 重构未发货列表页面 (UnshippedList)，使用 data-table 组件
- 添加发货单列表的 columns 定义和 table 组件
- 添加未发货列表的 columns 定义和 table 组件
- 更新 sidebar 导航，将"发货管理"拆分为"发货单列表"和"未发货列表"两个独立菜单项
- 确保与后端 ship.py 接口正确对接

## Impact
- Affected specs: 发货管理模块、侧边栏导航
- Affected code:
  - `src/features/shipping/ShippingList.tsx` → 重构为 data-table 实现
  - `src/features/shipping/UnshippedList.tsx` → 重构为 data-table 实现
  - `src/components/layout/data/sidebar-data.ts` → 更新导航结构
  - 新增 `src/features/shipping/components/shipping-columns.tsx`
  - 新增 `src/features/shipping/components/shipping-table.tsx`
  - 新增 `src/features/shipping/components/unshipped-columns.tsx`
  - 新增 `src/features/shipping/components/unshipped-table.tsx`

---

## ADDED Requirements

### Requirement: 发货单列表页面重构
系统 SHALL 提供完整的发货单列表页面，支持 data-table 组件的所有功能。

#### Scenario: 发货单列表查询
- **WHEN** 用户访问发货单列表页面
- **THEN** 显示 data-table 组件，包含发货单号、快递单号、客户名称、金额等字段
- **AND** 支持全局搜索和列筛选

#### Scenario: 发货单新增
- **WHEN** 用户点击"新增发货单"按钮
- **THEN** 打开发货单创建对话框
- **AND** 支持填写发货单号、快递单号、客户信息等字段

#### Scenario: 发货单查看
- **WHEN** 用户点击某行数据的查看按钮
- **THEN** 显示发货单详情对话框
- **AND** 展示该发货单的所有关联订单信息

#### Scenario: 发货单删除
- **WHEN** 用户点击删除按钮
- **THEN** 显示确认对话框
- **AND** 确认后调用后端删除接口

#### Scenario: 发货单批量删除
- **WHEN** 用户选择多行数据并点击批量删除
- **THEN** 显示确认对话框
- **AND** 确认后批量调用后端删除接口

---

### Requirement: 未发货列表页面重构
系统 SHALL 提供完整的未发货列表页面，使用 data-table 组件展示未发货订单。

#### Scenario: 未发货列表查询
- **WHEN** 用户访问未发货列表页面
- **THEN** 显示 data-table 组件，只展示 ship_id 为空的订单数据
- **AND** 支持按订单编号、客户名称、规格等字段筛选

#### Scenario: 未发货订单查看
- **WHEN** 用户点击某行数据的查看按钮
- **THEN** 显示订单详情对话框
- **AND** 展示该订单的完整信息

#### Scenario: 未发货订单标记发货
- **WHEN** 用户点击"标记发货"按钮
- **THEN** 打开发货对话框
- **AND** 支持填写发货单号、快递单号等信息

---

### Requirement: Sidebar 导航更新
系统 SHALL 更新侧边栏导航，将发货管理拆分为两个独立菜单项。

#### Scenario: 导航结构更新
- **WHEN** 用户查看侧边栏导航
- **THEN** "发货管理"菜单项被替换为"发货单列表"和"未发货列表"
- **AND** 两个菜单项分别链接到对应的页面

---

## MODIFIED Requirements

### Requirement: 发货管理页面结构
发货管理页面 SHALL 从简单的表格实现重构为 data-table 组件实现：

```typescript
// 原结构
export function ShippingList() {
  // 使用基础 Table 组件
}

// 新结构
export function ShippingList() {
  // 使用 ShippingTable 组件（基于 data-table）
}
```

---

### Requirement: API 调用规范
发货管理 API SHALL 使用独立的 shippingAPI 对象：

```typescript
// 当前实现
const response = await orderAPI.getShippingList()

// 规范实现
const response = await shippingAPI.getShippingList(params)
```

---

## REMOVED Requirements

### Requirement: 原发货管理简单表格实现
**Reason**: 功能不完整，缺乏 data-table 的高级功能（筛选、排序、分页、多选等）
**Migration**: 重构为基于 data-table 的完整实现

---

## 后端接口映射

| 功能 | 后端接口 | 方法 | 路径 |
|------|----------|------|------|
| 获取发货列表 | GET | `/api/ship/shipping/list` | ship.py L384 |
| 删除发货单 | DELETE | `/api/ship/shipping/delete` | ship.py L477 |
| 获取订单数据 | GET | `/api/ship/data?query=items` | ship.py L44 |

---

## 文件结构

### 变更前
```
src/features/shipping/
├── ShippingList.tsx      # 简单表格实现
└── UnshippedList.tsx     # 简单表格实现
```

### 变更后
```
src/features/shipping/
├── ShippingList.tsx                 # 主页面（使用 ShippingTable）
├── UnshippedList.tsx                # 主页面（使用 UnshippedTable）
└── components/
    ├── shipping-columns.tsx         # 发货单列表列定义
    ├── shipping-table.tsx           # 发货单列表表格组件
    ├── unshipped-columns.tsx        # 未发货列表列定义
    ├── unshipped-table.tsx          # 未发货列表表格组件
    ├── shipping-row-actions.tsx     # 行操作按钮
    ├── shipping-bulk-actions.tsx    # 批量操作按钮
    └── shipping-dialogs.tsx         # 对话框组件
```

---

## 数据模型

### ShippingItem (发货单)
```typescript
interface ShippingItem {
  发货单号: string
  快递单号: string
  快递公司: string
  客户名称: string
  金额: number
  订单编号: string
}
```

### UnshippedItem (未发货订单)
```typescript
interface UnshippedItem {
  id: number
  订单编号: string
  客户名称: string
  规格: string
  产品类型: string
  型号: string
  数量: number
  单位: string
  交货日期: string
  ship_id: null  // 未发货状态的标志
}
```

---

## 验收标准

### 功能验收
- [ ] 发货单列表页面使用 data-table 组件
- [ ] 未发货列表页面使用 data-table 组件
- [ ] 支持全局搜索功能
- [ ] 支持列筛选功能
- [ ] 支持排序功能
- [ ] 支持分页功能
- [ ] 支持多选和批量删除
- [ ] 支持查看详情
- [ ] 支持删除单条记录
- [ ] Sidebar 导航正确显示两个菜单项

### UI 验收
- [ ] 页面风格与订单列表页面一致
- [ ] 使用 Shadcn/UI 组件规范
- [ ] 响应式布局正常
- [ ] 暗黑模式显示正常

### 性能验收
- [ ] 页面加载时间 < 3秒
- [ ] 表格渲染流畅，无卡顿
- [ ] 大数据量下分页正常
