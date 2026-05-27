import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,                    // 同文件内的测试也并行
  forbidOnly: !!process.env.CI,           // CI 上禁止 .only 提交
  retries: process.env.CI ? 2 : 0,        // CI 失败重试 2 次,本地不重试(更快暴露脆弱测试)
  workers: process.env.CI ? 2 : undefined,// 本地用全 CPU,CI 限制 worker 数
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'https://example.com',
    trace: 'on-first-retry',   // 失败重试时录 trace —— 排查脆弱测试神器
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // 跨浏览器 / 设备矩阵
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    // 移动:
    // { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],

  // 本地起 dev server 后再跑(真实项目常用)
  // webServer: {
  //   command: 'pnpm dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },
})
