import { test, expect } from '@playwright/test'

test.describe('网络拦截', () => {
  test('用 route 拦截一次,只 mock 不发真请求', async ({ page }) => {
    let intercepted = false

    await page.route('https://example.com/', async route => {
      intercepted = true
      // 自己 fulfill 一个假响应
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>MOCKED</h1></body></html>',
      })
    })

    await page.goto('https://example.com')
    await expect(page.getByRole('heading', { name: 'MOCKED' })).toBeVisible()
    expect(intercepted).toBe(true)
  })

  test('continue 让真实请求通过,只是观测', async ({ page }) => {
    const seen: string[] = []

    await page.route('**/*', async route => {
      seen.push(route.request().url())
      await route.continue()
    })

    await page.goto('https://example.com')
    expect(seen.some(u => u.includes('example.com'))).toBe(true)
  })
})
