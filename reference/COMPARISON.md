# 测试工具横向对比

## 1. 单元/集成测试 runner

| 维度 | Vitest | Jest | Mocha + Chai | node:test |
|---|---|---|---|---|
| 出生年 | 2021 (Vite 生态) | 2014 (Facebook) | 2011 (老牌) | Node 18+ 内置 |
| ESM 原生 | ✅ 一等公民 | ⚠️ 需要 ESM 配置或 babel | ✅ 较好 | ✅ |
| TS 支持 | ✅ 开箱即用(vite transform) | 需要 ts-jest / babel | 需要 ts-node | 需要 tsx / loader |
| 速度 | 快(Vite + esbuild) | 中(jest-runtime 较重) | 中 | 慢一些 |
| 监听模式 | ✅ 极佳 | ✅ | ⚠️ 需要插件 | ❌ |
| API 兼容 jest | ✅ 几乎一致 | — | 不同 | 不同 |
| 生态 | 中,持续扩大 | 巨大 | 中 | 小 |
| **推荐场景** | **新项目** | 老项目继承、React Native | 服务器纯 Node、定制需求 | CLI 工具、零依赖 |

**结论:新项目无脑选 Vitest;Jest 项目维持现状别折腾(API 一样,迁移收益小)**。

---

## 2. 组件测试库

| | @testing-library | @vue/test-utils | Enzyme |
|---|---|---|---|
| 哲学 | 用户视角(DOM 操作) | 框架视角(组件实例操作) | shallow render + 实例 |
| 跨框架 | ✅ React/Vue/Svelte 全有 | Vue only | React only |
| 维护 | 活跃 | Vue 官方 | **已死**(2020 后无更新) |
| 推荐 | ✅ 默认 | 复杂场景或 Vue 特性 | ❌ 不要新用 |

**结论:测组件 = testing-library。** Enzyme 项目应该规划迁移。

---

## 3. E2E

| | Playwright | Cypress | Puppeteer | Selenium / WebdriverIO |
|---|---|---|---|---|
| 浏览器 | Chromium/FF/WebKit | Chromium 主导 | Chromium only | 全 |
| iframe / multi-tab | ✅ 原生 | ⚠️ 受限 | ✅ | ✅ |
| 并行 | ✅ 进程并行,默认开 | ⚠️ 同机单线程,需 Cloud | 手动 | 手动 |
| 移动 | 模拟 device viewport | 同左 | 同左 | ✅ 真机(Appium) |
| API 风格 | `await page.xxx` | 链式 `cy.xxx` | `await page.xxx` | 同 |
| Trace 调试 | ✅ trace viewer 神器 | ✅ time travel | ❌ | ⚠️ |
| 维护方 | Microsoft | Cypress.io(商业) | Google | OSS |
| 学习曲线 | 中 | 易 | 偏底层 | 复杂 |
| 推荐场景 | **新项目首选** | Cypress 老项目 | 截图/PDF/爬虫 | 跨真机/混合应用 |

**结论:新项目 = Playwright。Cypress 已不再是默认推荐。**

---

## 4. Mock 网络

| | MSW | nock | vi.stubGlobal('fetch') | axios-mock-adapter |
|---|---|---|---|---|
| 层级 | 网络协议(SW / undici) | Node http 层 | JS 层 | axios 层 |
| 同一份代码跨 unit/e2e | ✅ | ❌ | ❌ | ❌ |
| 支持 fetch | ✅ | 通过 polyfill | ✅(自己 mock) | ❌(axios only) |
| **推荐** | **首选** | 老 Node 项目 | 简单场景 | 老 axios 项目 |

---

## 5. 断言风格

| 风格 | 代表 | 例子 |
|---|---|---|
| `expect(x).toBe(y)` | Vitest, Jest, Playwright | 主流,推荐 |
| `expect(x).to.equal(y)` | Chai (BDD) | Mocha 默认搭档 |
| `assert.equal(x, y)` | node:assert, Chai (TDD) | 简单脚本/CLI |

**结论:三种都能用,跟 runner 走就好,不用纠结。**

---

## 6. 覆盖率

| | v8 | istanbul (babel-plugin-istanbul) |
|---|---|---|
| 速度 | 快 | 慢一点 |
| Branch 精度 | 一般 | 高 |
| 配置 | vitest 默认 | 加 `--coverage.provider=istanbul` |
| 推荐 | 大多数项目 | 严格 branch 要求 |

---

## 7. 真实项目栈推荐(2026 视角)

**前端纯 Web 项目(Vue/React):**
```
Vitest + @testing-library/{vue,react} + MSW + Playwright
+ husky + lint-staged + commitlint + GitHub Actions
```

**Node 服务(Nest/Express):**
```
Vitest + supertest + MSW(对外部依赖) + Playwright(管理后台)
```

**已有 Jest 的存量项目:**
```
保持 Jest + 其他不变。除非项目要彻底现代化或 TS+ESM 折腾不动了
```

**Monorepo:**
```
根 vitest.config.ts 用 projects 字段聚合,一条 vitest 命令跑所有包
pnpm workspaces / Turborepo 做任务编排
```
