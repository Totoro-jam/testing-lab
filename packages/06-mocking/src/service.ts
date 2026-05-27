import { fetchUser, saveUser, type User } from './api'

// 业务逻辑:调 api、拼字符串、再保存
export async function greetUser(id: number): Promise<string> {
  const u = await fetchUser(id)
  return `hello ${u.name}`
}

export async function renameUser(id: number, newName: string): Promise<User> {
  const u = await fetchUser(id)
  const updated = { ...u, name: newName }
  await saveUser(updated)
  return updated
}

// 一个内部含有副作用的函数(写日志),测试时常用 spy
export class Logger {
  log(msg: string) {
    console.log(`[log] ${msg}`)
  }

  warn(msg: string) {
    console.warn(`[warn] ${msg}`)
  }
}

export function processWithLogger(logger: Logger, value: number): number {
  if (value < 0) {
    logger.warn(`negative value: ${value}`)
    return 0
  }
  logger.log(`processing ${value}`)
  return value * 2
}
