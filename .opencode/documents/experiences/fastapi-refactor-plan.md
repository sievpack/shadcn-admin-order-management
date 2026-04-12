# 任务计划：FastAPI 后台重构与前端对接

## 目标
使用 fastapi-templates 重构后台，采用 Repository + Service 层架构，实现与前端的完整对接。

## 用户选择
- **数据库**: 保持 MSSQL（同步）
- **重构范围**: 完整重构
- **兼容性**: 不保持向后兼容
- **优先级**: 基础设施优先

## 当前阶段
阶段 1：需求与发现 - 已完成

---

## 详细实施计划

### 阶段 1：基础设施重构
**目标**: 建立 Repository + Service 基础架构

**任务**:
1. 创建 `app/repositories/` 目录结构
2. 创建 `app/services/` 目录结构
3. 实现 BaseRepository 基础类
4. 实现 BaseService 基础类
5. 重构数据库连接管理

**交付物**:
- `app/repositories/base_repository.py` - 基础 Repository
- `app/services/base_service.py` - 基础 Service
- `app/core/database.py` - 重构后的数据库管理

### 阶段 2：认证/用户模块重构
**目标**: 重构用户和认证 API

**任务**:
1. 重构 UserRepository
2. 重构 AuthService
3. 重构 User API endpoints
4. 创建 Pydantic Schemas

**交付物**:
- `app/repositories/user_repository.py`
- `app/services/user_service.py`
- `app/schemas/user.py`
- `app/api/v1/endpoints/user.py`

### 阶段 3：订单模块重构
**目标**: 重构订单相关 API

**任务**:
1. 重构 OrderRepository
2. 重构 OrderService
3. 重构 Order API (list, item, processing_print)
4. 更新 Pydantic Schemas

**交付物**:
- `app/repositories/order_repository.py`
- `app/services/order_service.py`
- `app/schemas/order.py`
- `app/api/v1/endpoints/order.py`

### 阶段 4：其他业务模块重构
**目标**: 重构客户、生产、财务等模块

**模块**:
- 客户管理 (customer)
- 生产管理 (production)
- 财务管理 (finance)
- 发货管理 (ship)
- 字典管理 (dict)

### 阶段 5：前端对接测试
**目标**: 确保前端与后端正常对接

**任务**:
1. 验证 API 接口格式
2. 修复数据转换问题
3. 测试 CRUD 操作

---

## 当前阶段状态
**阶段 1：基础设施重构** - 待开始

## 下一步行动
准备开始阶段 1：
1. 创建项目目录结构
2. 实现 BaseRepository
3. 实现 BaseService
4. 更新数据库配置

---

## 已完成决策
| 决策 | 理由 |
|------|------|
| 保持 MSSQL 同步 | 快速实施，现有数据已在 MSSQL |
| 完整重构 | 全面采用新架构 |
| 不保持兼容 | 直接替换，前端同步调整 |
| 基础设施优先 | 建立好架构再填充业务 |

## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
|      | 1       |         |

## 备注
- 当前后台使用同步 SQLAlchemy
- 前端使用 TanStack Query，需要统一返回格式 {code, msg, data}
