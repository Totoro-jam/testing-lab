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

  describe('it.concurrent 并行运行', () => {
    it.concurrent('任务 A', async () => {
      await delay(50)
      expect(1 + 1).toBe(2)
    })

    it.concurrent('任务 B', async () => {
      await delay(50)
      expect(2 + 2).toBe(4)
    })

    // 任务 A 和 B 同时开始,总耗时 ≈ 50ms 而非 100ms
  })
})
