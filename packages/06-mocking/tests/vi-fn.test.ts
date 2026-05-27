import { vi } from 'vitest'

describe('vi.fn — mock function 基础', () => {
  it('记录调用次数和参数', () => {
    const fn = vi.fn()
    fn('a')
    fn('b', 'c')

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith('a')
    expect(fn).toHaveBeenCalledWith('b', 'c')
    expect(fn).toHaveBeenNthCalledWith(1, 'a')
    expect(fn).toHaveBeenLastCalledWith('b', 'c')
  })

  it('mockReturnValue 固定返回值', () => {
    const fn = vi.fn().mockReturnValue(42)
    expect(fn()).toBe(42)
    expect(fn()).toBe(42)
  })

  it('mockReturnValueOnce 用完即弃', () => {
    const fn = vi.fn().mockReturnValue('default')
      .mockReturnValueOnce('first')
      .mockReturnValueOnce('second')

    expect(fn()).toBe('first')
    expect(fn()).toBe('second')
    expect(fn()).toBe('default')  // Once 用完落到 default
  })

  it('mockResolvedValue / mockRejectedValue', async () => {
    const ok = vi.fn().mockResolvedValue({ data: 1 })
    const fail = vi.fn().mockRejectedValue(new Error('boom'))

    await expect(ok()).resolves.toEqual({ data: 1 })
    await expect(fail()).rejects.toThrow('boom')
  })

  it('mockImplementation 自定义行为', () => {
    const fn = vi.fn().mockImplementation((a: number, b: number) => a + b)
    expect(fn(1, 2)).toBe(3)
  })

  it('mock.calls / mock.results 原始数据', () => {
    const fn = vi.fn((x: number) => x * 2)
    fn(1); fn(2); fn(3)

    expect(fn.mock.calls).toEqual([[1], [2], [3]])
    expect(fn.mock.results.map(r => r.value)).toEqual([2, 4, 6])
  })
})
