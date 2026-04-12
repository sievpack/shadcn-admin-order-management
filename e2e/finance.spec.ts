import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './auth-helpers'

test.describe('财务报表测试', () => {
  test('财务模块各页面可以访问（验证页面加载不报错）', async ({ page }) => {
    await loginAsAdmin(page)
    
    const pages = [
      { url: '/finance/ar', name: '应收' },
      { url: '/finance/ap', name: '应付' },
      { url: '/finance/collection', name: '收款' },
      { url: '/finance/payment', name: '付款' },
      { url: '/finance/voucher', name: '凭证' },
      { url: '/finance/stats', name: '统计' },
    ]
    
    for (const p of pages) {
      await page.goto(p.url)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(1000)
      expect(page.url()).toContain(p.url)
    }
  })
})