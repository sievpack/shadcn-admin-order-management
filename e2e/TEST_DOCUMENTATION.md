# Playwright E2E 测试文档

## 项目概述

- **项目名称**: shadcn-admin
- **技术栈**: React 19 + Vite 8 + TanStack Router + Tailwind CSS 4 + shadcn/ui
- **测试框架**: Playwright
- **测试浏览器**: Microsoft Edge
- **前端地址**: http://localhost:5173
- **后端地址**: http://localhost:8000

---

## 测试时间

2026-04-09

---

## 测试结果总览

| 指标 | 数值 |
|------|------|
| 总测试用例 | 58 |
| 通过 | 57 |
| 失败 | 1 |
| 通过率 | 98.3% |

---

## 一、前端 E2E 测试

### 1.1 测试文件列表

| 文件 | 测试用例数 | 通过 | 状态 |
|------|-----------|------|------|
| sign-in.spec.ts | 5 | 5 | ✅ |
| dashboard.spec.ts | 5 | 5 | ✅ |
| customer.spec.ts | 5 | 5 | ✅ |
| order.spec.ts | 6 | 6 | ✅ |
| quote.spec.ts | 4 | 4 | ✅ |
| shipping.spec.ts | 6 | 6 | ✅ |
| user-management.spec.ts | 4 | 4 | ✅ |
| production.spec.ts | 1 | 1 | ✅ |
| finance.spec.ts | 1 | 1 | ✅ |
| reports.spec.ts | 1 | 1 | ✅ |
| **合计** | **38** | **38** | **✅** |

### 1.2 登录功能测试 (5/5 通过)

| 用例 | 状态 | 说明 |
|------|------|------|
| 页面加载正常 | ✅ | 登录页面标题、输入框、按钮均正常显示 |
| 使用 admin/123456 登录成功 | ✅ | 登录流程正常，URL 正确跳转 |
| 密码显示/隐藏切换功能正常 | ✅ | 眼睛图标切换功能正常 |
| 空用户名登录应提示错误 | ✅ | HTML5 required 验证正常 |
| 空密码登录应提示错误 | ✅ | HTML5 required 验证正常 |

### 1.3 仪表盘测试 (5/5 通过)

| 用例 | 状态 | 说明 |
|------|------|------|
| 仪表盘页面加载正常 | ✅ | 页面正常显示 |
| 统计卡片显示正常 | ✅ | 6个统计卡片正常显示 |
| 刷新数据按钮功能正常 | ✅ | 按钮可点击 |
| 最近订单组件显示正常 | ✅ | 组件正常加载 |
| 最近发货组件显示正常 | ✅ | 组件正常加载 |

### 1.4 客户管理测试 (5/5 通过)

| 用例 | 状态 | 说明 |
|------|------|------|
| 客户列表页面加载正常 | ✅ | 页面正常显示 |
| 表格显示正常 | ✅ | 数据表格正常加载 |
| 新增客户功能 | ✅ | 可正常打开对话框并填写 |
| 搜索客户功能 | ✅ | 搜索功能正常响应 |
| 分页功能正常 | ✅ | 分页控件正常显示 |

### 1.5 订单管理测试 (6/6 通过)

| 用例 | 状态 | 说明 |
|------|------|------|
| 订单列表页面加载正常 | ✅ | 页面正常显示 |
| 新增订单按钮存在 | ✅ | 按钮正常显示 |
| 表格显示正常 | ✅ | 数据表格正常加载 |
| 订单详情对话框可以打开 | ✅ | 对话框正常弹出 |
| 搜索功能正常 | ✅ | 搜索功能正常响应 |
| 分页功能正常 | ✅ | 分页控件正常显示 |

### 1.6 报价管理测试 (4/4 通过)

| 用例 | 状态 | 说明 |
|------|------|------|
| 报价列表页面加载正常 | ✅ | 页面正常显示 |
| 新增报价按钮存在 | ✅ | 按钮正常显示 |
| 表格显示正常 | ✅ | 数据表格正常加载 |
| 搜索功能正常 | ✅ | 搜索功能正常响应 |

### 1.7 物流管理测试 (6/6 通过)

| 用例 | 状态 | 说明 |
|------|------|------|
| 已发货列表页面加载正常 | ✅ | 页面正常显示 |
| 新增发货按钮存在 | ✅ | 按钮正常显示 |
| 表格显示正常 | ✅ | 数据表格正常加载 |
| 搜索功能正常 | ✅ | 搜索功能正常响应 |
| 未发货列表页面加载正常 | ✅ | 页面正常显示 |

### 1.8 用户管理测试 (4/4 通过)

| 用例 | 状态 | 说明 |
|------|------|------|
| 用户列表页面加载正常 | ✅ | 页面正常显示 |
| 新增用户按钮存在 | ✅ | 按钮正常显示 |
| 表格显示正常 | ✅ | 数据表格正常加载 |
| 搜索功能正常 | ✅ | 搜索功能正常响应 |

### 1.9 生产/财务/报表模块测试 (3/3 通过)

| 用例 | 状态 | 说明 |
|------|------|------|
| 生产模块各页面可以访问 | ✅ | 7个子页面均可访问 |
| 财务模块各页面可以访问 | ✅ | 6个子页面均可访问 |
| 报表模块各页面可以访问 | ✅ | 4个子页面均可访问 |

---

## 二、后端 API 测试

### 2.1 测试文件

- `e2e/api.spec.ts` - 21 个测试用例

### 2.2 测试结果

| 用例 | 状态 | API 路径 | 说明 |
|------|------|----------|------|
| 1. 获取当前用户信息 | ✅ | /api/auth/me | Token 验证正常 |
| 2. 客户列表接口 | ✅ | /api/customer/data | 正常返回数据 |
| 3. 订单列表接口 | ✅ | /api/order/list/data | 已修复路由 |
| 4. 报价列表接口 | ✅ | /api/quote/data | 正常返回数据 |
| 5. 物流列表接口 | ✅ | /api/ship/shipping/list | 正常返回数据 |
| 6. 用户列表接口 | ✅ | /api/user/list | 正常返回数据 |
| 7. 生产计划列表接口 | ✅ | /api/production/plan/list | 正常返回数据 |
| 8. 生产工单列表接口 | ✅ | /api/production/order/list | 正常返回数据 |
| 9. 质检记录列表接口 | ✅ | /api/production/qc/list | 正常返回数据 |
| 10. 成品入库列表接口 | ✅ | /api/production/inbound/list | 正常返回数据 |
| 11. 物料消耗列表接口 | ✅ | /api/production/material/list | 正常返回数据 |
| 12. 报工记录列表接口 | ✅ | /api/production/report/list | 正常返回数据 |
| 13. 生产统计接口 | ✅ | /api/production/stats/summary | 已修复路由 |
| 14. 报表接口 - 月度统计 | ✅ | /api/report/monthly | 正常返回数据 |
| 15. 报表接口 - 行业统计 | ✅ | /api/report/industry | 正常返回数据 |
| 16. 报表接口 - 产品统计 | ✅ | /api/report/product | 正常返回数据 |
| 17. 订单统计接口 | ✅ | /api/order/stats/sales-stats | 已修复路由 |
| 18. 新建测试客户（不删除） | ✅ | /api/customer/create | 成功创建客户 ID: 14437 |
| 19. 新建测试报价单（不删除） | ❌ | /api/quote/create | 后端 bug |
| 20. 字典类型列表接口 | ✅ | /api/dict/type | 已修复路由 |
| 21. 字典数据列表接口 | ✅ | /api/dict/data/type/{dict_type} | 已修复路由 |

**通过**: 20/21

---

## 三、问题修复记录

### 3.1 修复的 API 路由问题

| 问题 | 修复前 | 修复后 |
|------|--------|--------|
| 订单列表接口 | /api/order/list | /api/order/list/data |
| 生产统计接口 | /api/production/stats/list | /api/production/stats/summary |
| 订单统计接口 | /api/order/stats | /api/order/stats/sales-stats |
| 字典类型接口 | /api/dict/type/list | /api/dict/type |
| 字典数据接口 | /api/dict/data/list | /api/dict/data/type/{dict_type} |

### 3.2 修复的登录逻辑问题

**问题**: `loginAsAdmin` 函数在非 sign-in 页面时直接返回，假设已登录

**修复**: 先访问首页检查实际登录状态，再决定是否执行登录

```typescript
// 修复前
if (!currentUrl.includes('/sign-in')) {
  return  // 错误：可能 session 已过期
}

// 修复后
await page.goto('/')
const currentUrl = page.url()
if (!currentUrl.includes('/sign-in')) {
  return  // 正确：先访问首页验证
}
```

---

## 四、已知问题

### 4.1 后端 Bug: 报价单创建失败

**问题描述**: 新建报价单接口返回 400 错误

**影响接口**: `POST /api/quote/create`

**根本原因**: `app/services/quote_service.py` 的 `create` 方法中删除了必填字段 `含税总价`

**问题代码**:
```python
def create(self, db: Session, **kwargs) -> Tuple[Optional[Quote], Optional[str]]:
    try:
        if '含税总价' in kwargs:
            del kwargs['含税总价']  # BUG: 含税总价是必填字段，不应删除
        quote = self.repo.create(db, **kwargs)
        return quote, None
```

**修复建议**: 移除 `quote_service.py` 中对 `含税总价` 的删除逻辑

---

## 五、测试文件结构

```
D:\shadcn-admin\e2e\
├── auth-helpers.ts              # 登录辅助函数
├── sign-in.spec.ts              # 登录功能测试 (5用例)
├── dashboard.spec.ts           # 仪表盘测试 (5用例)
├── customer.spec.ts            # 客户管理测试 (5用例)
├── order.spec.ts                # 订单管理测试 (6用例)
├── quote.spec.ts                # 报价管理测试 (4用例)
├── shipping.spec.ts             # 物流管理测试 (6用例)
├── user-management.spec.ts      # 用户管理测试 (4用例)
├── production.spec.ts           # 生产管理测试 (1用例)
├── finance.spec.ts              # 财务报表测试 (1用例)
├── reports.spec.ts              # 报表测试 (1用例)
├── api.spec.ts                  # 后台接口测试 (21用例)
└── TEST_REPORT.md               # 测试报告

D:\shadcn-admin\playwright.config.ts  # Playwright 配置
```

---

## 六、运行测试

### 6.1 运行所有测试

```bash
npx playwright test --project="Microsoft Edge"
```

### 6.2 运行前端测试

```bash
npx playwright test e2e/sign-in.spec.ts --project="Microsoft Edge"
npx playwright test e2e/dashboard.spec.ts --project="Microsoft Edge"
npx playwright test e2e/customer.spec.ts --project="Microsoft Edge"
```

### 6.3 运行 API 测试

```bash
npx playwright test e2e/api.spec.ts --project="Microsoft Edge"
```

### 6.4 生成 HTML 报告

```bash
npx playwright show-report
```

---

## 七、测试设计原则

1. **只读+新建，不删除**: 后端接口测试遵循不删除数据原则，保护系统安全
2. **Token 共享**: API 测试使用 `beforeAll` hook 统一获取 Token
3. **会话管理**: 前端测试使用 `beforeEach` hook 确保每个测试独立登录
4. **单线程执行**: Playwright 配置为单线程执行，避免并发问题

---

## 八、结论

本次测试覆盖了 shadcn-admin 项目的：

- ✅ 登录模块（5个测试）
- ✅ 仪表盘模块（5个测试）
- ✅ 客户管理模块（5个测试）
- ✅ 订单管理模块（6个测试）
- ✅ 报价管理模块（4个测试）
- ✅ 物流管理模块（6个测试）
- ✅ 用户管理模块（4个测试）
- ✅ 生产模块（1个测试）
- ✅ 财务模块（1个测试）
- ✅ 报表模块（1个测试）
- ✅ 后端 API（21个测试）

**总计**: 58 个测试用例，57 个通过，1 个失败（后端 bug）

---

**文档生成时间**: 2026-04-09 23:15
