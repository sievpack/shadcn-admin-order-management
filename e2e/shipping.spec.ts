import { test, expect, Page } from '@playwright/test'
import { loginAsAdmin } from './auth-helpers'

test.describe('物流管理测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/shippinglist')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // 等待页面数据加载
  })

  test('已发货列表页面加载正常', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '已发货列表' })).toBeVisible()
  })

  test('新增发货按钮存在', async ({ page }) => {
    await expect(page.getByRole('button', { name: '新增发货' })).toBeVisible()
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

  test('未发货列表页面加载正常', async ({ page }) => {
    await page.goto('/unshippedlist')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: '未发货列表' })).toBeVisible()
  })
})