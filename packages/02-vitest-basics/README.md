# 02 - Vitest 入门

> Vitest 是目前最现代的前端测试运行器:Vite 原生集成、TS 开箱即用、极快、API 与 Jest 高度兼容。学完这章你能用 vitest 写完整的单元测试,理解所有常用 CLI 参数和配置。

## 前置

- 已学 [01-fundamentals](../01-fundamentals)

## 本章目标

- 知道 vitest 提供了什么、为什么是它(而不是 jest)
- 用 `describe / it / expect` 写出工整的测试套件
- 掌握 hooks(`beforeAll/beforeEach/afterEach/afterAll`)的用法和陷阱
- 知道 `only / skip / todo / each` 的使用场景
- 熟悉 CLI:watch mode、UI mode、单测过滤、coverage

## 如何运行

```bash
cd packages/02-vitest-basics
pnpm install

# 一次性跑(CI 模式)
pnpm test

# watch 模式(开发时用,改代码自动重跑相关测试)
pnpm test:watch

# 浏览器 UI 模式(可视化、好看的运行报告)
pnpm test:ui

# 带覆盖率
pnpm test:coverage
```

## 核心概念

### 1. Vitest = Vite 的测试运行器

为什么不是 Jest?Jest 自带一套 transformer(babel-jest / ts-jest),配置复杂、ESM 兼容差、运行慢。Vitest 复用 Vite 的 transformer,**项目用什么打包就用什么跑测试**——TS / Vue / Svelte / JSX 全开箱即用。

### 2. globals 选项

```ts
// vitest.config.ts
test: { globals: true }
```

- `true`(本章演示):`describe / it / expect` 全局可用,不需要 import,贴近 jest 体验
- `false`(推荐生产用):必须 `import { describe, it, expect } from 'vitest'`,显式依赖,更适合 IDE 跳转

如果开 `globals: true`,记得在 tsconfig 加 `"types": ["vitest/globals"]` 让 TS 认识。

### 3. 三种结构关键字

| 关键字 | 别名 | 用途 |
|---|---|---|
| `describe(name, fn)` | `suite` | 把相关测试**分组** |
| `it(name, fn)` | `test` | 单个测试用例 |
| `expect(actual)` | — | 启动断言链 |

`describe` 可以嵌套,生成的报告会自动缩进对应:

```
Cart
  ├── add()
  │   ├── ✔ 空购物车添加一个商品
  │   └── ✔ 添加无效商品抛错
  └── remove()
      └── ✔ 删除存在的商品
```

### 4. Hooks(钩子)

```ts
beforeAll(() => {})    // 整个 describe 跑之前(只 1 次)
beforeEach(() => {})   // 每个 it 之前
afterEach(() => {})    // 每个 it 之后
afterAll(() => {})     // 整个 describe 跑之后(只 1 次)
```

**经验法则**:
- 99% 情况用 `beforeEach` 初始化、`afterEach` 清理
- `beforeAll/afterAll` 只用于"准备开销极大、不变的资源"(比如启 DB、起 server)
- **千万别在 hook 里写断言**——失败信息会很难定位

### 5. 测试控制流

| 写法 | 含义 |
|---|---|
| `it.only(...)` | 只跑这一个(本文件其他全跳过) |
| `it.skip(...)` | 跳过这一个 |
| `it.todo('做未来的事')` | 占位,不会失败,但报告里显示"待实现" |
| `it.each([...])(...)` | 表驱动:同一个测试用不同数据跑多次 |

**`only` 是危险的**——提交前忘删,CI 上只跑那一个,其他测试被静默跳过。配 lint rule(`vitest/no-focused-tests`)拦截。

### 6. CLI 必会

```bash
vitest                          # watch 模式启动(默认)
vitest run                      # 单次跑完退出(CI 用)
vitest run cart                 # 只跑文件名含 "cart" 的
vitest run -t "添加商品"        # 只跑测试名含这个字符串的
vitest run --coverage           # 出覆盖率
vitest --ui                     # 启 web UI
vitest --reporter=verbose       # 详细输出
vitest --reporter=junit         # 输出 junit xml(给 CI)
```

## 代码导读

```
02-vitest-basics/
├── src/
│   ├── calculator.ts     ← 复用 01 章的计算器(改 TS)
│   └── userService.ts    ← 稍微复杂一点:有状态、有边界
└── tests/
    ├── calculator.test.ts  ← 基础语法演示
    └── userService.test.ts ← 演示 beforeEach + describe 嵌套 + it.each
```

## 常见坑

### 坑 1:`expect` 没写返回值

```ts
expect(add(1, 2))   // ❌ 没断,等于啥都没做
expect(add(1, 2)).toBe(3)  // ✅
```

Vitest 不会因为"忘 assert"报错——它认为你就是想这么写。这是测试代码最容易"自己看着 pass 实际没测"的来源。

### 坑 2:async 测试忘 await

```ts
it('fetches user', async () => {
  expect(fetchUser(1)).resolves.toEqual({...})  // ❌ 缺 return / await
  await expect(fetchUser(1)).resolves.toEqual({...})  // ✅
})
```

第 05 章会专门讲异步,这里先记住:涉及 Promise 的断言要么 `await`,要么 `return`。

### 坑 3:`describe.skip` vs `it.skip` 行为不同

`describe.skip` 跳过整个组;`it.skip` 只跳一个。出现在大 describe 顶上时容易误操作。

### 坑 4:globals 模式下 TS 报错

```ts
describe('xxx', () => {...})
// TS: Cannot find name 'describe'
```

tsconfig 缺 `"types": ["vitest/globals"]`。

## 延伸阅读

- [Vitest 官方文档](https://vitest.dev/)
- [Vitest API reference](https://vitest.dev/api/)
- [Vitest CLI options](https://vitest.dev/guide/cli.html)

## 自测

1. globals: true 和 false 各有什么取舍?
2. beforeEach 和 beforeAll 选哪个?判断标准是啥?
3. `it.only` 为什么危险?怎么防?
4. 异步测试最容易忘的一件事是什么?

下一章:Jest 入门 + 与 Vitest 对照(同样的代码、不同的运行器)。
