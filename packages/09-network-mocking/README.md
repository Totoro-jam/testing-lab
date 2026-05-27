# 09 · 网络 mock (MSW)

测试涉及网络时,有三种思路:

| 思路 | 例子 | 评价 |
|---|---|---|
| Mock 自己的 fetch wrapper | `vi.mock('./api')` | 简单,但只能测"假装调了 api" |
| Mock 底层 fetch / axios | `vi.stubGlobal('fetch', ...)` | 能验证请求 URL/body,但绕过了真实序列化逻辑 |
| **拦截网络层** | **MSW** | **真实 fetch → 假响应,最接近真实** |

MSW (Mock Service Worker) 是社区共识。**前后端用同一套 handler,浏览器、Node、e2e 都能跑。**

---

## 1. MSW 核心心智模型

> MSW 假装是一个"在网络层蹲点的代理",所有网络请求经过它时,匹配到的请求返回你写的响应,不匹配的请求穿透到真服务。

它**不替换 fetch**,而是用浏览器 Service Worker(浏览器端)或 Node 的 undici interceptor(Node 端)在更低的层拦。
所以你的代码用 `fetch` / `axios` / `XMLHttpRequest` 都行,完全不用改。

---

## 2. 定义 handler

```ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('https://api.example.com/users/:id', ({ params }) => {
    return HttpResponse.json({ id: Number(params.id), name: 'Alice' })
  }),

  http.post('https://api.example.com/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 1, ...body }, { status: 201 })
  }),

  http.get('https://api.example.com/error', () => {
    return new HttpResponse('boom', { status: 500 })
  }),
]
```

支持的方法:`http.get / post / put / patch / delete / all`。
返回:`HttpResponse.json(data, init?)` 或 `new HttpResponse(body, init?)`。

---

## 3. Node 测试里启动 server

```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// vitest 的 setupFile 里:
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())  // 还原临时 use(...) 的 handler
afterAll(() => server.close())
```

`onUnhandledRequest: 'error'`:**强制要求所有网络请求都得有 handler 命中**,否则报错 —— 帮你立刻发现"哎我代码还在打真服务"。

---

## 4. 单测里临时改 handler

```ts
import { server } from './setup'
import { http, HttpResponse } from 'msw'

it('500 时显示错误', async () => {
  server.use(
    http.get('https://api.example.com/users/:id', () =>
      new HttpResponse('boom', { status: 500 })
    )
  )

  await expect(fetchUser(1)).rejects.toThrow(/500/)
})
// afterEach 会自动 resetHandlers,下个测试又用默认 handler
```

---

## 5. 何时用 MSW、何时直接 mock 函数

| 场景 | 推荐 |
|---|---|
| 组件测试 / hook 测试 | MSW(真实 fetch,DOM 行为真实) |
| 业务函数纯逻辑 | 直接 mock 你的 api 函数(`vi.mock('./api')`),不走网络层 |
| 测错误处理分支 | MSW + `server.use` 临时改成 500 |
| 集成测试 | MSW + 一组业务 handler |
| 全 e2e | Playwright + 真实后端 / 网络层 stub(后续章节) |

---

## 6. 常见坑

1. **Node 18+ 自带的 fetch**:MSW 2.x 已支持,但要 `npm i undici@latest`,且 Node 必须 ≥18。
2. **vitest 用 happy-dom 时**:happy-dom 的 fetch 不被 MSW 拦,要切到 `jsdom` 或在 Node 环境跑。
3. **handler 不匹配静默失败**:务必加 `onUnhandledRequest: 'error'`。
4. **handler 文件别和业务代码耦合**:MSW handler 是 fixtures,应该放在 `tests/mocks/` 下,不应被生产代码 import。
