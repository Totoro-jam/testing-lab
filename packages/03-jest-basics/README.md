# 03 - Jest 入门 + 与 Vitest 对照

> 大量存量项目(CRA、老 React、React Native 等)仍用 Jest。学完这章你能在 Jest 项目里写测试、改测试、调试测试,并清楚 Jest 与 Vitest 的核心差异。

## 前置

- 已学 [02-vitest-basics](../02-vitest-basics)

## 本章目标

- 跑通 jest + ts-jest 的 TS 测试
- 理解 jest config 的核心字段(preset / testEnvironment / transform / moduleNameMapper)
- 看清 Jest 与 Vitest 的"等价 + 差异"对照表
- 能在两个框架之间互相翻译测试代码

## 如何运行

```bash
cd packages/03-jest-basics
pnpm install
pnpm test
pnpm test:watch
pnpm test:coverage
```

## 核心概念

### 1. Jest 是什么

Facebook(Meta)出品的测试框架,2014 年左右成为 JS 测试的事实标准。它是**一体化套件**:
- 测试运行器(runner)
- 断言库(expect)
- mocking 库(jest.fn / jest.mock)
- 快照库(toMatchSnapshot)
- 覆盖率(基于 istanbul)

所有东西**一个包搞定**——这是它当年压倒 mocha + chai + sinon 的关键。

### 2. TS 怎么跑

Jest 本身不懂 TS,需要 transformer:

| 方案 | 包 | 特点 |
|---|---|---|
| **ts-jest**(本章用) | `ts-jest` | 真正用 tsc 编译,类型检查跟着跑;**慢** |
| **babel-jest + @babel/preset-typescript** | `babel-jest` | 仅剥类型不做类型检查;**快**但 TS 错误测试不会失败 |
| **@swc/jest** | `@swc/jest` | swc 编译,极快;不做类型检查 |

生产用 `@swc/jest`(速度)+ tsc 单独跑类型检查;入门用 `ts-jest`(简单)。

### 3. Jest 与 Vitest 等价对照

```ts
// === 完全等价的 API ===
describe('xxx', () => {})
it('xxx', () => {})
expect(x).toBe(y)
beforeEach(() => {})
test.each([...])(...)
```

绝大多数 API **一字不差**。这是 Vitest 的设计哲学:做"快速版 Jest",最大化迁移成本为零。

### 4. 差异速查(常踩坑)

| 维度 | Jest | Vitest |
|---|---|---|
| **配置文件** | `jest.config.js/ts/cjs` 单独 | `vitest.config.ts` 或合并进 `vite.config.ts` |
| **TS 支持** | 需要 transformer | 内置(走 vite) |
| **ESM 支持** | 需要实验配置(`--experimental-vm-modules`) | 原生 |
| **globals** | 默认开启,所有 describe/it/expect 全局 | 默认关闭,需配置 `globals: true` |
| **mock 模块语法** | `jest.mock('mod')` | `vi.mock('mod')`,**自动 hoist 行为略不同** |
| **mock 实例** | `jest.fn()` / `jest.spyOn()` | `vi.fn()` / `vi.spyOn()` |
| **fake timers** | `jest.useFakeTimers()` | `vi.useFakeTimers()`,新版默认 `'auto'` 不 mock Date |
| **快照** | `toMatchSnapshot()` 写文件 | 同上 |
| **inline 快照** | `toMatchInlineSnapshot()` 写当前文件 | 同上 |
| **运行器** | 自建,基于 jsdom/node | 基于 vite + tinypool |
| **速度** | 中等 | 显著更快(尤其大项目) |
| **CLI 过滤** | `jest cart` / `-t "name"` | `vitest run cart` / `-t "name"` |

### 5. 迁移检查清单(Jest → Vitest)

如果以后要把项目从 Jest 迁到 Vitest:

```ts
// 1. 全局替换 jest.* → vi.*
jest.fn()          → vi.fn()
jest.mock()        → vi.mock()
jest.spyOn()       → vi.spyOn()
jest.useFakeTimers() → vi.useFakeTimers()

// 2. 检查 jest.mock 的 hoisting 假设
// Vitest 的 vi.mock 也会 hoist,但不像 Jest 那样能 hoist 任意函数声明

// 3. 替换配置文件
// jest.config.js → vitest.config.ts
// transform 配置删掉(vite 自动处理)

// 4. 改类型
// @types/jest → vitest/globals(配 tsconfig types)
```

## 代码导读

`src/calculator.ts` 跟 02 章**完全一样**——故意的,体现"业务代码不变,只换框架"。

测试代码也几乎一样,差异只在:
- import 是 `'@jest/globals'` 而不是 `'vitest'`
- mock API 是 `jest.fn()` 而不是 `vi.fn()`

## 常见坑

### 坑 1:ts-jest 报"cannot find name 'describe'"

`tsconfig.json` 缺 `"types": ["jest"]`。

### 坑 2:ESM 项目跑不起来

Jest 对 ESM 支持差,常见报错 `SyntaxError: Cannot use import statement outside a module`。解决:
- 加 `"type": "module"` + 启动用 `node --experimental-vm-modules`
- 或者用 `babel-jest` 把 ESM 转 CJS(本章用 ts-jest 走 CJS)
- 长远建议:**直接换 Vitest**

### 坑 3:`jest.mock` 的 hoist 陷阱

```ts
import { foo } from './mod'

const mockValue = 'x'
jest.mock('./mod', () => ({ foo: mockValue }))  // ❌ ReferenceError
```

`jest.mock` 被自动提到文件顶部(在 import 之前执行),所以闭包里的 `mockValue` 还没初始化。

**规避**:用 `jest.mock` 的工厂直接返回字面量,或者用 `jest.doMock`(不 hoist)。

### 坑 4:运行时间显著慢

Jest 慢有几个常见原因:
- ts-jest 类型检查开销
- 太多 setup/teardown 重复
- 没开 `--maxWorkers` 利用 CPU

`--testTimeout=30000` 治标不治本——排查根因。

## 延伸阅读

- [Jest 官方](https://jestjs.io/)
- [ts-jest 配置](https://kulshekhar.github.io/ts-jest/)
- [Vitest migration from Jest](https://vitest.dev/guide/migration.html)

## 自测

1. Jest 为什么需要 transformer 才能跑 TS?Vitest 为什么不需要?
2. `jest.mock` 和 `jest.doMock` 的差别是什么?
3. 把 `vi.fn().mockReturnValue(42)` 翻译成 Jest 写法。
4. 一个项目从 Jest 迁到 Vitest,你最先检查的 3 个点是什么?

下一章:断言深潜——所有匹配器、自定义 matcher、何时该用什么。
