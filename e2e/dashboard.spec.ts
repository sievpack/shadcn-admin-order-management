import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './auth-helpers'

test.describe('仪表盘测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('仪表盘页面加载正常', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible()
  })

  test('统计卡片显示正常', async ({ page }) => {
    await expect(page.getByText('今日发货')).toBeVisible()
    await expect(page.getByText('今日订单')).toBeVisible()
    await expect(page.getByText('本月发货')).toBeVisible()
    await expect(page.getByText('本月订单')).toBeVisible()
    await expect(page.getByText('本月外调')).toBeVisible()
    await expect(page.getByText('未发货订单')).toBeVisible()
  })

  test('刷新数据按钮功能正常', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: '刷新数据' })
    await expect(refreshButton).toBeVisible()
    
    await refreshButton.click()
    // 等待加载完成
    await page.waitForTimeout(1000)
    
    // 刷新后页面应该正常显示
    await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible()
  })

  test('最近订单组件显示正常', async ({ page }) => {
    await expect(page.getByText('最近订单')).toBeVisible()
  })

  test('最近发货组件显示正常', async ({ page }) => {
    await expect(page.getByText('最近发货')).toBeVisible()
  })
})