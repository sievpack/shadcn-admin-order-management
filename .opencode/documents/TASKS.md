# Shadcn Admin TODO 清单

> 生成时间: 2026-04-05

## 项目概述

JNS 订单管理系统，基于 Shadcn UI + Vite + TanStack Router 构建的后台系统。

---

## 高优先级 🔴

### 1. 业务模块开发

- [x] **生产管理模块** (`src/features/production/`)
  - 生产计划管理
  - 生产进度跟踪
  - 生产报表

- [ ] **外协管理模块** (`src/features/outsourcing/`)
  - 外协厂商管理
  - 外协订单跟踪
  - 外协结算

- [ ] **采购管理模块** (`src/features/purchasing/`)
  - 采购订单管理
  - 供应商管理
  - 采购审批流程

- [ ] **仓库管理模块** (`src/features/warehouse/`)
  - 库存管理
  - 入库/出库管理
  - 库存预警

- [x] **财务管理模块** (`src/features/finance/`)
  - 应收/应付账款
  - 财务报表
  - 成本分析

---

## 中优先级 🟡

### 2. 功能完善

- [ ] **帮助中心页面** (`/help-center`)
  - 用户指南
  - 常见问题 (FAQ)
  - 视频教程

- [ ] **Clerk 认证集成**
  - 完整的登录/注册流程
  - 邮箱验证
  - 密码重置
  - OAuth 第三方登录

- [ ] **订单新增表单优化**
  - 完善表单验证
  - 错误处理优化
  - 用户体验改进

- [ ] **发货管理功能验证**
  - [ ] 发货单列表测试
  - [ ] 未发货列表测试
  - [ ] Sidebar 导航验证

---

## 低优先级 🟢

### 3. 增强功能

- [ ] **应用集成页面** (Apps)
  - 第三方应用对接
  - API 密钥管理
  - 集成状态展示

- [ ] **数据导入/导出**
  - Excel 导入导出
  - 数据备份

- [ ] **通知系统**
  - 站内信
  - 邮件通知
  - 短信通知（可选）

---

## 已完成 ✅

### 核心功能

- [x] Dashboard 首页仪表盘
- [x] 订单管理 (订单列表、订单分项、新增订单)
- [x] 发货管理 (已发货列表、未发货列表)
- [x] 客户管理
- [x] 报价单管理
- [x] 统计报表 (月度、客户年度、行业、产品)
- [x] 用户管理
- [x] 任务管理
- [x] 设置页面 (Profile, Account, Appearance, Notifications, Display)
- [x] 即时通讯/收件箱
- [x] 错误页面 (401, 403, 404, 500, 503)

### 技术特性

- [x] Light/dark mode
- [x] 响应式设计
- [x] RTL 支持
- [x] 全局搜索命令
- [x] TanStack Router 路由系统
- [x] TanStack Query 数据请求
- [x] ESLint + Prettier 代码规范

---

## 参考文档

- 项目文档: `README.md`
- 路由配置: `src/routes/`
- 功能模块: `src/features/`
- 后端 API: `backend/app/api/`
