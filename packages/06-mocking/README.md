# 06 · Mock / Stub / Spy

测试里最让人混乱的三个词:

| 名词 | 你要它干啥 | 例子 |
|---|---|---|
| **spy** | 监视一个函数怎么被调用,但不改它的行为 | `vi.spyOn(obj, 'method')` — 还是原始实现,只是顺便记录调用 |
| **stub** | 把一个函数替换成"返回固定值"的假实现 | `vi.fn().mockReturnValue(42)` |
| **mock** | 把整个模块/类替换成假的 | `vi.mock('./api')` |

口诀:**spy 看不动,stub 装样子,mock 整个换。**

---

## 1. `vi.fn()` — 最基础的 mock function

```ts
const fn = vi.fn()
fn('a', 'b')
fn('c')

expect(fn).toHaveBeenCalledTimes(2)
expect(fn).toHaveBeenCalledWith('a', 'b')   // 任一次匹配
expect(fn).toHaveBeenNthCalledWith(2, 'c')  // 第 2 次必须是 ('c')
expect(fn).toHaveBeenLastCalledWith('c')
```

常用 mock 实现方法:

```ts
vi.fn().mockReturnValue(42)
vi.fn().mockReturnValueOnce(1).mockReturnValueOnce(2)  // 用完一次就消耗一个
vi.fn().mockResolvedValue({ ok: true })   // = mockReturnValue(Promise.resolve(...))
vi.fn().mockRejectedValue(new Error('x')) // 直接 reject
vi.fn().mockImplementation((a, b) => a + b)
```

---

## 2. `vi.spyOn` — 不动原实现,只看调用

```ts
const obj = {
  greet(name: string) { return `hi ${name}` }
}
const spy = vi.spyOn(obj, 'greet')

obj.greet('Alice')

expect(spy).toHaveBeenCalledWith('Alice')
expect(obj.greet('Bob')).toBe('hi Bob')  // 原实现还在
spy.mockRestore()  // 完事记得还原(全局对象尤其重要)
```

**何时用 spy 而不是 mock?**
- 想知道函数被调用没有,但不能改它的行为(例如 `console.log`)
- 临时换掉某个方法做断言,测完想还原(例如 `Date.now`)

---

## 3. `vi.mock` — 整个模块替换

```ts
import { fetchUser } from './api'
import { greetUser } from './service'

vi.mock('./api')  // 整个模块的所有 export 都被替换成 vi.fn()

it('greetUser 调 api 后拼字符串', async () => {
  vi.mocked(fetchUser).mockResolvedValue({ id: 1, name: 'Alice' })

  const msg = await greetUser(1)
  expect(msg).toBe('hello Alice')
  expect(fetchUser).toHaveBeenCalledWith(1)
})
```

**关键细节:**
- `vi.mock` 是 **hoisted**(被提升到文件顶部),即使写在 import 下面也先执行
- `vi.mocked(fn)` 只是 TS 类型助手,运行时等同 `fn as any`
- 想保留部分原实现:`vi.mock('./api', async () => ({ ...await vi.importActual('./api'), fetchUser: vi.fn() }))`

---

## 4. mock 全局对象 (window/fetch/console)

```ts
// 方式 A:vi.spyOn 全局对象
const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

// 方式 B:vi.stubGlobal — 干净利落,会被 vi.unstubAllGlobals 还原
vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
  new Response(JSON.stringify({ ok: true }))
))

// 在 vitest.config.ts 里加 unstubGlobals: true 可自动 afterEach 还原
```

---

## 5. 清理:何时清,清什么

| API | 作用 |
|---|---|
| `vi.clearAllMocks()` | 清调用记录(`mock.calls/results`),不动 implementation |
| `vi.resetAllMocks()` | 清记录 + 还原 implementation 为空 vi.fn() |
| `vi.restoreAllMocks()` | 还原所有 `spyOn` 创建的 spy 到原实现 |
| `vi.unstubAllGlobals()` | 还原 `stubGlobal` 设置 |

**最佳实践:vitest.config.ts 里开 `clearMocks: true` 或 `restoreMocks: true`,省得每个 beforeEach 都写一遍。**

---

## 6. 何时不该 mock(antipattern)

- 测自己的纯函数 — 不需要 mock,直接调
- 测两个内部模块的协作 — mock 反而掩盖真 bug,写集成测试更值
- mock 太多导致测试在测"我 mock 出来的世界" — 重构出 thin wrapper,只 mock 边界(HTTP、DB、time)

**原则:只 mock 三类东西 —— I/O(网络/磁盘)、时间、随机。其他都用真实现。**
