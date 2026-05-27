import { vi } from 'vitest'
import { Logger, processWithLogger } from '../src/service'

describe('vi.spyOn — 监视不替换', () => {
  it('spy 保留原实现', () => {
    const obj = {
      add(a: number, b: number) { return a + b }
    }

    const spy = vi.spyOn(obj, 'add')

    expect(obj.add(2, 3)).toBe(5)  // 原实现还在
    expect(spy).toHaveBeenCalledWith(2, 3)
  })

  it('spy 可以临时替换,再用 mockRestore 还原', () => {
    const obj = {
      now() { return Date.now() }
    }

    const spy = vi.spyOn(obj, 'now').mockReturnValue(123456)
    expect(obj.now()).toBe(123456)

    spy.mockRestore()
    expect(obj.now()).not.toBe(123456)  // 已还原
  })

  it('实战:验证 logger 被正确调用', () => {
    const logger = new Logger()
    const logSpy = vi.spyOn(logger, 'log')
    const warnSpy = vi.spyOn(logger, 'warn')

    expect(processWithLogger(logger, 5)).toBe(10)
    expect(logSpy).toHaveBeenCalledWith('processing 5')
    expect(warnSpy).not.toHaveBeenCalled()

    expect(processWithLogger(logger, -1)).toBe(0)
    expect(warnSpy).toHaveBeenCalledWith('negative value: -1')
  })

  it('spy on console.log(全局对象,记得 restore)', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    console.log('quiet')
    expect(spy).toHaveBeenCalledWith('quiet')
    spy.mockRestore()
  })
})
