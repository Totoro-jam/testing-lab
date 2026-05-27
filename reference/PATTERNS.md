# 测试模式

行业里反复使用的几个模式,看代码看得多就会发现都是这几招。

---

## 1. AAA (Arrange-Act-Assert)

最基础的结构。三段式让测试一眼读懂:

```ts
it('扣款', () => {
  // Arrange
  const acc = new Account({ balance: 100 })

  // Act
  acc.withdraw(30)

  // Assert
  expect(acc.balance).toBe(70)
})
```

变种:**GWT (Given-When-Then)** —— BDD 风格,语义一样。

---

## 2. 表驱动 (Table-Driven Tests)

同一个函数,多组输入/输出。**Vitest 用 `it.each`,Jest 同名**。

```ts
it.each([
  ['Alice', true],
  ['', false],
  [' ', false],
])('isValidName(%s) = %s', (input, expected) => {
  expect(isValidName(input)).toBe(expected)
})

// 或对象形式更可读
it.each([
  { input: 0, expected: 'zero' },
  { input: 1, expected: 'one' },
  { input: 2, expected: 'two' },
])('numWord($input) = $expected', ({ input, expected }) => {
  expect(numWord(input)).toBe(expected)
})
```

**用得好节省大量重复**,坏处是失败定位稍微多看一眼。

---

## 3. Factory(测试数据工厂)

```ts
function userFactory(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: 'Default',
    email: 'a@b.com',
    vip: false,
    ...overrides,
  }
}

// 用法:只点亮关心的字段
const vip = userFactory({ vip: true })
```

升级:用 `@faker-js/faker` 生成随机但确定性的测试数据(seed 锁定)。

---

## 4. Builder

工厂的链式版,适合字段多、构造复杂的对象:

```ts
class OrderBuilder {
  private order: Order = { items: [], total: 0, vip: false }

  withItem(item: Item) { this.order.items.push(item); return this }
  withVip() { this.order.vip = true; return this }
  build() { return this.order }
}

const order = new OrderBuilder().withItem(i1).withItem(i2).withVip().build()
```

**反例:不要每个对象都搞 Builder**。3 个字段以下用 factory 就够了。

---

## 5. Object Mother

为常见场景预制一组工厂:

```ts
export const Mothers = {
  validUser: () => userFactory(),
  adminUser: () => userFactory({ role: 'admin' }),
  bannedUser: () => userFactory({ banned: true }),
}

// 测试只 import 业务场景
import { Mothers } from './tests/mothers'
const admin = Mothers.adminUser()
```

适合大团队 —— 测试代码里出现的是业务术语,不是数据细节。

---

## 6. Fixture(固定文件)

```ts
import fixture from './__fixtures__/sample-response.json'

it('parse response', () => {
  expect(parseResponse(fixture)).toEqual({ ... })
})
```

何时用 fixture:
- 真实抓的 API 响应,比手写更真实
- 复杂二进制(图片/PDF)

何时**不要用**:
- 简单对象 —— inline 更好读
- 频繁变 —— fixture 一改就改一片

---

## 7. Snapshot

```ts
expect(complex).toMatchSnapshot()
expect(complex).toMatchInlineSnapshot()   // 嵌在测试文件里
```

只在"结构稳定、变化即异常"时用。

---

## 8. Page Object (e2e)

把页面元素 + 操作封装成类:

```ts
class LoginPage {
  constructor(private page: Page) {}
  emailInput = () => this.page.getByLabel('Email')
  passwordInput = () => this.page.getByLabel('Password')
  submitButton = () => this.page.getByRole('button', { name: 'Login' })

  async login(email: string, pwd: string) {
    await this.emailInput().fill(email)
    await this.passwordInput().fill(pwd)
    await this.submitButton().click()
  }
}
```

适合中大型 e2e suite。小项目过度设计。

---

## 9. Test Fixture (Playwright)

```ts
export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.fill('#email', 'test@test')
    await page.fill('#pwd', '123')
    await page.click('button')
    await use(page)  // 把登录好的 page 注入给测试
  },
})

test('打开 dashboard', async ({ authedPage }) => {
  await authedPage.goto('/dashboard')
  // 已是登录态
})
```

**消除重复登录的最佳方式**。比 beforeEach 干净。

---

## 10. Characterization Test

老代码补测试时,先"记录现状":

```ts
it('legacyCalc 现在的行为', () => {
  const r = legacyCalc({ x: 1, y: 2 })
  console.log(JSON.stringify(r))  // 跑一次,看输出
})
```

然后把 console.log 改成断言:

```ts
expect(legacyCalc({ x: 1, y: 2 })).toMatchSnapshot()
```

之后再开始重构。这种测试**不保证行为正确,只锁定"现在的行为不被改变"**,是遗留代码的救命稻草。
