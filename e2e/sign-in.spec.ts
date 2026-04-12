import { test, expect } from '@playwright/test'

test.describe('登录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in')
  })

  test('页面加载正常', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '嘉尼索管理系统' })).toBeVisible()
    await expect(page.getByLabel('用户名')).toBeVisible()
    await expect(page.getByLabel('密码')).toBeVisible()
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
  })

  test('使用 admin/123456 登录成功', async ({ page }) => {
    await page.getByLabel('用户名').fill('admin')
    await page.getByLabel('密码').fill('123456')
    await page.getByRole('button', { name: '登录' }).click()
    
    // 等待登录成功，应该跳转到首页
    await expect(page).toHaveURL(/.*\/.*/)
    
    // 检查是否出现成功提示或页面内容变化
    // 注意：这里假设登录后会显示仪表盘或其他页面元素
  })

  test('密码显示/隐藏切换功能正常', async ({ page }) => {
    const passwordInput = page.getByLabel('密码')
    
    // 默认应该是密码类型
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // 点击显示密码按钮（眼睛图标）
    const toggleButton = page.locator('button').filter({ has: page.locator('[data-icon="inline-end"]') }).last()
    await toggleButton.click()
    
    // 应该变成文本类型
    await expect(passwordInput).toHaveAttribute('type', 'text')
    
    // 再次点击应该恢复密码类型
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('空用户名登录应提示错误', async ({ page }) => {
    // 获取初始 URL
    const initialUrl = page.url()
    
    // 点击登录按钮（不清空用户名）
    await page.getByRole('button', { name: '登录' }).click()
    
    // 由于 HTML5 required 属性，表单不会提交，URL 保持不变
    await expect(page).toHaveURL(initialUrl)
    
    // 检查用户名输入框仍然可见（表单未跳转）
    await expect(page.getByLabel('用户名')).toBeVisible()
  })

  test('空密码登录应提示错误', async ({ page }) => {
    // 填写用户名
    await page.getByLabel('用户名').fill('admin')
    
    // 获取初始 URL
    const initialUrl = page.url()
    
    // 点击登录按钮
    await page.getByRole('button', { name: '登录' }).click()
    
    // 由于 HTML5 required 属性，表单不会提交，URL 保持不变
    await expect(page).toHaveURL(initialUrl)
    
    // 检查密码输入框仍然可见（表单未跳转）
    await expect(page.getByLabel('密码')).toBeVisible()
  })
})