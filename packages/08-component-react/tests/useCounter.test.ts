import { renderHook, act } from '@testing-library/react'
import { useCounter } from '../src/useCounter'

describe('useCounter (custom hook)', () => {
  it('初始值', () => {
    const { result } = renderHook(() => useCounter(10))
    expect(result.current.count).toBe(10)
  })

  it('inc / dec', () => {
    const { result } = renderHook(() => useCounter())

    // hook 操作必须包在 act 里(没有 user 交互触发自动 act)
    act(() => { result.current.inc() })
    expect(result.current.count).toBe(1)

    act(() => { result.current.dec() })
    expect(result.current.count).toBe(0)
  })

  it('rerender 改变 initial,reset 重置到新值', () => {
    const { result, rerender } = renderHook(
      ({ start }) => useCounter(start),
      { initialProps: { start: 0 } }
    )

    act(() => { result.current.inc() })
    expect(result.current.count).toBe(1)

    rerender({ start: 100 })
    act(() => { result.current.reset() })
    expect(result.current.count).toBe(100)
  })
})
