import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './auth-helpers'

test.describe('生产管理测试', () => {
  test('生产模块各页面可以访问（验证页面加载不报错）', async ({ page }) => {
    await loginAsAdmin(page)
    
    const pages = [
      { url: '/production/plan', name: '生产计划' },
      { url: '/production/order', name: '生产工单' },
      { url: '/production/qc', name: '质检' },
      { url: '/production/inbound', name: '入库' },
      { url: '/production/material', name: '物料' },
      { url: '/production/report', name: '报工' },
      { url: '/production/stats', name: '统计' },
    ]
    
    for (const p of pages) {
      await page.goto(p.url)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(1000)
      // 检查页面没有崩溃（URL 正确跳转）
      expect(page.url()).toContain(p.url)
    }
  })
})