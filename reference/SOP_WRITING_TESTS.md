# 写测试的标准作业流程(SOP)

> 每写一个测试,按这张表走一遍。等你形成肌肉记忆就可以不看了。

---

## 0. 提笔前问自己

| 问题 | 如果答案是… |
|---|---|
| 这个测试在保护什么? | 说不出来 → 不要写 |
| 这是单元 / 集成 / e2e? | 决定你用哪一套工具 |
| 失败会告诉我什么? | 如果失败 message 含糊 → 重新设计断言 |
| 这个行为现在有人测了吗? | 有 → 别重复;没有 → 继续 |

---

## 1. 文件命名与位置

```
src/cart.ts                 → src/cart.test.ts (并列)
                            → 或 tests/cart.test.ts (镜像)
e2e/checkout.spec.ts        (e2e 单独目录,名字用 .spec.ts)
```

**风格选一种,全项目统一**。混用是大忌。

---

## 2. AAA 结构(Arrange-Act-Assert)

```ts
it('add item 后 total 增加', () => {
  // Arrange
  const cart = new Cart()
  cart.add({ id: 1, price: 10 }, 2)

  // Act
  cart.add({ id: 2, price: 5 }, 1)

  // Assert
  expect(cart.total).toBe(25)
})
```

**每个 it 只测一件事**。如果 Assert 有 5 行各自验证不同行为,拆成多个 it。

---

## 3. 命名公式

`it('<场景> + <动作> + <预期>')`

- ✅ `it('VIP 用户结账时减 10%')`
- ✅ `it('email 不含 @ 时显示错误')`
- ❌ `it('test1')`
- ❌ `it('checkout')`
- ❌ `it('should work')`

**测试名应该读起来像验收标准**。失败时直接当 bug 描述用。

---

## 4. 数据准备:工厂 > inline > fixture

```ts
// ❌ inline 太长
const u = { id: 1, name: 'A', email: 'a@b.com', vip: true, points: 100, ... }

// ✅ 工厂函数,默认值 + 覆盖你关心的字段
function makeUser(overrides: Partial<User> = {}): User {
  return { id: 1, name: 'A', email: 'a@b.com', vip: false, points: 0, ...overrides }
}

const vip = makeUser({ vip: true })   // 测试只点亮你关心的字段
```

工厂模式让测试"只显示信号,不显示噪音"。

---

## 5. mock 三原则

1. **只 mock 边界**:网络、磁盘、时间、随机
2. **不 mock 你正在测的东西**(那叫"测试你的 mock")
3. **每个测试结束 reset** —— vitest.config 加 `clearMocks: true`

---

## 6. 异步必须 await

```ts
// ❌
it('async', () => {
  doAsync().then(r => expect(r).toBe(1))   // 断言可能不跑
})

// ✅
it('async', async () => {
  await expect(doAsync()).resolves.toBe(1)
})
```

不放心:加 `expect.assertions(N)`,强制要求执行 N 次断言。

---

## 7. 写完跑两遍

1. **先跑一次确认绿** —— 不是绿的别提 PR
2. **改一行业务代码看它红** —— 确认这测试真的能抓 bug,而不是恒真断言

**这一步省略不得**。永远绿的"测试"是最贵的负债。

---

## 8. Review checklist(自检 + 给别人 review)

- [ ] 测试名读起来像验收标准
- [ ] 一个 it 只测一件事
- [ ] 没有 `sleep` / `setTimeout` 等真实等待
- [ ] 异步全部 `await`
- [ ] 不依赖测试执行顺序
- [ ] 不读真实文件/真实网络/真实时间
- [ ] cleanup 完整(timer / mock / global)
- [ ] 失败 message 让人能定位问题

---

## 9. 写不出测试时的信号

如果一段代码"很难测",大概率是:

- 副作用太多 → 拆出纯函数
- 依赖太多 → 用依赖注入或工厂
- 时间/随机硬编码 → 改为参数注入
- DOM 强耦合 → 抽出业务函数

**测试是设计的反馈** —— 难测的代码通常是设计差的代码。

---

## 10. 老代码补测试的流程

1. **先写"摸索测试" (characterization test)** —— 不写期望,先打印行为
2. 看打印的输出 → 把它写成断言 → 这就成了 baseline
3. 然后再开始重构,有 baseline 兜底

**别上来就重构** —— 没有测试的重构就是改 bug,只是改成了不同的 bug。
