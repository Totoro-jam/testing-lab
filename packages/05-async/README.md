# 05 · 异步测试

异步测试是 bug 高发区。本章只解决三个核心问题:

1. **怎么"等"异步函数跑完?**
2. **怎么测一个 Promise 一定会 reject?**
3. **怎么不真的等 5 秒就测出 `setTimeout(..., 5000)` 的逻辑?**

---

## 核心规则:必须 await 或 return

异步测试失败最常见的原因 —— 测试结束时,断言还没执行。

```ts
// ❌ 错:测试瞬间通过,因为 expect 在测试结束后才跑
it('bad', () => {
  fetchUser(1).then(u => {
    expect(u.name).toBe('Alice')  // 这行可能永远跑不到
  })
})

// ✅ 写法 1:await
it('good (await)', async () => {
  const u = await fetchUser(1)
  expect(u.name).toBe('Alice')
})

// ✅ 写法 2:return Promise(老式但仍支持)
it('good (return)', () => {
  return fetchUser(1).then(u => {
    expect(u.name).toBe('Alice')
  })
})
```

**死记:测试函数处理 Promise,要么 `async/await`,要么 `return`。**

---

## .resolves / .rejects:链式断言

```ts
// 断言 resolve 的值
await expect(fetchUser(1)).resolves.toEqual({ id: 1, name: 'Alice' })

// 断言 reject(必须 await,否则一样失效)
await expect(fetchUser(-1)).rejects.toThrow('invalid id')
await expect(fetchUser(-1)).rejects.toBeInstanceOf(RangeError)
```

vs try/catch 写法:

```ts
// 同样能用,但啰嗦
it('fetchUser(-1) 抛错', async () => {
  try {
    await fetchUser(-1)
    // 如果没抛错,手动让测试失败
    expect.unreachable('should have thrown')
  } catch (e) {
    expect(e).toBeInstanceOf(RangeError)
    expect((e as Error).message).toMatch('invalid id')
  }
})
```

**经验:能用 `.resolves/.rejects` 就不要用 try/catch。** 对比:

| | `.rejects` | try/catch |
|---|---|---|
| 行数 | 1 行 | 6-7 行 |
| 漏断言风险 | 无 | 忘写 `expect.unreachable` 则不抛错时假绿 |
| 可读性 | 一眼看出"期望拒绝" | 要读完整个 try/catch 块 |

---

## 假定时器(fake timers):时间穿越

测试涉及 `setTimeout/setInterval/Date.now` 时,不要真的 sleep,用假定时器。

```ts
import { vi } from 'vitest'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })  // 必须还原!不然影响其他测试

it('debounce 触发一次', () => {
  const fn = vi.fn()
  const debounced = debounce(fn, 300)
  debounced()
  debounced()
  debounced()
  vi.advanceTimersByTime(300)  // "快进" 300ms
  expect(fn).toHaveBeenCalledTimes(1)
})
```

常用 API:

| 操作 | API |
|---|---|
| 启用假定时器 | `vi.useFakeTimers()` |
| 还原 | `vi.useRealTimers()` |
| 快进 N ms | `vi.advanceTimersByTime(ms)` |
| 跑光所有定时器 | `vi.runAllTimers()` |
| 只跑一轮 pending | `vi.runOnlyPendingTimers()` |
| Mock Date | `vi.setSystemTime(new Date(...))` |

**坑:`useFakeTimers` 会把 `queueMicrotask/setImmediate` 也接管。某些库(比如 axios)依赖真的 microtask,要用 `vi.useFakeTimers({ toFake: ['setTimeout'] })` 精确控制。**

---

## 异步 + 假定时器混用

### 什么场景会遇到？

当你的代码里**既有 setTimeout 又有 Promise**,比如:
+

```ts
// 一个带延迟的重试函数 — setTimeout + Promise 混用
async function fetchWithRetry(fn, { times, delay }) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn()
    } catch {
      await new Promise(r => setTimeout(r, delay))  // ← setTimeout + Promise 同时出现
    }
  }
  throw new Error('all retries failed')
}
```

类似的场景还有:防抖函数返回 Promise、轮询接口、动画等待后回调。

### 坑在哪？

JS 有两个队列,执行顺序不同:

```
微任务队列 (microtask) ← Promise.then/await 排这里,优先级高
宏任务队列 (macrotask) ← setTimeout/setInterval 排这里,优先级低
```

`vi.advanceTimersByTime(300)` 是**同步的**——它只推进 setTimeout 的时钟,但不会等 Promise 完成:

```ts
it('❌ 错误写法', async () => {
  vi.useFakeTimers()
  const promise = fetchWithRetry(() => Promise.reject('boom'), { times: 3, delay: 100 })

  vi.advanceTimersByTime(300)  // 同步推进时钟,setTimeout 触发了
                                // 但 Promise.then 还挂在微任务队列里没执行
  await expect(promise).rejects.toThrow()  // ❌ 可能卡死或结果不对
})

it('✅ 正确写法', async () => {
  vi.useFakeTimers()
  const promise = fetchWithRetry(() => Promise.reject('boom'), { times: 3, delay: 100 })

  await vi.advanceTimersByTimeAsync(300)  // async 版本:每推进一步都会 flush 微任务队列
  await expect(promise).rejects.toThrow()  // ✅ 正常工作
})
```

### 选哪个？

| 方法 | 何时用 |
|---|---|
| `advanceTimersByTime` (同步) | 代码里只有 setTimeout,没有 Promise |
| `advanceTimersByTimeAsync` (异步) | 代码里 setTimeout + Promise 混用 |

**简单规则:只要被测代码里有 `async/await` 或 `Promise`,就用 `Async` 后缀版本。**

---

## 真实场景速查

| 场景 | 写法 |
|---|---|
| 测 axios/fetch 返回值 | `await expect(api()).resolves.toEqual(...)` |
| 测 throw async error | `await expect(api()).rejects.toThrow(...)` |
| 测 debounce/throttle | fake timers + `advanceTimersByTime` |
| 测轮询/重试 | fake timers + `advanceTimersByTimeAsync` |
| 测"今天是周一"的逻辑 | `vi.setSystemTime(...)` |
| 测 `Promise.all` 失败 | `await expect(...).rejects.toThrow()` |

---

## 延伸阅读

- [Vitest — Fake Timers](https://vitest.dev/api/vi.html#vi-usefaketimers)
- [Vitest — Async tests](https://vitest.dev/guide/testing-types.html)
- [@sinonjs/fake-timers](https://github.com/nicolo-ribaudo/sinon) — Vitest/Jest 假定时器的底层实现
- [Vitest API — vi](https://vitest.dev/api/vi.html)
