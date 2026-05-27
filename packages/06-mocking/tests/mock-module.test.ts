import { vi } from 'vitest'
import { greetUser, renameUser } from '../src/service'
import { fetchUser, saveUser } from '../src/api'

// vi.mock 是 hoisted —— 即使写在 import 下面,实际执行时会被提到最顶部
vi.mock('../src/api')

describe('vi.mock — 整个模块替换', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mock fetchUser 后,service 拿到我们指定的数据', async () => {
    vi.mocked(fetchUser).mockResolvedValue({ id: 1, name: 'Alice' })

    const msg = await greetUser(1)
    expect(msg).toBe('hello Alice')
    expect(fetchUser).toHaveBeenCalledWith(1)
  })

  it('renameUser 先 fetch 再 save', async () => {
    vi.mocked(fetchUser).mockResolvedValue({ id: 5, name: 'old' })
    vi.mocked(saveUser).mockResolvedValue(undefined)

    const result = await renameUser(5, 'new')
    expect(result).toEqual({ id: 5, name: 'new' })

    expect(fetchUser).toHaveBeenCalledWith(5)
    expect(saveUser).toHaveBeenCalledWith({ id: 5, name: 'new' })
  })

  it('断言调用顺序', async () => {
    vi.mocked(fetchUser).mockResolvedValue({ id: 1, name: 'A' })
    vi.mocked(saveUser).mockResolvedValue(undefined)

    await renameUser(1, 'B')

    // 通过 mock.invocationCallOrder 拿到全局调用顺序号
    expect(vi.mocked(fetchUser).mock.invocationCallOrder[0])
      .toBeLessThan(vi.mocked(saveUser).mock.invocationCallOrder[0])
  })
})

describe('vi.mock + importActual — 只 mock 部分 export', () => {
  // 用工厂函数返回一个对象,展开 actual 再覆盖想 mock 的字段
  vi.mock('../src/api', async () => {
    const actual = await vi.importActual<typeof import('../src/api')>('../src/api')
    return {
      ...actual,
      fetchUser: vi.fn().mockResolvedValue({ id: 99, name: 'mocked' }),
    }
  })

  it('fetchUser 被 mock,saveUser 用真实现', async () => {
    const msg = await greetUser(1)
    expect(msg).toBe('hello mocked')
  })
})
