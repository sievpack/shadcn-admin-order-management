# 客户样品页面设计方案

## 1. 概述

为已存在的客户样品表创建前端管理页面和后端接口，实现客户样品的增删改查、筛选和 PDF 导出功能。

**数据库表**：客户样品表（已存在）

**字段列表**：
| 字段 | 类型 | 说明 |
|------|------|------|
| ID | bigint | 主键 |
| 客户名称 | nvarchar(100) | 客户名称 |
| 样品单号 | nvarchar(100) | 样品订单编号 |
| 下单日期 | date | 下单日期 |
| 需求日期 | date | 需求日期（可空） |
| 规格 | nvarchar(100) | 产品规格 |
| 产品类型 | nvarchar(100) | 产品类型 |
| 型号 | nvarchar(100) | 型号 |
| 单位 | nvarchar(20) | 计量单位 |
| 数量 | numeric(9) | 数量 |
| 齿形 | nvarchar(60) | 齿形（可空） |
| 材料 | nvarchar(100) | 材料（可空） |
| 喷码要求 | nvarchar(100) | 喷码要求（可空） |
| 备注 | nvarchar(100) | 备注（可空） |
| 钢丝 | nvarchar(100) | 钢丝（可空） |

## 2. 目录结构

### 前端结构
```
src/features/customer-sample/
├── index.tsx                           # 页面入口
└── components/
    ├── customer-sample-columns.tsx      # 列定义
    ├── customer-sample-table.tsx        # 表格组件（含展开子表格）
    ├── customer-sample-dialogs.tsx     # 对话框集合
    ├── customer-sample-form-dialog.tsx  # 表单对话框（新增/编辑）
    ├── customer-sample-detail-dialog.tsx # 详情对话框（只读）
    ├── customer-sample-delete-dialog.tsx # 删除确认框
    ├── customer-sample-pdf.tsx         # PDF 导出组件
    ├── customer-sample-provider.tsx    # 状态管理
    └── data-table-row-actions.tsx      # 行操作

src/routes/_authenticated/customer-sample/index.tsx  # 路由
```

### 后端结构
```
backend/app/api/customer_sample.py           # API 层
backend/app/services/customer_sample_service.py   # Service 层
backend/app/repositories/customer_sample_repository.py # Repository 层
```

## 3. 功能列表

| 功能 | 说明 |
|------|------|
| 列表展示 | 主表格 + 可展开子表格展示完整信息 |
| 新增 | 表单对话框 |
| 编辑 | 表单对话框 |
| 查看详情 | 详情对话框（只读） |
| 删除 | 删除确认框（需输入 DELETE） |
| 批量删除 | 批量删除确认框（需输入 DELETE） |
| 筛选 | 按客户名称、产品类型、日期范围等筛选 |
| PDF导出 | 导出样品单据 |

## 4. 表格结构

### 主表格列
| 列名 | 说明 |
|------|------|
| 展开按钮 | 点击展开子表格 |
| 样品单号 | 订单编号 |
| 客户名称 | 客户名称 |
| 下单日期 | 下单日期 |
| 需求日期 | 需求日期 |
| 操作 | 编辑/删除按钮 |

### 展开子表格（全部字段）
| 规格 | 产品类型 | 型号 | 单位 | 数量 | 齿形 | 材料 | 喷码要求 | 钢丝 | 备注 |

## 5. PDF 导出样式

```
┌────────────────────────────────┐
│ 广东嘉尼索传动科技有限公司      │  ← 公司标题
│ 地址：...                       │
│ 电话：...                       │
├────────────────────────────────┤
│ 客户名称：xxx  样品单号：xxx   │  ← 客户信息区
│ 下单日期：xxx  需求日期：xxx   │    （含样品单号、下单日期）
├────────────────────────────────┤
│ 规格 │ 产品类型 │ 型号 │ 数量 │  ← 表格区
│ 规格 │ 产品类型 │ 型号 │ 数量 │
├────────────────────────────────┤
│ 制单人：xxx        第1/1页    │
└────────────────────────────────┘
```

**纸张尺寸**：58mm 小票打印机（参考已发货列表 PDF）

## 6. 后端接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /customer-sample/list | 获取列表（分页、筛选） |
| GET | /customer-sample/{id} | 获取详情 |
| POST | /customer-sample/create | 创建 |
| PUT | /customer-sample/update | 更新 |
| DELETE | /customer-sample/{id} | 删除 |

## 7. 技术规范

- **前端**：React 19 + TanStack Table + shadcn/ui
- **后端**：FastAPI + SQLAlchemy
- **PDF生成**：@react-pdf/renderer
- **状态管理**：Context + useDialogState
- **事务管理**：Service 层统一管理 commit
- **认证**：JWT（所有接口需要登录态）
