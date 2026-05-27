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
await expect(async () => {
  await fetchUser(-1)
}).rejects.toThrow('invalid id')
```

**经验:能用 `.resolves/.rejects` 就不要用 try/catch,可读性差距很大。**

---

## 假定时器(fake timers):时间穿越

测试涉及 `setTimeout/setInterval/Date.now` 时,不要真的 sleep,用假定时器。

```ts
import { vi } from 'vitest'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())  // 必须还原!不然影响其他测试

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

最常踩的坑:Promise resolve 排进 microtask queue,但 fake timer 不会自动 flush microtasks。

```ts
it('retry 重试 3 次后 reject', async () => {
  vi.useFakeTimers()
  const promise = retry(() => Promise.reject('boom'), { times: 3, delay: 100 })

  // 必须用 advanceTimersByTimeAsync,它会在每次 tick 后 flush microtasks
  await vi.advanceTimersByTimeAsync(300)
  await expect(promise).rejects.toBe('boom')
})
```

**规则:fake timer + Promise = 用 `advanceTimersByTimeAsync` / `runAllTimersAsync`。**

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
