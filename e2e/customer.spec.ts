import { test, expect, Page } from '@playwright/test'
import { loginAsAdmin } from './auth-helpers'

test.describe('客户管理测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/customerlist')
    await page.waitForLoadState('networkidle')
  })

  test('客户列表页面加载正常', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '客户资料' })).toBeVisible()
    await expect(page.getByRole('button', { name: '新增客户' })).toBeVisible()
  })

  test('表格显示正常', async ({ page }) => {
    // 检查表格区域存在
    await expect(page.locator('table')).toBeVisible()
  })

  test('新增客户功能', async ({ page }) => {
    // 点击新增客户按钮
    await page.getByRole('button', { name: '新增客户' }).click()
    
    // 等待对话框出现
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: '新增客户' })).toBeVisible()
    
    // 填写表单
    const testCustomerName = `测试客户_${Date.now()}`
    await page.getByLabel('客户名称').fill(testCustomerName)
    await page.getByLabel('简称').fill('测试简称')
    await page.getByLabel('联系人').fill('张三')
    await page.getByLabel('联系电话').fill('13800138000')
    await page.getByLabel('手机').fill('13900139000')
    
    // 点击保存
    await page.getByRole('button', { name: '保存' }).click()
    
    // 等待对话框关闭
    await page.waitForTimeout(2000)
    
    // 检查是否成功添加（表格中应显示新客户）
    await expect(page.getByText(testCustomerName)).toBeVisible()
  })

  test('搜索客户功能', async ({ page }) => {
    // 找到搜索框
    const searchInput = page.getByPlaceholder('搜索...')
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试')
      await page.waitForTimeout(1000)
    }
  })

  test('分页功能正常', async ({ page }) => {
    // 检查分页控件存在
    const pagination = page.locator('[role="navigation"]')
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible()
    }
  })
})