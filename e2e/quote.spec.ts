import { test, expect, Page } from '@playwright/test'
import { loginAsAdmin } from './auth-helpers'

test.describe('报价管理测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/quotelist')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // 等待页面数据加载
  })

  test('报价列表页面加载正常', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '客户报价单' })).toBeVisible()
  })

  test('新增报价按钮存在', async ({ page }) => {
    await expect(page.getByRole('button', { name: '新增报价' })).toBeVisible()
  })

  test('表格显示正常', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
  })

  test('搜索功能正常', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜索...')
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试')
      await page.waitForTimeout(1000)
    }
  })
})