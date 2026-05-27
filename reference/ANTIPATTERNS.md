# 测试反模式(必须避开)

> 见到下面任何一种,立刻在 PR 上 -1。

---

## 1. 没断言的测试 ❌

```ts
it('do something', () => {
  doSomething()
})
```

跑过但什么都没验证。**覆盖率会蹭蹭上,bug 一个不抓**。

---

## 2. 恒真断言 ❌

```ts
expect(true).toBe(true)
expect(x).toBeDefined()  // 几乎任何值都过
expect(arr).toBeTruthy() // 空数组都是 truthy
```

最常见出现场景:写不出来怎么测,先放个占位 → 然后忘了改。

---

## 3. 测实现细节 ❌

```ts
// 测组件内部 state
expect(wrapper.vm.someInternalRef).toBe(...)

// 测私有方法
expect(obj._privateHelper()).toBe(...)

// 测 mock 自己被调
expect(mockUtil).toHaveBeenCalled()  // 但不测 mock 影响的结果
```

**重构一改就塌**。改测公开行为(DOM、返回值、副作用)。

---

## 4. 时间真等 ❌

```ts
await new Promise(r => setTimeout(r, 1000))  // ❌
await page.waitForTimeout(2000)              // ❌
```

慢、flaky、根本原因没解决。改成等条件:

```ts
await expect(screen.findByText('done')).toBeInTheDocument()
await page.waitForSelector('text=done')
await waitFor(() => expect(spy).toHaveBeenCalled())
```

---

## 5. 测试间共享状态 ❌

```ts
let cart  // 模块级

beforeAll(() => { cart = new Cart() })

it('add', () => { cart.add(...) })       // 改了 cart
it('count', () => { expect(cart.count).toBe(1) })   // 依赖上一个
```

**测试顺序变就挂**。永远在 beforeEach 重建,或 `it` 内部自建。

---

## 6. mock 自己要测的东西 ❌

```ts
vi.mock('./cart')

it('cart.add', () => {
  const cart = new Cart()
  cart.add(...)
  expect(cart.items).toHaveLength(1)  // 但 Cart 被 mock 了 —— 这是在测 vi.fn()
})
```

笑话。但 review 时经常见到。

---

## 7. 一个 it 测一切 ❌

```ts
it('cart 各种操作', () => {
  // 测 add
  // 测 remove
  // 测 total
  // 测 clear
  // 测 vip 折扣
})
```

挂了不知道哪段挂。拆成多个 it,失败定位 10 倍快。

---

## 8. 重复整段 setup ❌

```ts
it('a', () => {
  const u = makeBigComplexUser(...)
  const ctx = ...
  const setup = ...
  // 60 行 setup
  // 3 行 act + assert
})

it('b', () => {
  // 又抄一遍那 60 行
})
```

→ 提取到 beforeEach 或 factory。

---

## 9. 过度 mock ❌

```ts
vi.mock('./a')
vi.mock('./b')
vi.mock('./c')
vi.mock('./d')
vi.mock('./e')

it('main', () => {
  ...
})
```

mock 多到一个程度时,你测的不是真实代码,而是"mock 出来的世界"。**改成集成测试** —— 只 mock 边界(HTTP/时间),内部模块真调。

---

## 10. 大 snapshot ❌

```ts
expect(entireHugeComponentDom).toMatchSnapshot()  // 500 行
```

任何改动都让快照失败。Review 时大家无脑 `--update`。改成精准断言:

```ts
expect(screen.getByRole('button')).toHaveTextContent('Submit')
expect(screen.getAllByRole('listitem')).toHaveLength(3)
```

---

## 11. 测试名太泛 ❌

```ts
it('test1')
it('works')
it('should not fail')
```

失败时 CI 输出像天书。

---

## 12. 用 try/catch 当断言 ❌

```ts
try {
  doSomething()
  expect(true).toBe(false)  // 不该到这
} catch (e) {
  expect(e.message).toBe('boom')
}
```

写法绕。直接 `expect(() => ...).toThrow('boom')`。

---

## 13. flaky 测试 ✅ 修,❌ 重试

```js
// jest.config: retries 3   ← 这是地狱开局
```

flaky 测试用重试压住,几个月后所有人会失去对测试的信任。**flaky 必须立刻修或 quarantine,不能装作没看见**。

---

## 14. CI 跑通本地跑不通 ❌

通常是:
- 时区差异(`new Date()` 在两边不同)
- 文件路径大小写(Mac 不敏感,Linux 敏感)
- 随机种子未锁定
- 网络依赖(MSW 没开 onUnhandledRequest:'error')

→ 修根因,不要 `if (process.env.CI) skip()`。

---

## 15. 慢得没人愿意跑 ❌

测试 > 10s 就有人开始 `--skip`,> 60s 就没人跑全量。

提速思路:
- 单元测试占 80%+,组件 + e2e 是少数
- vitest 默认并行
- `--shard` 在 CI 拆机器
- `vitest related` 只跑相关
- mock 慢的边界(网络、磁盘)
