# 09 · 网络 mock (MSW)

测试涉及网络时,有三种思路:

| 思路 | 例子 | 评价 |
|---|---|---|
| Mock 自己的 fetch wrapper | `vi.mock('./api')` | 简单,但只能测"假装调了 api" |
| Mock 底层 fetch / axios | `vi.stubGlobal('fetch', ...)` | 能验证请求 URL/body,但绕过了真实序列化逻辑 |
| **拦截网络层** | **MSW** | **真实 fetch → 假响应,最接近真实** |

[MSW (Mock Service Worker)](https://github.com/mswjs/msw) 是社区共识。**前后端用同一套 handler,浏览器、Node、e2e 都能跑。**

---

## 1. MSW 核心心智模型

> MSW 假装是一个"在网络层蹲点的代理",所有网络请求经过它时,匹配到的请求返回你写的响应,不匹配的请求穿透到真服务。

它**不替换 fetch**,而是在更低的层拦截。所以你的代码用 `fetch` / `axios` / `XMLHttpRequest` 都行,完全不用改。

### 浏览器端原理:Service Worker

[Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) 是浏览器原生 API,本来设计给 PWA 做离线缓存——它能拦截页面发出的所有网络请求。MSW 注册一个 SW,在里面匹配 handler,命中返回假数据,没命中放行:

```
你的代码                    Service Worker（独立线程）        真实网络
fetch("/api/users")  ──→  "fetch" 事件触发
                           ├── 匹配 handler？
                           │   是 → respondWith(假响应) ──→ 收到假响应
                           │   否 → 放行 ─────────────────→ 真实请求 → 收到真响应
```

**SW 生命周期**: 注册 → 安装 → 激活 → 才能拦截请求。正常 PWA 需要刷新页面后才被新 SW 控制,MSW 用 `skipWaiting()` + `clients.claim()` 跳过等待,注册后**立刻生效**。

注意事项:
- SW 运行在**独立线程**,不能访问 DOM
- 生产环境要求 **HTTPS**(`localhost` 例外)
- SW 是**持久化**的,关掉页面还在——测试跑完必须 `worker.stop()` 注销,否则会一直拦截请求

### Node 端原理:Monkey Patching

Node.js 没有 Service Worker。MSW 用 [@mswjs/interceptors](https://github.com/mswjs/interceptors) **替换 Node 内置的 `http.request` / `undici.fetch`**,本质和 `vi.spyOn` 一样的 Monkey Patching——把原始函数换成包装函数,命中 handler 就返回假响应,否则调原始方法。

### 和 `vi.mock` 的区别

| | `vi.mock('./api')` | MSW |
|---|---|---|
| 替换什么 | 你的业务代码(`fetchUser`) | 底层网络模块(`fetch`/`http`) |
| 业务代码感知 | 执行的是 `vi.fn()`,不走真实代码 | 业务代码正常执行,只是网络层返回假数据 |
| 覆盖范围 | 只替换你 mock 的那个函数 | 所有网络请求都经过,不管谁发的 |
| 真实度 | 低(跳过了序列化/反序列化) | 高(走完整的 fetch → parse 链路) |

---

## 2. MSW 使用四步流程

```
Step 1: 定义 handler（假 API）
         ↓
Step 2: 创建 server + setupFile（启动/清理）
         ↓
Step 3: 测试用例里正常写 fetch，MSW 自动拦截
         ↓
Step 4: 个别测试需要不同响应？用 server.use 临时覆盖
```

### Step 1: 定义 handler — "哪些 URL 返回什么数据"

在 `tests/mocks/handlers.ts` 里集中定义所有假 API:

```ts
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  // GET /users/:id → 返回用户数据
  http.get('https://api.example.com/users/:id', ({ params }) => {
    return HttpResponse.json({ id: Number(params.id), name: 'Alice' })
  }),

  // POST /users → 创建用户
  http.post('https://api.example.com/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 1, ...body }, { status: 201 })
  }),
]
```

handler 就像一个路由表:请求 URL 匹配上了,就返回你定义的假数据。

| API | 用途 |
|---|---|
| `http.get / post / put / patch / delete` | 匹配对应 HTTP 方法 |
| `http.all` | 匹配所有方法 |
| `HttpResponse.json(data, init?)` | 返回 JSON 响应 |
| `new HttpResponse(body, init?)` | 返回自定义响应(文本/HTML/错误等) |

### URL 匹配方式

MSW 支持多种 URL 匹配,从精确到模糊:

```ts
// 1. 精确路径
http.get('https://api.example.com/users', handler)
// 只匹配 GET https://api.example.com/users

// 2. 动态参数（:param）—— 类似 Express 路由
http.get('https://api.example.com/users/:id', ({ params }) => {
  console.log(params.id)  // "123"
  // 匹配 /users/123、/users/abc 等
})

// 多个动态参数
http.get('/orgs/:orgId/repos/:repoId', ({ params }) => {
  // params.orgId, params.repoId
})

// 3. 通配符（*）—— 匹配任意路径段
http.get('*/users/:id', handler)
// 匹配任何域名下的 /users/:id
// ✅ https://api.example.com/users/1
// ✅ https://other.com/users/1

// 4. 只写路径,不写域名 —— 匹配当前域
http.get('/api/users', handler)
// 等同于 http.get(`${location.origin}/api/users`, handler)

// 5. 正则表达式
http.get(/\/users\/\d+/, handler)
// 匹配 URL 中包含 /users/ 后跟数字的请求
// ✅ https://api.example.com/users/123
// ❌ https://api.example.com/users/abc
```

| 匹配方式 | 例子 | 适合场景 |
|---|---|---|
| 精确路径 | `'https://api.com/users'` | 固定接口 |
| 动态参数 `:param` | `'/users/:id'` | RESTful 路径参数 |
| 通配符 `*` | `'*/api/*'` | 不关心域名,或匹配任意子路径 |
| 省略域名 | `'/api/users'` | 前端同域请求 |
| 正则表达式 | `/\/users\/\d+/` | 复杂匹配规则 |

### handler 回调能拿到什么？

```ts
http.get('/users/:id', ({ request, params, cookies }) => {
  request.url          // 完整 URL
  request.headers      // 请求头
  await request.json() // 请求体(POST/PUT)
  params.id            // URL 路径参数
  cookies.token        // Cookie
})
```

| 参数 | 类型 | 说明 |
|---|---|---|
| `request` | `Request` | 标准 Fetch API 的 Request 对象 |
| `params` | `Record<string, string>` | `:param` 匹配到的路径参数 |
| `cookies` | `Record<string, string>` | 请求携带的 Cookie |

### Step 2: 创建 server + setupFile — "什么时候启动/关闭"

```ts
// tests/setup.ts — 在 vitest setupFile 里引入
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

export const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  //              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //              关键! 没有 handler 匹配的请求直接报错
  //              帮你发现"代码还在打真服务"
})

afterEach(() => {
  server.resetHandlers()
  // 每个测试结束后,还原 Step 4 里 server.use 临时加的 handler
})

afterAll(() => {
  server.close()  // 所有测试跑完,关闭拦截
})
```

在 `vitest.config.ts` 里注册 setupFile:

```ts
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
  },
})
```

### Step 3: 测试用例 — "正常写 fetch,MSW 自动拦截"

测试代码**完全不需要知道 MSW 的存在**,正常调业务函数就行:

```ts
// tests/userApi.test.ts
import { fetchUser } from '../src/userApi'

it('获取用户', async () => {
  // fetchUser 内部调 fetch("https://api.example.com/users/1")
  // MSW 自动拦截,返回 Step 1 定义的 { id: 1, name: "Alice" }
  const user = await fetchUser(1)

  expect(user).toEqual({ id: 1, name: 'Alice' })
  // 没有 vi.mock,没有 vi.fn,业务代码原样执行
})
```

### Step 4: 临时覆盖 handler — "这个测试需要不同的响应"

默认 handler 返回正常数据,但某个测试想测"服务器 500 怎么办":

```ts
import { server } from './setup'
import { http, HttpResponse } from 'msw'

it('500 时显示错误', async () => {
  // 临时覆盖:这个测试里 GET /users/:id 返回 500
  server.use(
    http.get('https://api.example.com/users/:id', () =>
      new HttpResponse('boom', { status: 500 })
    )
  )

  await expect(fetchUser(1)).rejects.toThrow(/500/)
  // afterEach 里 resetHandlers 会自动还原,下个测试又用默认 handler
})
```

### 完整的文件结构

```
tests/
├── setup.ts              ← Step 2: beforeAll/afterEach/afterAll
├── mocks/
│   └── handlers.ts       ← Step 1: 所有假 API 集中定义
├── userApi.test.ts       ← Step 3: 正常测试,MSW 自动拦截
└── errorHandling.test.ts ← Step 4: server.use 临时覆盖
```

### 数据流全貌

```
测试代码                    业务代码                  MSW server              真实网络
   │                         │                         │
   ├── fetchUser(1) ────────→│                         │
   │                         ├── fetch("/users/1") ──→│
   │                         │                         ├── 匹配 handler?
   │                         │                         │   是 → 返回假数据
   │                         │← { id:1, name:"Alice" }─┘   否 → 报错(onUnhandledRequest)
   │← user ──────────────────┤
   ├── expect(user)...       │
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

---

## 延伸阅读

- [MSW 官方文档](https://mswjs.io/) · [GitHub](https://github.com/mswjs/msw)
- [MSW — Node.js 集成](https://mswjs.io/docs/integrations/node)
- [nock](https://github.com/nock/nock) — Node.js 专用 HTTP mock(不支持浏览器)
