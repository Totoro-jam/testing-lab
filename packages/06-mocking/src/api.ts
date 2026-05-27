export interface User {
  id: number
  name: string
}

// 模拟一个真实会发请求的 API
export async function fetchUser(id: number): Promise<User> {
  // 真实场景这里是 fetch(...)
  return { id, name: `User${id}` }
}

export async function saveUser(u: User): Promise<void> {
  // 真实场景这里是 fetch(..., { method: 'POST' })
}
