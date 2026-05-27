# 01 - Fundamentals: 为什么写测试 + 第一个测试

> 用 Node 内置的 `node:test`,零依赖,把"测试"这件事的底层模型讲清楚。学完这章你能回答:测试到底是什么、为什么写、怎么命名、怎么组织、什么样的测试有价值。

## 本章目标

- 理解"测试就是一段独立运行、能判断结果对错的代码",没有任何魔法
- 掌握 AAA(Arrange-Act-Assert)结构 + Given-When-Then 命名
- 理解测试金字塔(单元 / 集成 / E2E)的取舍
- 跑通你的第一个测试

## 如何运行

```bash
cd packages/01-fundamentals
pnpm install   # 实际上没有依赖,但跑一下确认环境
pnpm test
```

输出大约长这样:

```
✔ add(a, b) — 正常加法 (2.3ms)
✔ add(a, b) — 负数加法 (0.5ms)
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

## 核心概念

### 1. 测试不是魔法

很多人觉得"测试框架"很神秘。其实最朴素的测试就是:

```js
const result = add(1, 2)
if (result !== 3) {
  throw new Error('add(1, 2) should be 3 but got ' + result)
}
console.log('PASSED')
```

**框架做的事**只是:
1. 帮你把多个测试**命名、分组、隔离运行**
2. 帮你**收集失败信息**(哪个失败、为什么失败、堆栈)
3. 提供**漂亮的输出**(✔/✗、耗时、覆盖率)

理解这点后,所有测试框架(vitest / jest / mocha)本质上就只是上面三件事的不同实现。

### 2. AAA 结构:每个测试都该有三段

```
Arrange  — 准备数据/环境(SUT 之前)
Act      — 触发被测行为(SUT)
Assert   — 断言结果
```

SUT = System Under Test(被测系统)。

```js
test('shopping cart adds item correctly', () => {
  // Arrange
  const cart = new Cart()
  const item = { id: 1, price: 10 }

  // Act
  cart.add(item)

  // Assert
  assert.equal(cart.total, 10)
  assert.equal(cart.items.length, 1)
})
```

**为什么这么分?**因为这三段读起来对应"剧情":什么场景 → 干了啥 → 结果是啥。任何人(包括三个月后的自己)5 秒内就能看懂这个测试在测什么。

### 3. 命名:Given-When-Then 是 AAA 的口语版

```
test 描述应该回答这个问题:
  当 [前提条件] 时,
  做 [某个操作],
  应该 [预期结果]
```

好命名:
- ✅ `'购物车为空时,添加商品后 total 等于商品价格'`
- ✅ `'parseURL 收到带 hash 的 url 时,hash 字段包含 #'`

坏命名:
- ❌ `'test1'`、`'works'`、`'cart test'`
- ❌ `'should add'`(should 是废话,所有测试都是 should)

### 4. 测试金字塔(取舍模型)

```
         /\
        /E2\          ← 少而精:端到端,模拟真实用户
       /----\
      / 集成 \         ← 中等数量:多模块协作
     /--------\
    /  单元    \       ← 大量:单函数/单类
   /------------\
```

| 层 | 数量级 | 速度 | 稳定性 | 反馈精度 |
|---|---|---|---|---|
| 单元 | 上千 | 毫秒 | 高 | 精确到函数 |
| 集成 | 上百 | 秒 | 中 | 精确到模块 |
| E2E | 几十 | 分钟 | 易 flaky | 精确到用户路径 |

**新人最常犯的错**:把单元测试写成"假装是单元测试的集成测试"(mock 一大堆),失去了单元测试该有的"快 + 稳"。

### 5. 一个测试应该有几个 assert?

- **理想:1 个**——一个测试只验证一件事
- **现实:2-3 个**——同一个事实的多个不同维度可以接受(比如 cart.total + cart.items.length)
- **超过 5 个**:大概率你测的"一件事"实际上是好几件事,要拆

## 代码导读

```
01-fundamentals/
├── src/
│   ├── calculator.js     ← 被测代码:简单计算器
│   └── cart.js           ← 被测代码:购物车
└── tests/
    ├── calculator.test.js ← 演示 AAA
    └── cart.test.js       ← 演示 Given-When-Then + 多 assert 边界
```

阅读顺序:
1. 先看 `src/calculator.js`(被测的逻辑)
2. 再看 `tests/calculator.test.js`(怎么测它)
3. 然后看 cart 那对(更复杂一点)

## 常见坑

### 坑 1:测试代码自己有 bug

测试是代码,代码就有 bug。常见模式:测试写错了断言,代码改对了反而挂——这时去改代码就完蛋了。

**对策**:**故意写错代码**让测试报错,确认测试真的能"测到"——这叫 mutation test 思想。

### 坑 2:测试依赖外部状态

```js
test('saves user', () => {
  db.save({ id: 1 })          // ⚠️ 依赖外部 db,跑两次第二次会重复
  assert.equal(db.count, 1)
})
```

每个测试应该**独立、可重复**。这章用纯函数避免这个问题,后面章节(尤其 mocking)会详细处理。

### 坑 3:console.log 代替 assert

```js
test('add works', () => {
  console.log(add(1, 2))      // ❌ 这不是测试,这是手动检查
})
```

测试必须**自动判断**对错。不会自动 fail 的代码不是测试。

## 延伸阅读

- [Node.js test runner 官方文档](https://nodejs.org/api/test.html)
- [Kent C. Dodds — Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [Martin Fowler — Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

## 自测

合上代码,回答:

1. 什么是 AAA?为什么这么分?
2. 测试金字塔哪一层应该最多?为什么?
3. 一个测试断言数量多少合适?超过会怎样?
4. 为什么 `console.log` 不能算测试?

下一章:用 vitest 取代 node:test,看看真正的现代测试框架长什么样。
