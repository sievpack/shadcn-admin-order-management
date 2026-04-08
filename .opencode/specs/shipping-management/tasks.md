# 发货管理功能开发 Tasks

## Task 1: 创建发货单列表组件
**描述**: 创建发货单列表的 columns 定义和 table 组件
- [ ] SubTask 1.1: 创建 `shipping-columns.tsx` 文件，定义发货单列表的列结构
  - 包含字段：发货单号、快递单号、快递公司、客户名称、金额、订单编号
  - 添加 Checkbox 选择列
  - 添加操作列（查看、删除）
  - 参考 `orderlist-columns.tsx` 的实现方式
  
- [ ] SubTask 1.2: 创建 `shipping-table.tsx` 文件，实现 data-table 组件
  - 集成 sorting、filtering、pagination 功能
  - 添加 DataTableToolbar 支持搜索和筛选
  - 添加 DataTablePagination 分页组件
  - 添加 DataTableBulkActions 批量操作组件
  - 参考 `orderlist-table.tsx` 的实现方式

- [ ] SubTask 1.3: 创建 `shipping-row-actions.tsx` 文件，实现行操作按钮
  - 查看按钮：打开发货单详情
  - 删除按钮：删除单条发货记录

- [ ] SubTask 1.4: 创建 `shipping-bulk-actions.tsx` 文件，实现批量操作
  - 批量删除功能

## Task 2: 创建未发货列表组件
**描述**: 创建未发货列表的 columns 定义和 table 组件
- [ ] SubTask 2.1: 创建 `unshipped-columns.tsx` 文件，定义未发货列表的列结构
  - 包含字段：订单编号、客户名称、规格、产品类型、型号、数量、单位、交货日期
  - 添加 Checkbox 选择列
  - 添加操作列（查看、标记发货）
  
- [ ] SubTask 2.2: 创建 `unshipped-table.tsx` 文件，实现 data-table 组件
  - 集成 sorting、filtering、pagination 功能
  - 添加 DataTableToolbar 支持搜索和筛选
  - 添加 DataTablePagination 分页组件

- [ ] SubTask 2.3: 创建 `unshipped-row-actions.tsx` 文件，实现行操作按钮
  - 查看按钮：打开订单详情
  - 标记发货按钮：打开发货对话框

## Task 3: 重构发货单列表页面
**描述**: 重构 ShippingList.tsx 页面，使用新的 data-table 组件
- [ ] SubTask 3.1: 更新页面导入
  - 导入 ShippingTable 组件
  - 导入 shippingAPI
  
- [ ] SubTask 3.2: 实现数据获取逻辑
  - 使用 shippingAPI.getShippingList 获取数据
  - 处理分页参数
  - 处理错误和加载状态

- [ ] SubTask 3.3: 实现操作功能
  - 查看发货单详情
  - 删除发货单
  - 批量删除发货单

- [ ] SubTask 3.4: 添加"新增发货单"按钮
  - 实现新增发货单对话框

## Task 4: 重构未发货列表页面
**描述**: 重构 UnshippedList.tsx 页面，使用新的 data-table 组件
- [ ] SubTask 4.1: 更新页面导入
  - 导入 UnshippedTable 组件
  - 导入 orderAPI（用于获取未发货订单）
  
- [ ] SubTask 4.2: 实现数据获取逻辑
  - 使用 orderAPI.getOrders 获取未发货订单
  - 设置发货状态参数为 0（未发货）
  - 处理分页参数
  - 处理错误和加载状态

- [ ] SubTask 4.3: 实现操作功能
  - 查看订单详情
  - 标记发货功能

## Task 5: 更新 Sidebar 导航
**描述**: 更新 sidebar-data.ts，将发货管理拆分为两个独立菜单项
- [ ] SubTask 5.1: 修改主导航项
  - 移除原有的"发货管理"菜单项
  - 添加"发货单列表"菜单项，链接到 `/shippinglist`
  - 添加"未发货列表"菜单项，链接到 `/unshippedlist`
  
- [ ] SubTask 5.2: 选择合适的图标
  - 发货单列表：使用 Send 图标（纸飞机）
  - 未发货列表：使用 Truck 图标（货车）

## Task 6: 创建对话框组件
**描述**: 创建发货管理相关的对话框组件
- [ ] SubTask 6.1: 创建 `shipping-dialogs.tsx` 文件
  - ShippingDetailDialog：发货单详情对话框
  - ShippingDeleteDialog：删除确认对话框
  - ShippingAddDialog：新增发货单对话框

- [ ] SubTask 6.2: 创建 `unshipped-dialogs.tsx` 文件
  - UnshippedDetailDialog：订单详情对话框
  - MarkShippedDialog：标记发货对话框

## Task 7: 验证和测试
**描述**: 验证所有功能正常工作
- [ ] SubTask 7.1: 验证发货单列表页面
  - 数据加载正常
  - 搜索功能正常
  - 筛选功能正常
  - 分页功能正常
  - 多选和批量删除正常

- [ ] SubTask 7.2: 验证未发货列表页面
  - 数据加载正常
  - 只显示未发货订单
  - 搜索和筛选功能正常
  - 标记发货功能正常

- [ ] SubTask 7.3: 验证 Sidebar 导航
  - 两个菜单项正确显示
  - 点击后正确跳转

# Task Dependencies
- Task 1 和 Task 2 可以并行执行
- Task 3 依赖于 Task 1 完成
- Task 4 依赖于 Task 2 完成
- Task 5 可以与其他任务并行执行
- Task 6 依赖于 Task 1 和 Task 2
- Task 7 依赖于所有其他任务完成
