import { test, expect, request } from '@playwright/test'

const BASE_URL = 'http://localhost:8000/api'

test.describe('后台接口测试（只读+新建，不删除）', () => {
  // 在所有测试开始前先获取 token
  test.beforeAll(async () => {
    const context = await request.newContext()
    const response = await context.post(`${BASE_URL}/auth/login`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        username: 'admin',
        password: '123456',
      },
    })
    
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.code).toBe(0)
    
    // 存储到全局
    const token = data.data.token
    process.env.AUTH_TOKEN = token
    console.log(`Token obtained`)
  })

  test('1. 获取当前用户信息', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
    expect(data.data.username).toBe('admin')
  })

  test('2. 客户列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/customer/data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { query: 'list', page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
    expect(data.count).toBeDefined()
    expect(Array.isArray(data.data)).toBeTruthy()
  })

  test('3. 订单列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/order/list/data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('4. 报价列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/quote/data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { query: 'list', page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('5. 物流列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/ship/shipping/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('6. 用户列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/user/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('7. 生产计划列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/production/plan/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('8. 生产工单列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/production/order/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('9. 质检记录列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/production/qc/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('10. 成品入库列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/production/inbound/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('11. 物料消耗列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/production/material/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('12. 报工记录列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/production/report/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('13. 生产统计接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/production/stats/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('14. 报表接口 - 月度统计', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/report/monthly`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { year: 2026, month: 4 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('15. 报表接口 - 行业统计', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/report/industry`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { year: 2026 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('16. 报表接口 - 产品统计', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/report/product`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { year: 2026 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('17. 订单统计接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/order/stats/sales-stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('18. 新建测试客户（不删除）', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const timestamp = Date.now()
    const response = await context.post(`${BASE_URL}/customer/create`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        客户名称: `测试客户_${timestamp}`,
        简称: `测试_${timestamp}`,
        联系人: '测试人员',
        联系电话: '13800138000',
        手机: '13900139000',
        结算方式: '月结',
        是否含税: false,
        业务负责人: 'admin',
        送货单版本: 'v1',
        收货地址: '测试地址',
        备注: 'E2E测试创建的客户',
        状态: '活跃',
      },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
    expect(data.data.id).toBeDefined()
    console.log(`创建测试客户成功，ID: ${data.data.id}`)
  })

  test('19. 新建测试报价单（不删除）', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const timestamp = Date.now()
    const response = await context.post(`${BASE_URL}/quote/create`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        报价单号: `QT_${timestamp}`,
        客户名称: '测试客户',
        报价项目: '测试项目',
        嘉尼索规格: '规格A',
        嘉尼索型号: '型号A',
        含税单价: 100.0,
        含税总价: 500.0,
        备注: 'E2E测试创建',
      },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
    console.log(`创建测试报价单成功`)
  })

  test('20. 字典类型列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/dict/type`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page: 1, limit: 10 },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })

  test('21. 字典数据列表接口', async () => {
    const token = process.env.AUTH_TOKEN
    const context = await request.newContext()
    const response = await context.get(`${BASE_URL}/dict/data/type/customer_status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.code).toBe(0)
  })
})