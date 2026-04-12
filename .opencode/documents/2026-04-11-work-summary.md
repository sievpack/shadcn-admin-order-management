# 2026-04-11 工作归档

## 完成的任务

### 1. DialogBody 组件化
- 创建 `src/components/dialog-body.tsx`
- 封装 loading/error/children 状态
- 重构 `shipping-view-dialog.tsx` 使用 DialogBody

### 2. Loading 组件统一
- 创建 `src/components/table-loading.tsx` - 表格加载动画
- 创建 `src/components/sheet-loading.tsx` - Sheet 加载动画
- 批量修改 17 个表格文件，23 处 loading

### 3. 报表模块重构（TanStack Query）
创建的文件：
- `src/queries/reports/keys.ts`
- `src/queries/reports/index.ts`
- `src/queries/reports/useMonthlyReport.ts`
- `src/queries/reports/useProductReport.ts`
- `src/queries/reports/useProductTypes.ts`
- `src/queries/reports/useProductDetail.ts`
- `src/queries/reports/useIndustryReport.ts`
- `src/queries/reports/useCustomerYearlyReport.ts`

重构的页面：
- `MonthlyReport.tsx` - ✅
- `CustomerYearlyReport.tsx` - ✅
- `ProductReport.tsx` - ✅
- `IndustryReport.tsx` - ✅

### 4. Bug 修复
- 修复 IndustryReport 导出功能：`data` 变量重复声明
- 修复导出 API 认证问题：使用 `reportAPI` 替代 `fetch`

## 进行中的讨论

### 订单通知问题（未完成）
- **场景**：多系统共用数据库，外部系统直接写入数据库
- **当前问题**：轮询 60 秒检测新订单，但订单头和分项分时保存，导致通知延迟或不完整
- **用户选择**：选项 A - 订单头保存后立即通知，分项保存完成后再发更新通知，自动更新原通知
- **待定方案**：需要选择 PostgreSQL LISTEN/NOTIFY 或其他方案

## 下一步
- 完成订单通知方案的设计和实现
