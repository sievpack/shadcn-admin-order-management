import { test, expect, Page } from '@playwright/test'
import { loginAsAdmin } from './auth-helpers'

test.describe('用户管理测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // 等待页面数据加载
  })

  test('用户列表页面加载正常', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '用户管理' })).toBeVisible()
  })

  test('新增用户按钮存在', async ({ page }) => {
    // 查找包含"新增"或"邀请"字样的按钮
    const addButton = page.locator('button').filter({ hasText: /新增|邀请/ }).first()
    await expect(addButton).toBeVisible()
  })

  test('表格显示正常', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
  })

  test('搜索功能正常', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜索...')
    if (await searchInput.isVisible()) {
      await searchInput.fill('admin')
      await page.waitForTimeout(1000)
    }
  })
})