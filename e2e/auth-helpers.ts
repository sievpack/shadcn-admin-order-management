import { test, expect, Page } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  // 先访问首页检查登录状态
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  
  const currentUrl = page.url()
  if (!currentUrl.includes('/sign-in')) {
    // 已经登录，直接返回
    return
  }
  
  // 需要登录
  await page.getByLabel('用户名').fill('admin')
  await page.getByLabel('密码').fill('123456')
  await page.getByRole('button', { name: '登录' }).click()
  
  // 等待登录完成，最多等待 15 秒
  await page.waitForURL('**/', { timeout: 15000 })
}