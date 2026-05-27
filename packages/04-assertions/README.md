# 04 - Assertions(断言全集 + 自定义匹配器)

> 把 `expect()` 链上所有常见的 matcher 一次过完。学完这章你打开任何测试文件都能立即看懂"它在断什么",反过来写测试时第一时间能选对 matcher。

## 前置

- 已学 [02-vitest-basics](../02-vitest-basics)

## 本章目标

- 掌握 6 大类共 ~40 个常用 matcher
- 知道 `toBe` vs `toEqual` vs `toStrictEqual` 的差异
- 会用 `expect.objectContaining` / `expect.arrayContaining` / `expect.stringMatching` 做"部分匹配"
- 能写自定义 matcher 解决业务专属断言

## 如何运行

```bash
cd packages/04-assertions
pnpm install
pnpm test
```

## 核心概念:6 大类 matcher

### 类别 1:相等性(equality)

| matcher | 用途 | 等价语义 |
|---|---|---|
| `toBe(x)` | 引用相等 / 原始值相等 | `Object.is(actual, x)` |
| `toEqual(x)` | 递归"结构相等",忽略 undefined 字段 | 深度比较 |
| `toStrictEqual(x)` | 同 toEqual,但要求类型完全一致(`undefined` 字段也要在) | 最严格 |

```ts
expect({a: 1}).toBe({a: 1})           // ❌ 不同引用
expect({a: 1}).toEqual({a: 1})        // ✅
expect({a: 1, b: undefined}).toEqual({a: 1})       // ✅ undefined 字段被忽略
expect({a: 1, b: undefined}).toStrictEqual({a: 1}) // ❌ 严格
```

**选择口诀**:对象/数组用 `toEqual`,原始值用 `toBe`,需要严格区分 undefined 字段用 `toStrictEqual`。

### 类别 2:真值/空值

```ts
expect(x).toBeTruthy()       // x 转 boolean 为 true
expect(x).toBeFalsy()        // x 转 boolean 为 false
expect(x).toBeNull()         // x === null
expect(x).toBeUndefined()    // x === undefined
expect(x).toBeDefined()      // x !== undefined
expect(x).toBeNaN()          // Number.isNaN(x)
```

**坑**:`toBeTruthy()` 接受 `'hello'`、`1`、`{}` 等;别用它当成 `toBe(true)`。

### 类别 3:数字

```ts
expect(x).toBeGreaterThan(3)        // x > 3
expect(x).toBeGreaterThanOrEqual(3) // x >= 3
expect(x).toBeLessThan(3)
expect(x).toBeLessThanOrEqual(3)
expect(x).toBeCloseTo(0.3, 2)       // 浮点近似,精度第 2 位
```

**`toBeCloseTo` 的存在理由**:`0.1 + 0.2 !== 0.3`(浮点精度)。所有涉及 `*/+/-` 的浮点比较都该用它。

### 类别 4:字符串/正则

```ts
expect('hello world').toMatch(/world/)        // 正则
expect('hello world').toMatch('world')        // 子串
expect('hello').toContain('he')               // 子串(更明确)
expect('hello').toHaveLength(5)               // 长度
```

### 类别 5:数组/集合

```ts
expect([1, 2, 3]).toContain(2)                       // 包含元素
expect([{id:1}, {id:2}]).toContainEqual({id: 1})     // 深度比较元素
expect([1, 2, 3]).toHaveLength(3)
```

`toContain` vs `toContainEqual`:前者是 `===`,后者是深度相等。对象数组永远用后者。

### 类别 6:对象 + 部分匹配

```ts
// 完整匹配
expect(user).toEqual({ id: 1, name: 'Alice', email: 'a@x.com' })

// 部分匹配(最有用!)
expect(user).toEqual(
  expect.objectContaining({ name: 'Alice' })
)

expect(users).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ id: 1 }),
  ])
)

expect(message).toEqual(expect.stringMatching(/^Error:/))
expect(message).toEqual(expect.stringContaining('Error'))

// 类型匹配
expect(now).toEqual(expect.any(Number))
expect(date).toEqual(expect.any(Date))
```

**`expect.objectContaining` 是最常被忽视但最有用的工具**——当你只关心对象的一部分字段时(比如 mock 调用参数),用它能避免脆弱的"全字段断言"。

### 类别 7:异常

```ts
// 抛错的代码必须包在函数里
expect(() => fn()).toThrow()                  // 任意错误
expect(() => fn()).toThrow('boom')            // 错误信息包含 'boom'
expect(() => fn()).toThrow(/boom/)            // 正则匹配
expect(() => fn()).toThrow(TypeError)         // 错误类
expect(() => fn()).toThrow(new Error('boom')) // 精确错误对象
```

**别忘了包函数**——直接 `expect(fn())` 会先执行抛错,断言就跑不到了。

### 类别 8:Mock 函数(详见第 06 章)

```ts
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(2)
expect(mockFn).toHaveBeenCalledWith('arg1', 42)
expect(mockFn).toHaveBeenLastCalledWith('arg1')
expect(mockFn).toHaveBeenNthCalledWith(2, 'arg2')
expect(mockFn).toHaveReturned()
expect(mockFn).toHaveReturnedWith(42)
```

### 类别 9:Promise

```ts
await expect(fetchUser(1)).resolves.toEqual({...})
await expect(fetchUser(0)).rejects.toThrow('Invalid')
```

**第 05 章详讲**。

### 类别 10:快照

```ts
expect(largeObject).toMatchSnapshot()         // 写到 __snapshots__/ 文件
expect(short).toMatchInlineSnapshot()         // 写到当前 .ts 文件
```

适合"结构复杂但稳定"的对象(UI 树、配置生成)。**别滥用**——一旦写了快照,任何输出变化都让测试失败,改起来烦。

### 类别 11:`.not.` 反向

任何 matcher 前加 `.not` 反向:

```ts
expect(x).not.toBe(5)
expect(arr).not.toContain(3)
```

## 自定义 matcher

当业务有反复出现的断言,值得抽:

```ts
expect.extend({
  toBeValidEmail(received: unknown) {
    const pass = typeof received === 'string' && received.includes('@')
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be valid email`
          : `Expected ${received} to be valid email`,
    }
  },
})

// 用
expect('a@x.com').toBeValidEmail()
```

加 TS 类型:

```ts
declare module 'vitest' {
  interface Assertion<T> {
    toBeValidEmail(): T
  }
}
```

## 代码导读

```
04-assertions/
├── src/                  ← 几乎不需要被测代码,本章重点在断言写法
│   └── examples.ts        ← 一些被断言的样本数据
└── tests/
    ├── equality.test.ts        ← toBe / toEqual / toStrictEqual
    ├── partial-match.test.ts   ← objectContaining / arrayContaining
    ├── exception.test.ts       ← toThrow 全姿势
    ├── snapshot.test.ts        ← 快照
    └── custom-matcher.test.ts  ← 自定义 matcher
```

## 常见坑

### 坑 1:`toBe({})` 永远失败

`{}` 和 `{}` 不是同一个引用。用 `toEqual({})`。

### 坑 2:全字段断言导致脆弱测试

```ts
// 你只关心 status,但断了整个对象
expect(response).toEqual({ status: 200, headers: {...}, body: {...}, time: 123 })
```

加个字段就挂。改用部分匹配:

```ts
expect(response).toEqual(expect.objectContaining({ status: 200 }))
```

### 坑 3:`toThrow` 接到了不该接的错

```ts
// 你期望抛 ValidationError,但代码抛了 TypeError
expect(() => fn()).toThrow()  // 仍然 pass!
```

宽泛的 `toThrow()` 会接所有错。**永远断错误的类型或消息**。

### 坑 4:快照变成"鸵鸟测试"

测试人员看到快照挂了,直接 `--update` 更新快照——根本没看变化是否合理。这等于没测。

**纪律**:每次快照变更必须 review diff。

## 延伸阅读

- [Vitest expect API](https://vitest.dev/api/expect.html)
- [Jest matchers](https://jestjs.io/docs/expect)
- [Custom matchers (vitest)](https://vitest.dev/guide/extending-matchers.html)

## 自测

1. `toBe`、`toEqual`、`toStrictEqual` 的差别?各自典型场景?
2. 为什么测浮点要用 `toBeCloseTo`?
3. 哪些场景该用部分匹配?
4. 自定义 matcher 的 `pass` 字段什么意思?为什么有两个 message?
