// 模拟一个异步 API 模块。所有函数都返回 Promise,刻意不依赖任何外部网络
// (真实场景下 fetchUser 会调 fetch,这里直接用 setTimeout 模拟延迟)

export interface User {
  id: number
  name: string
}

const DB: Record<number, User> = {
  1: { id: 1, name: 'Alice' },
  2: { id: 2, name: 'Bob' },
}

export function fetchUser(id: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id < 0) {
        reject(new RangeError(`invalid id: ${id}`))
        return
      }
      const u = DB[id]
      if (!u) {
        reject(new Error(`user ${id} not found`))
        return
      }
      resolve(u)
    }, 50)
  })
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 防抖:N ms 内连续触发只执行最后一次
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: A) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

// 重试:失败后按 delay 等待并重试,times 次后仍失败则 reject
export async function retry<T>(
  task: () => Promise<T>,
  opts: { times: number; delay: number }
): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i <= opts.times; i++) {
    try {
      return await task()
    } catch (err) {
      lastErr = err
      if (i < opts.times) await delay(opts.delay)
    }
  }
  throw lastErr
}
