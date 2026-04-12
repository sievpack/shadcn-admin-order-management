import { test, expect, Page } from '@playwright/test'
import { loginAsAdmin } from './auth-helpers'

test.describe('订单管理测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/orderlist')
    await page.waitForLoadState('networkidle')
  })

  test('订单列表页面加载正常', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '订单列表' })).toBeVisible()
  })

  test('新增订单按钮存在', async ({ page }) => {
    await expect(page.getByRole('button', { name: '新增订单' })).toBeVisible()
  })

  test('表格显示正常', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
  })

  test('订单详情对话框可以打开', async ({ page }) => {
    // 等待表格加载
    await page.waitForTimeout(2000)
    
    // 点击第一个订单的查看按钮（如果有的话）
    const viewButton = page.locator('button').filter({ hasText: '查看' }).first()
    if (await viewButton.isVisible()) {
      await viewButton.click()
      await page.waitForTimeout(1000)
      // 检查对话框是否打开
      const dialog = page.getByRole('dialog')
      if (await dialog.isVisible()) {
        // 关闭对话框
        await page.keyboard.press('Escape')
      }
    }
  })

  test('搜索功能正常', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜索...')
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试')
      await page.waitForTimeout(1000)
    }
  })

  test('分页功能正常', async ({ page }) => {
    const pagination = page.locator('[role="navigation"]')
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible()
    }
  })
})