# 11 · E2E 测试(Playwright)

E2E = 浏览器真的把你的 app 跑起来,模拟用户从头点到尾。

**为什么 Playwright 而不是 Cypress?**
| | Playwright | Cypress |
|---|---|---|
| 浏览器支持 | Chromium / Firefox / WebKit | 主要 Chromium(收费的支持其他) |
| 并行 | 进程并行,真快 | 同机器单线程,需要 Cloud 并行 |
| iframe / multi-tab | 原生支持 | 需要特殊 hack |
| API | 异步 await | 链式 cy.xxx |
| 维护方 | Microsoft | Cypress.io(商业) |

**新项目几乎都该选 Playwright**。Cypress 的优势是历史和文档,Playwright 的优势是技术。

---

## 1. 第一个测试

```ts
import { test, expect } from '@playwright/test'

test('打开主页能看到标题', async ({ page }) => {
  await page.goto('https://example.com')
  await expect(page).toHaveTitle(/Example Domain/)
  await expect(page.getByRole('heading', { name: 'Example Domain' })).toBeVisible()
})
```

注意三点:
1. `import` 来自 `@playwright/test`,不是 vitest
2. `page` 是 fixture,Playwright 自动注入
3. `expect(page).toXxx` 是 Playwright 自己的 expect,**自动重试到超时**(不用 sleep)

---

## 2. Locator —— 找元素的正确姿势

```ts
// ✅ 推荐:有语义的
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email')
page.getByPlaceholder('Search...')
page.getByText('Hello')
page.getByTestId('user-card')   // 配合 data-testid="..."

// ❌ 避免:CSS / XPath
page.locator('.btn-primary')    // 改个 class 就挂
page.locator('//button[1]')     // 鬼知道你想找谁
```

**Locator 是"惰性的"** —— 创建时不查 DOM,执行操作或断言时才查,所以可以提前定义、反复使用。

---

## 3. 自动重试是 Playwright 的精髓

```ts
// 不需要写 waitForSelector
await expect(page.getByText('加载完成')).toBeVisible()  // 自动重试到 timeout
await page.getByRole('button').click()                  // 自动等元素可点
```

Playwright 的 `expect` 和 action 都是 auto-waiting,所以 **几乎不写显式 wait**。
如果你在测试里写了 `page.waitForTimeout(1000)`,99% 是 bug —— 立刻删,改成等条件。

---

## 4. 网络拦截

```ts
// route 拦截 API
await page.route('**/api/users/*', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ id: 1, name: 'mocked' }),
  })
})

// 之后 page.goto 触发的请求都会被拦
```

---

## 5. 写 e2e 的原则(很重要)

1. **每个测试自包含**:不依赖前一个测试的状态。`beforeEach` 重置数据。
2. **不测组件细节**:那是单元测试的活,e2e 测"关键用户旅程"
3. **数量受控**:5 个核心流程 > 50 个琐碎用例。e2e 慢,挂了排查难
4. **测试数据用 API/数据库直建**:不要 e2e 里点"注册 → 登录 → 改密码 → 终于到测试场景"
5. **失败必须可复现**:trace + screenshot + video 都开,远程 CI 失败也能本地复现

---

## 6. CI 必做配置

```ts
// playwright.config.ts
{
  forbidOnly: !!process.env.CI,    // 防止 .only 漏到 CI
  retries: process.env.CI ? 2 : 0, // CI 重试,本地不重试(暴露 flaky)
  workers: process.env.CI ? 2 : undefined,
  use: {
    trace: 'on-first-retry',       // 失败时录 trace
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  }
}
```

Trace viewer 是大杀器:`pnpm exec playwright show-trace trace.zip` 能时间轴回看每一步。

---

## 7. 项目目录结构建议

```
e2e/
├── playwright.config.ts
├── fixtures/        # 自定义 fixture(登录态、测试数据)
│   └── auth.ts
├── pages/           # Page Object Model
│   ├── LoginPage.ts
│   └── DashboardPage.ts
├── tests/
│   ├── auth.spec.ts
│   └── checkout.spec.ts
└── utils/           # 测试数据生成、API 直建
```

**Page Object Model** 适合中大型项目:把页面元素和操作封装成类,测试只写"业务流",元素改了改一处。

---

## 延伸阅读

- [Playwright 官方文档](https://playwright.dev/) · [GitHub](https://github.com/microsoft/playwright)
- [Cypress](https://github.com/cypress-io/cypress) — 另一个流行的 E2E 框架(对比用)
- [Playwright VS Code 扩展](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) — 编辑器内运行/调试 e2e
