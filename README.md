# testing-lab

前端测试系统学习实验场。学完后能看懂 95% 的前端测试代码、能维护它们、能在自己项目里搭测试基建。

## 这个仓库不是什么

- 不是某个框架的官方文档(直接看 vitest.dev / jestjs.io 更全)
- 不是"30 分钟教你写测试"那种速成
- 不会回避"为什么这样设计"——理解 why 才能维护

## 这个仓库是什么

- **可跑代码 + 解释 why 的双轨**。每章一个独立 package,自带 `package.json`、配置、源码、测试,直接 `pnpm install && pnpm test` 就跑
- **同一概念跨工具对照**:同样的测试在 vitest 和 jest 里分别长什么样?在 @testing-library/vue 和 react 里分别长什么样?差异一目了然
- **工程化基线**:不只是会写 `expect()`,还知道在 CI 里跑、在 pre-commit 跑、阈值怎么定、覆盖率怎么看

## 学习路径

| 章节 | 主题 | 工具栈 | 难度 |
|---|---|---|---|
| [01-fundamentals](packages/01-fundamentals) | 测试理论 + Node 内置 runner | JS, `node:test` | ⭐ |
| [02-vitest-basics](packages/02-vitest-basics) | Vitest 入门 | TS, vitest | ⭐⭐ |
| [03-jest-basics](packages/03-jest-basics) | Jest 入门 + 与 vitest 对照 | TS, jest, ts-jest | ⭐⭐ |
| [04-assertions](packages/04-assertions) | 断言全集 + 自定义匹配器 | TS, vitest | ⭐⭐ |
| [05-async](packages/05-async) | 异步、计时器、fake timers | TS, vitest | ⭐⭐⭐ |
| [06-mocking](packages/06-mocking) | spy / stub / mock module | TS, vitest + jest | ⭐⭐⭐ |
| [07-component-vue](packages/07-component-vue) | Vue 组件测试 | TS, vitest, @testing-library/vue | ⭐⭐⭐ |
| [08-component-react](packages/08-component-react) | React 组件测试 | TS, vitest, @testing-library/react | ⭐⭐⭐ |
| [09-network-mocking](packages/09-network-mocking) | MSW 网络层 mock | TS, msw | ⭐⭐⭐ |
| [10-coverage](packages/10-coverage) | 覆盖率工具与报告解读 | TS, vitest, @vitest/coverage-v8 | ⭐⭐ |
| [11-e2e-playwright](packages/11-e2e-playwright) | E2E 入门 | TS, playwright | ⭐⭐⭐⭐ |
| [12-engineering](packages/12-engineering) | CI、hooks、commitlint、阈值 | husky, lint-staged, commitlint, GitHub Actions | ⭐⭐⭐ |

强烈建议**按顺序学**。每章 README 顶部都有"前置条件"明确依赖哪几章。

## 速查参考(随用随翻)

- [reference/ASSERTIONS_CHEATSHEET.md](reference/ASSERTIONS_CHEATSHEET.md) — 所有常用断言一页速查
- [reference/SOP_WRITING_TESTS.md](reference/SOP_WRITING_TESTS.md) — 写测试的标准操作流程(SOP)
- [reference/PATTERNS.md](reference/PATTERNS.md) — 常用模式(AAA、GWT、table-driven、snapshot、fixture)
- [reference/ANTIPATTERNS.md](reference/ANTIPATTERNS.md) — 反模式(测得错、测不准、测得脆)
- [reference/COMPARISON.md](reference/COMPARISON.md) — Vitest vs Jest vs Mocha、TL vs Enzyme、Playwright vs Cypress

## 怎么用

### 第一次

```bash
# 安装 pnpm(如已安装跳过)
corepack enable && corepack prepare pnpm@9.0.0 --activate

# 安装所有章节的依赖(只有跑某章时再装那章)
cd /Users/dovchen/code/testing-lab

# 跑某一章
pnpm --filter ./packages/02-vitest-basics install
pnpm --filter ./packages/02-vitest-basics test

# 跑全部章节(注意:首次会装很多依赖)
pnpm install
pnpm test
```

### 日常学习

每章的 README 里都有:
1. **本章目标**(你学完应该能干什么)
2. **如何运行**(具体命令)
3. **核心概念**(why,带例子)
4. **代码导读**(src / tests 文件之间的关系)
5. **常见坑**(踩过才知道的)
6. **延伸阅读**(官方文档定位)

## 学习心法

- **看 README → 跑测试 → 故意改坏代码看测试是否报错**——这一步是关键,没报错说明你的测试是装饰
- **每章学完,合上代码,凭记忆把核心命令写出来**——记不住就回看
- **每周拿一个真实项目的测试代码看**——把这里学的对照过去

## 给维护者(将来的你)

- 添新章节请放在 `packages/NN-name/`,数字越大越靠后
- 每个 package 必须能独立 `pnpm install && pnpm test`,**不依赖根目录依赖**
- 速查文档(reference/)只放跨章节通用知识,章节内特有的写进各自的 README

---

License: MIT
