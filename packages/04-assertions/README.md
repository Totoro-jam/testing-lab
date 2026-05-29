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

**三者差异速查**:

| 场景 | `toBe` | `toEqual` | `toStrictEqual` |
|---|---|---|---|
| `1` vs `1` | ✅ | ✅ | ✅ |
| `{a:1}` vs `{a:1}`（不同引用） | ❌ | ✅ | ✅ |
| `{a:1, b:undefined}` vs `{a:1}` | ❌ | ✅ | ❌ |
| `[1,,3]` vs `[1,undefined,3]` | ❌ | ✅ | ❌ |
| `new Cat('Tom')` vs `{name:'Tom'}` | ❌ | ✅ | ❌ |

> `toBe` = 同一个引用（`===`）; `toEqual` = 长得一样就行; `toStrictEqual` = 长得一样且"血统"也一样。

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

**各值对各断言的结果速查**:

| 值 | `toBeDefined` | `toBeTruthy` | `toBeNull` | `toBeFalsy` |
|---|---|---|---|---|
| `undefined` | ❌ | ❌ | ❌ | ✅ |
| `null` | ✅ | ❌ | ✅ | ✅ |
| `0` | ✅ | ❌ | ❌ | ✅ |
| `''` | ✅ | ❌ | ❌ | ✅ |
| `'hello'` | ✅ | ✅ | ❌ | ❌ |
| `{}` | ✅ | ✅ | ❌ | ❌ |

### 类别 3:数字

```ts
expect(x).toBeGreaterThan(3)        // x > 3
expect(x).toBeGreaterThanOrEqual(3) // x >= 3
expect(x).toBeLessThan(3)
expect(x).toBeLessThanOrEqual(3)
expect(x).toBeCloseTo(0.3, 2)       // 浮点近似,精度第 2 位
```

**`toBeCloseTo` 的存在理由**:`0.1 + 0.2 !== 0.3`(浮点精度)。所有涉及 `*/+/-` 的浮点比较都该用它。

**数字断言对应运算符速查**:

| matcher | 等价运算符 | 记忆 |
|---|---|---|
| `toBeGreaterThan(3)` | `> 3` | Greater = 大于 |
| `toBeGreaterThanOrEqual(3)` | `>= 3` | 加 OrEqual = 多个 `=` |
| `toBeLessThan(3)` | `< 3` | Less = 小于 |
| `toBeLessThanOrEqual(3)` | `<= 3` | 同上 |
| `toBeCloseTo(0.3, 2)` | `≈ 0.3`（精度 2 位） | 浮点专用,别用 `toBe` |

### 类别 4:字符串/正则

```ts
expect('hello world').toMatch(/world/)        // 正则
expect('hello world').toMatch('world')        // 子串
expect('hello').toContain('he')               // 子串(更明确)
expect('hello').toHaveLength(5)               // 长度
```

**`toMatch` vs `toContain` 能力对比**:

| 能力 | `toMatch` | `toContain` |
|---|---|---|
| 字符串子串 | ✅ | ✅ |
| 正则表达式 | ✅ | ❌ |
| 数组元素 | ❌ | ✅ |

> 习惯:**字符串用 `toMatch`**(随时可升级为正则),**数组用 `toContain`**。

### 类别 5:数组/集合

```ts
expect([1, 2, 3]).toContain(2)                       // 包含元素
expect([{id:1}, {id:2}]).toContainEqual({id: 1})     // 深度比较元素
expect([1, 2, 3]).toHaveLength(3)
```

`toContain` vs `toContainEqual`:前者是 `===`,后者是深度相等。对象数组永远用后者。

**`toContain` vs `toContainEqual` 对比**:

| 场景 | `toContain` | `toContainEqual` |
|---|---|---|
| `[1,2,3]` 包含 `2` | ✅ | ✅ |
| `[{id:1}]` 包含 `{id:1}`（新对象） | ❌（引用不同） | ✅（结构相同） |

> 原始值数组用 `toContain`,对象数组用 `toContainEqual`。

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

**`xxxContaining` 系列的核心思想:只断言你关心的部分,忽略其余。**

| 匹配器 | 作用 | 典型场景 |
|---|---|---|
| `objectContaining({...})` | 对象包含这些字段就行,其余不管 | API 响应只关心 `{status: 200}` |
| `arrayContaining([...])` | 数组包含这些元素就行,顺序不限 | 权限列表只关心包含 `'admin'` |
| `stringContaining('x')` | 字符串包含子串就行 | 日志消息只关心有 `'error'` |
| `stringMatching(/x/)` | 字符串匹配正则就行 | 只关心格式正确 |
| `any(Number)` | 是这个类型就行,不管具体值 | 时间戳、随机 ID |
| `anything()` | 非 null/undefined 就行,类型也不管 | 只关心"有值" |

**`any` vs `anything` 对比**:

| 值 | `expect.any(Number)` | `expect.any(String)` | `expect.anything()` |
|---|---|---|---|
| `42` | ✅ | ❌ | ✅ |
| `'hello'` | ❌ | ✅ | ✅ |
| `new Date()` | ❌ | ❌ | ✅ |
| `null` | ❌ | ❌ | ❌ |
| `undefined` | ❌ | ❌ | ❌ |

> `any(X)` = 我不关心具体值,但**必须是 X 类型**。`anything()` = 我连类型都不关心,**有值就行**。

典型场景——API 返回的对象里有不可预测的字段:

```ts
expect(response).toEqual({
  id: expect.any(String),        // 随机 ID，只要是字符串就行
  createdAt: expect.any(Date),   // 时间戳，只要是 Date 就行
  data: expect.anything(),       // 什么都行，有值就行
})
```

它们可以**嵌套组合**:

```ts
// 用户列表里至少有一个 admin,且 email 格式合法
expect(users).toEqual(
  expect.arrayContaining([
    expect.objectContaining({
      role: 'admin',
      email: expect.stringMatching(/@/)
    })
  ])
)
```

**什么时候用**:对象有不稳定字段(时间戳/ID)、只关心关键参数、避免加字段就挂的脆弱测试。

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

**`toThrow` 第二参数类型对比**:

| 写法 | 匹配方式 |
|---|---|
| `toThrow()` | 任意错误（危险,太宽泛） |
| `toThrow('boom')` | `error.message` 包含子串 |
| `toThrow(/^Invalid/)` | `error.message` 匹配正则 |
| `toThrow(TypeError)` | `error instanceof TypeError` |
| `toThrow(new Error('x'))` | 精确匹配错误对象 |

> 最佳实践:至少断言错误类型或消息,不要裸 `toThrow()`。

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

**Mock 断言选择速查**:

| 你想验证什么 | 用哪个 |
|---|---|
| 有没有被调过 | `toHaveBeenCalled()` |
| 被调了几次 | `toHaveBeenCalledTimes(n)` |
| 某一次传了什么参数 | `toHaveBeenCalledWith(...)` |
| 最后一次传了什么 | `toHaveBeenLastCalledWith(...)` |
| 第 N 次传了什么 | `toHaveBeenNthCalledWith(n, ...)` |
| 返回值是什么 | `toHaveReturnedWith(...)` |

### 类别 9:Promise

```ts
await expect(fetchUser(1)).resolves.toEqual({...})
await expect(fetchUser(0)).rejects.toThrow('Invalid')
```

**Promise 断言注意点**:

| 写法 | 结果 |
|---|---|
| `await expect(p).resolves.toBe(1)` | ✅ 正确等待 |
| `expect(p).resolves.toBe(1)` (漏了 await) | ❌ 断言不生效,测试假绿 |

> 永远加 `await`,否则 Promise 还没 resolve 测试就结束了,断言被跳过但不报错。
>
> **防漏 await 的工具链方案**: 配置 `eslint-plugin-vitest` 的 `valid-expect` 规则,或 `@typescript-eslint/no-floating-promises`,编辑器里直接红线提示。

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

加 TS 类型(需要声明**两个**接口,因为自定义 matcher 有两种用法):

```ts
declare module 'vitest' {
  // 用法 1: expect(value).toBeValidEmail()
  interface Assertion<T> {
    toBeValidEmail(): T
  }
  // 用法 2: expect.toBeValidEmail() — 嵌套在 toEqual 等内部做部分匹配
  interface AsymmetricMatchersContaining {
    toBeValidEmail(): any
  }
}
```

两种用法对应的写法:

```ts
// Assertion — 链尾直接调用
expect('a@x.com').toBeValidEmail()

// AsymmetricMatchersContaining — 嵌套在其他 matcher 里当占位匹配器
expect(user).toEqual({
  name: 'Alice',
  email: expect.toBeValidEmail()
})
```

> 只声明 `Assertion` 不声明 `AsymmetricMatchersContaining`,第二种写法会 TS 报错。建议两个都加上。

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
- [eslint-plugin-vitest](https://github.com/vitest-dev/eslint-plugin-vitest) — Vitest 专用 ESLint 规则(valid-expect、no-focused-tests 等)
- [jest-extended](https://github.com/jest-community/jest-extended) — 社区扩展 matcher 集合(toBeEmpty、toContainKey 等)

## 自测

1. `toBe`、`toEqual`、`toStrictEqual` 的差别?各自典型场景?
2. 为什么测浮点要用 `toBeCloseTo`?
3. 哪些场景该用部分匹配?
4. 自定义 matcher 的 `pass` 字段什么意思?为什么有两个 message?
