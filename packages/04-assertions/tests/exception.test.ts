import { divideStrict } from '../src/examples'

describe('异常断言', () => {
  it('断"会抛错"必须包在函数里', () => {
    // ❌ 这样写会直接抛错让测试失败,而不是进入 expect 判定
    // expect(divideStrict(1, 0)).toThrow()

    // ✅ 正确写法
    expect(() => divideStrict(1, 0)).toThrow()
  })

  it('断错误信息(字符串子串匹配)', () => {
    expect(() => divideStrict(1, 0)).toThrow('Cannot divide')
  })

  it('断错误信息(正则匹配)', () => {
    expect(() => divideStrict(1, 0)).toThrow(/cannot.+zero/i)
  })

  it('断错误类型', () => {
    expect(() => divideStrict(1, 0)).toThrow(TypeError)
  })

  it('断错误实例(几乎不用)', () => {
    expect(() => divideStrict(1, 0)).toThrow(
      new TypeError('Cannot divide by zero')
    )
  })

  it('反向:断"不抛错"', () => {
    expect(() => divideStrict(10, 2)).not.toThrow()
  })

  it('异步函数抛错的姿势(下章详讲)', async () => {
    const asyncFail = async () => {
      throw new Error('async boom')
    }
    // 注意 rejects(不是 toThrow!)+ 必须 await
    await expect(asyncFail()).rejects.toThrow('async boom')
  })
})
