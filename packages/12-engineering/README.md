# 12 · 测试工程化(CI / Hooks / 项目卫生)

学完前 11 章你已经会写测试了。最后一章告诉你 **怎么让团队不写烂、CI 不炸**。

---

## 1. Pre-commit:在 commit 前自动跑

工具链:**husky + lint-staged**

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

`.husky/pre-commit`:
```bash
pnpm exec lint-staged
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx,vue}": ["eslint --fix", "vitest related --run"]
  }
}
```

**关键:`vitest related --run`** —— 只跑跟改动文件相关的测试,3 秒搞定,不影响 commit 速度。

---

## 2. Commit 消息规范:commitlint

```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

`commitlint.config.js`:
```js
export default { extends: ['@commitlint/config-conventional'] }
```

`.husky/commit-msg`:
```bash
pnpm exec commitlint --edit "$1"
```

之后必须写:`feat(login): add 2FA` 这种格式。配合 changelog 工具自动生成发版日志。

---

## 3. CI(GitHub Actions)

`.github/workflows/test.yml`:

```yaml
name: test
on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm -r --filter "!@testing-lab/11-e2e-playwright" test
      - run: pnpm --filter @testing-lab/10-coverage test:coverage
      - uses: codecov/codecov-action@v4  # 可选,push 覆盖率到 codecov

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @testing-lab/11-e2e-playwright exec playwright install --with-deps
      - run: pnpm --filter @testing-lab/11-e2e-playwright test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: packages/11-e2e-playwright/playwright-report/
```

**关键配置:**
- `--frozen-lockfile`:CI 强制锁版本,不偷偷升包
- e2e 单独 job:慢,且需要 `playwright install --with-deps` 装浏览器
- `upload-artifact` 失败时把 trace/screenshot 传出来,远程也能排查

---

## 4. 测试目录与命名约定

| 约定 | 推荐 |
|---|---|
| 单元测试文件 | `xxx.test.ts` 和源码同目录,或 `tests/` 镜像目录 |
| e2e | `e2e/*.spec.ts`,**单独 tsconfig 和 runner** |
| 测试工具 | `tests/utils/`、`tests/fixtures/`,不要被业务代码 import |
| Mocks | `tests/mocks/`,handler / fixture / factory 都放这 |
| Snapshot | `__snapshots__/` 旁边就好 |

---

## 5. 测试金字塔(经典模型)

```
       /\
      /e2\        ← 少:5-20 个,关键流程
     /----\
    / 集成 \      ← 中:几十个,组件 + service
   /--------\
  /  单元    \   ← 多:几百个,纯函数 + hook
 /------------\
```

**反金字塔(冰激凌)是错误**:
- 单元少:小改动也得跑整个 e2e 才知道挂没挂 → 慢、贵
- e2e 多:任何 timing 变化都可能 flaky → 团队失去信任,开始 `xtest` 跳过

**蛋糕(中间宽两头窄)在某些团队也合理**:重组件 + 集成测试比纯单元更值,大势所趋。

---

## 6. 写测试的 SOP(标准作业流程)

每写一个新测试:

1. **想一句话:这个测试在保护什么?** —— 如果说不出来,删掉
2. **AAA**:先写 Arrange 数据 → Act 调用 → Assert 期望
3. **一次测一件事**:违反时拆成多个 it
4. **跑一次让它绿** —— 确认不是误判
5. **改一行业务代码让它红** —— 确认这测试真的能抓 bug
6. **恢复业务代码,把测试放进 PR**

---

## 7. 维护策略

- **flaky 测试零容忍**:挂一次重试通过的,立刻打 quarantine 标签或修
- **覆盖率 PR diff**:只看新代码,别全局背锅
- **大型重构前先补测试** —— 不然不敢动
- **新人 onboarding 第一周 = 跑测试 + 读现有测试** —— 测试是最好的活文档

---

## 延伸阅读

- [husky](https://github.com/typicode/husky) — Git hooks 管理
- [lint-staged](https://github.com/lint-staged/lint-staged) — 只对暂存文件跑 lint/format
- [commitlint](https://github.com/conventional-changelog/commitlint) — Commit 消息规范检查
- [GitHub Actions](https://docs.github.com/en/actions) — CI/CD
- [Codecov](https://github.com/codecov/codecov-action) — 覆盖率报告
