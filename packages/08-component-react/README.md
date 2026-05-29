# 08 · React 组件测试

[`@testing-library/react`](https://github.com/testing-library/react-testing-library) 的 API 和 Vue 版几乎一致(同一个家族的库),所以这章重点放在 **React 特有的坑**。

---

## 1. 基本 API 一对一

```tsx
import { render, screen } from '@testing-library/react'

render(<Hello name="Alice" />)
expect(screen.getByText('Hello, Alice')).toBeInTheDocument()
```

`getByRole` / `queryByRole` / `findByRole` 的语义跟 Vue 那章完全一样,这里不重复。

### `userEvent` 常用方法速查

使用前先创建用户实例:`const user = userEvent.setup()`

| 方法 | 模拟操作 | 例子 |
|---|---|---|
| `user.click(el)` | 鼠标点击 | `await user.click(button)` |
| `user.dblClick(el)` | 双击 | `await user.dblClick(el)` |
| `user.type(el, text)` | 逐字输入 | `await user.type(input, "hello")` |
| `user.clear(el)` | 清空输入框 | `await user.clear(input)` |
| `user.tab()` | 按 Tab 键 | `await user.tab()` |
| `user.keyboard(keys)` | 按键序列 | `await user.keyboard("{Enter}")` |
| `user.hover(el)` | 鼠标悬停 | `await user.hover(el)` |
| `user.selectOptions(el, v)` | 选择下拉选项 | `await user.selectOptions(sel, ["a"])` |
| `user.upload(el, file)` | 文件上传 | `await user.upload(input, file)` |

`type` 是往输入框打字;`keyboard` 是纯键盘事件(如 `{Enter}`、`{Control>}c`),不关心输入框。

---

## 2. React 独有的坑

### 坑 A:`act` 警告

控制台经常看到 `Warning: An update to X inside a test was not wrapped in act(...)`。

99% 的场景下你**不需要手动 wrap** —— `render` / `userEvent` 内部已经处理。
出现这个警告通常意味着:

- 异步 state 更新没等完 → 改用 `await screen.findByXxx`
- 在测试函数外触发了更新 → 把这段逻辑搬进 `await act(async () => {...})`

### 坑 B:hooks 测试

测自定义 hook 不需要写组件,用 `renderHook`:

```ts
import { renderHook, act } from '@testing-library/react'

it('useCounter', () => {
  const { result } = renderHook(() => useCounter(5))
  expect(result.current.count).toBe(5)

  act(() => result.current.inc())
  expect(result.current.count).toBe(6)
})
```

`act` 在 renderHook 场景下**确实需要手写**,因为没有 user 交互来触发。

### 坑 C:严格模式下的双重渲染

`<StrictMode>` 会让组件在 dev 时渲染两次(检测副作用)。测试时如果你在 setup 里包了 StrictMode,要注意:
- `useEffect` 会跑两次
- 测 mock 函数调用次数时,记得 `toHaveBeenCalledTimes(2)` 而不是 1

---

## 3. Provider / Context 怎么测

把 provider 包装成一个 `customRender`:

```tsx
function renderWithProviders(ui: React.ReactElement, opts?: { theme?: 'light' | 'dark' }) {
  return render(
    <ThemeProvider value={opts?.theme ?? 'light'}>
      {ui}
    </ThemeProvider>
  )
}

renderWithProviders(<Button />, { theme: 'dark' })
```

**反例:**直接 mock `useContext` —— 脆且不直观。包 provider 才是工业标准。

---

## 4. 表单交互完整示例

```tsx
it('提交表单', async () => {
  const onSubmit = vi.fn()
  const user = userEvent.setup()
  render(<LoginForm onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText(/email/i), 'a@b.com')
  await user.type(screen.getByLabelText(/password/i), '123456')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com', password: '123456' })
})
```

---

## 5. 总结口诀

| 想测 | 用 |
|---|---|
| 渲染结果 | `render` + `screen.getByXxx` |
| 用户操作 | `userEvent`(不是 fireEvent) |
| 异步出现 | `findByXxx` 或 `waitFor` |
| 自定义 hook | `renderHook` + 手动 `act` |
| 需要 Provider | 自己写 `customRender` 包一层 |
| context/store | 真实 provider + 测试数据,不要 mock useContext |

---

## 延伸阅读

- [@testing-library/react](https://github.com/testing-library/react-testing-library) · [文档](https://testing-library.com/docs/react-testing-library/intro)
- [@testing-library/user-event](https://github.com/testing-library/user-event) — 模拟真实用户交互
- [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) — DOM 专用 matcher(toBeVisible、toHaveTextContent 等)
- [React 官方 — Testing](https://react.dev/learn/testing)
