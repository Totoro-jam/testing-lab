import { fetchUser, delay } from '../src/api'

describe('并发与时序', () => {
  it('Promise.all 全部成功', async () => {
    const users = await Promise.all([fetchUser(1), fetchUser(2)])
    expect(users).toHaveLength(2)
    expect(users[0].name).toBe('Alice')
    expect(users[1].name).toBe('Bob')
  })

  it('Promise.all 任一失败即 reject', async () => {
    await expect(
      Promise.all([fetchUser(1), fetchUser(-1)])
    ).rejects.toThrow(/invalid/)
  })

  it('Promise.allSettled 区分成功/失败', async () => {
    const results = await Promise.allSettled([
      fetchUser(1),
      fetchUser(-1),
      fetchUser(999),
    ])

    expect(results[0].status).toBe('fulfilled')
    expect(results[1].status).toBe('rejected')
    expect(results[2].status).toBe('rejected')

    if (results[0].status === 'fulfilled') {
      expect(results[0].value.name).toBe('Alice')
    }
  })

  it('vitest 的 it.concurrent 并行运行同 describe 下测试', async () => {
    // 默认是串行的,加 .concurrent 后这两个 it 会同时跑
    // (本测试只演示用法,真实价值在 IO 密集的 case)
    await delay(10)
    expect(true).toBe(true)
  })
})
