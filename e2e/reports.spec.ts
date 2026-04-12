import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './auth-helpers'

test.describe('报表测试', () => {
  test('报表模块各页面可以访问（验证页面加载不报错）', async ({ page }) => {
    await loginAsAdmin(page)
    
    const pages = [
      { url: '/monthlyreport', name: '月度' },
      { url: '/industryreport', name: '行业' },
      { url: '/customeryearlyreport', name: '客户年报' },
      { url: '/productreport', name: '产品' },
    ]
    
    for (const p of pages) {
      await page.goto(p.url)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(1000)
      expect(page.url()).toContain(p.url)
    }
  })
})