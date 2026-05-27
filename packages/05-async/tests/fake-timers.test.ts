import { vi } from 'vitest'
import { debounce, retry } from '../src/api'

describe('假定时器(fake timers)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())  // 关键:必须还原

  describe('基础:advanceTimersByTime', () => {
    it('setTimeout 不会真的等', () => {
      const fn = vi.fn()
      setTimeout(fn, 5000)

      expect(fn).not.toHaveBeenCalled()  // 还没到
      vi.advanceTimersByTime(4999)
      expect(fn).not.toHaveBeenCalled()  // 还差 1ms
      vi.advanceTimersByTime(1)
      expect(fn).toHaveBeenCalledOnce()
    })

    it('runAllTimers 一次跑光', () => {
      const fn = vi.fn()
      setTimeout(fn, 100)
      setTimeout(fn, 200)
      setTimeout(fn, 300)
      vi.runAllTimers()
      expect(fn).toHaveBeenCalledTimes(3)
    })
  })

  describe('debounce 实战', () => {
    it('300ms 内多次调用只触发一次', () => {
      const spy = vi.fn()
      const debounced = debounce(spy, 300)

      debounced()
      debounced()
      debounced()
      vi.advanceTimersByTime(299)
      expect(spy).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(spy).toHaveBeenCalledOnce()
    })

    it('间隔超过 300ms 各触发一次', () => {
      const spy = vi.fn()
      const debounced = debounce(spy, 300)

      debounced()
      vi.advanceTimersByTime(300)
      debounced()
      vi.advanceTimersByTime(300)

      expect(spy).toHaveBeenCalledTimes(2)
    })
  })

  describe('Date / 系统时间', () => {
    it('setSystemTime 锁定"今天"', () => {
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
      expect(new Date().toISOString()).toBe('2026-01-01T00:00:00.000Z')
      expect(Date.now()).toBe(new Date('2026-01-01T00:00:00Z').getTime())
    })
  })

  describe('Promise + fake timers(高频坑)', () => {
    it('retry 重试 3 次后失败', async () => {
      const failing = vi.fn().mockRejectedValue(new Error('boom'))
      const promise = retry(failing, { times: 2, delay: 100 })

      // 必须用 advanceTimersByTimeAsync,普通的 advance 不会 flush microtasks
      await vi.advanceTimersByTimeAsync(300)

      await expect(promise).rejects.toThrow('boom')
      expect(failing).toHaveBeenCalledTimes(3)  // 1 次原始 + 2 次重试
    })

    it('runAllTimersAsync 跑光所有(含 Promise 链)', async () => {
      const task = vi.fn()
        .mockRejectedValueOnce(new Error('boom1'))
        .mockResolvedValueOnce('ok')

      const promise = retry(task, { times: 1, delay: 50 })
      await vi.runAllTimersAsync()
      await expect(promise).resolves.toBe('ok')
    })
  })
})

// 关键经验总结:
//   1. useFakeTimers 一定要配 afterEach(useRealTimers),否则污染其他测试
//   2. 涉及 Promise 必须用 Async 版本的 API:advanceTimersByTimeAsync / runAllTimersAsync
//   3. 只想假掉 setTimeout 不想动 Promise microtask:useFakeTimers({ toFake: ['setTimeout'] })
