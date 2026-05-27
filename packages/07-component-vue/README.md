# 07 · Vue 组件测试

两条主流路线,本章都会用:

| 库 | 风格 | 何时用 |
|---|---|---|
| `@vue/test-utils` | 框架原生,API 围绕组件实例(`wrapper.vm`, `setData`, `setProps`) | 测复杂交互、需要直接操作组件内部状态 |
| `@testing-library/vue` | 用户视角,API 围绕 DOM(`getByText`, `fireEvent.click`) | 测"用户能不能用",更接近 e2e 的心智模型 |

**社区共识(也是本章基调):优先用 testing-library。** 只有它的 API 不够用时再降级到 test-utils。

理由:
- 测"组件做了什么 DOM" 而不是 "组件内部 state 长什么样" —— 你重构 state 时测试不会塌
- API 更稳定,跨框架(React/Svelte 都有 testing-library)

---

## 1. 渲染 + 断言 DOM

```ts
import { render, screen } from '@testing-library/vue'
import Hello from '../src/Hello.vue'

it('显示 props 传入的名字', () => {
  render(Hello, { props: { name: 'Alice' } })
  expect(screen.getByText('Hello, Alice')).toBeInTheDocument()
})
```

`screen.getByXxx` 系列查询方法:

| 方法 | 找不到时 | 用途 |
|---|---|---|
| `getByText('xxx')` | **抛错** | 一定要在的元素 |
| `queryByText('xxx')` | 返回 null | 验证"不存在" |
| `findByText('xxx')` | 返回 Promise(等待最多 1s) | 异步出现的元素 |

**优先级(testing-library 哲学):**
1. `getByRole('button', { name: 'Save' })` —— 最贴近用户/无障碍
2. `getByLabelText('Email')` —— 表单
3. `getByText('xxx')` —— 一般文本
4. `getByTestId('xxx')` —— 万策尽时的逃生口

---

## 2. 用户交互

```ts
import userEvent from '@testing-library/user-event'

it('点击按钮 count + 1', async () => {
  const user = userEvent.setup()
  render(Counter)

  await user.click(screen.getByRole('button', { name: '+' }))
  expect(screen.getByText('count: 1')).toBeInTheDocument()
})
```

**`userEvent` vs `fireEvent`:**
- `fireEvent.click(el)` —— 直接派发一个 click 事件,简单粗暴
- `userEvent.click(el)` —— 模拟真实用户操作链(focus → mousedown → mouseup → click),会触发更多副作用
- **能用 userEvent 就用 userEvent**

---

## 3. props / emit / slot

```ts
// 测 emit
import { render, fireEvent } from '@testing-library/vue'

it('点击后 emit submit', async () => {
  const { emitted } = render(MyForm)
  await fireEvent.click(screen.getByRole('button'))
  expect(emitted().submit).toBeTruthy()           // emit 过
  expect(emitted().submit[0]).toEqual([{ ok: 1 }]) // 第一次 emit 的参数数组
})

// 测 slot
render(Card, {
  slots: { default: '<p>slot content</p>' }
})
```

---

## 4. 异步与等待

```ts
it('点击后异步加载用户', async () => {
  render(UserCard, { props: { id: 1 } })

  // 立刻看到 loading
  expect(screen.getByText('loading...')).toBeInTheDocument()

  // 等待异步内容出现
  expect(await screen.findByText('Alice')).toBeInTheDocument()
})

// 等待某个元素消失
import { waitForElementToBeRemoved } from '@testing-library/vue'
await waitForElementToBeRemoved(() => screen.queryByText('loading...'))
```

---

## 5. 反例:你不该在 Vue 组件测试里做的事

- ❌ 测组件内部 `data` 字段的值 —— 测 DOM 输出,内部 state 是实现细节
- ❌ 测 computed 单独返回什么 —— 那是单元测试,放到独立函数里测
- ❌ mock 整个 Vuex/Pinia store —— provide 一个测试 store 实例更可控
- ❌ `wrapper.vm.someMethod()` 直接调内部方法 —— 模拟用户操作触发它

---

## 6. Snapshot 在组件里的用法

谨慎用。常见两种姿势:

```ts
// 整个 DOM 结构
expect(container).toMatchSnapshot()

// 只对单个元素结构断言 —— 更精准
expect(screen.getByRole('alert')).toMatchSnapshot()
```

**真实建议:小型 presentational 组件可以,业务组件不要。组件 DOM 容易改,snapshot 噪音大。**
