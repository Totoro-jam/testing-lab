# 10 · 覆盖率(Coverage)

## 1. 四个指标怎么看

| 指标 | 计算方式 | 谨慎对待 |
|---|---|---|
| **Lines** | 被执行过的行 / 总行 | 高最容易刷,不代表测得好 |
| **Statements** | 被执行的语句节点 / 总语句节点 | 和 Lines 接近,但能识别一行多语句 |
| **Functions** | 被调用过的函数 / 总函数 | 防止你漏测某个函数完全没人调 |
| **Branches** | if/else/?:/逻辑短路 中走过的分支 / 总分支 | **最重要** —— 才能保证两边都测了 |

**真理:Branch coverage 低代表"代码跑过了但分支没覆盖全"。先看 Branch。**

---

## 2. v8 vs istanbul,选哪个

| 项目 | v8 | istanbul |
|---|---|---|
| 原理 | 用 Node 的 V8 内置 Profiler | 在转译时插桩(babel-plugin-istanbul) |
| 速度 | 快 | 慢一点 |
| 行覆盖准确度 | 偶尔有偏(尤其 async/source map) | 精确 |
| Branch 覆盖 | 不够细 | 更细,能区分 ?: 和 if |
| 推荐场景 | 大多数项目默认 | 严格要求 branch 准的项目 |

vitest 默认 v8,要 istanbul 加 `--coverage.provider=istanbul` 或在 config 设置。

---

## 3. 怎么跑 + 怎么看报告

```bash
pnpm --filter @testing-lab/10-coverage test:coverage
```

终端会打印 `text` reporter:

```
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
calculator.ts |   85.71 |    66.67 |     100 |   85.71 | 14-15
```

HTML 报告在 `coverage/index.html` —— **用浏览器打开,点进文件能看到具体哪一行没覆盖**(红色 = 没跑过,黄色 = 部分分支没覆盖)。

---

## 4. CI 集成

在 `vitest.config.ts` 里:

```ts
coverage: {
  thresholds: { lines: 80, branches: 75, functions: 80, statements: 80 }
}
```

或细分到文件:

```ts
thresholds: {
  'src/critical-module.ts': { lines: 100, branches: 100 },
  // 全局阈值
  lines: 80,
}
```

跌破阈值 → vitest 退出码非零 → CI 红。

---

## 5. 覆盖率的反模式

- ❌ **追 100% 覆盖率**:写无意义的测试反而浪费时间。**80–90% 是大多数项目的甜点**。
- ❌ **测试只是为了把覆盖率提上来**:这种测试没有断言或断言无意义,bug 来了仍抓不到。
- ❌ **覆盖率绿了就不写测试了**:覆盖率只衡量"代码被执行",不衡量"行为被验证"。一个 `expect(true).toBe(true)` 也能贡献覆盖率。

---

## 6. 哪些代码该排除

```ts
coverage: {
  exclude: [
    'src/**/*.d.ts',
    'src/**/types.ts',
    'src/**/__fixtures__/**',
    'src/**/*.stories.tsx',
    'src/main.ts',  // 入口胶水
  ]
}
```

**排除策略:类型定义、入口、storybook、纯静态数据。不排除业务逻辑(再小也要测)。**

---

## 7. 真实项目运营经验

1. **第一次接手项目时,先跑一次 coverage** —— 看清楚业务死角在哪
2. **PR diff coverage**(只看新代码的覆盖率)比全量更值得卡
3. **覆盖率报告作为讨论起点,不作为 KPI** —— KPI 化必然滋生废测试

---

## 延伸阅读

- [Vitest — Coverage](https://vitest.dev/guide/coverage.html)
- [istanbul.js](https://github.com/istanbuljs/istanbuljs) — 插桩式覆盖率引擎
- [c8](https://github.com/nicolo-ribaudo/c8) — 基于 V8 内置 Profiler 的覆盖率工具
- [Codecov](https://github.com/codecov/codecov-action) — CI 覆盖率报告服务
