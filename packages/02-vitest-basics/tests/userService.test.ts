// 显式 import 风格(即使 globals: true 也合法)
// 真实项目推荐显式 import,IDE 跳转 + 不依赖全局环境
import { describe, it, expect, beforeEach } from 'vitest'
import { UserService } from '../src/userService'

describe('UserService', () => {
  let service: UserService

  beforeEach(() => {
    // 每个测试前都重新创建 —— 保证测试间没有状态泄漏
    service = new UserService()
  })

  describe('create()', () => {
    it('合法用户被创建后,返回带 id 的用户对象', () => {
      const user = service.create({ name: 'Alice', email: 'a@x.com' })

      expect(user.id).toBe(1)
      expect(user.name).toBe('Alice')
      expect(user.email).toBe('a@x.com')
    })

    it('连续创建,id 自增', () => {
      const u1 = service.create({ name: 'A', email: 'a@x.com' })
      const u2 = service.create({ name: 'B', email: 'b@x.com' })

      expect(u1.id).toBe(1)
      expect(u2.id).toBe(2)
    })

    it('email 不含 @ 时抛错', () => {
      expect(() =>
        service.create({ name: 'X', email: 'invalid' })
      ).toThrow('Invalid email')
    })
  })

  describe('findById()', () => {
    it('存在的 id 返回用户', () => {
      const created = service.create({ name: 'Alice', email: 'a@x.com' })

      const found = service.findById(created.id)

      // toEqual 做"深度相等",对比对象结构;toBe 是引用相等
      expect(found).toEqual(created)
    })

    it('不存在的 id 返回 null', () => {
      expect(service.findById(999)).toBeNull()
    })
  })

  describe('list() + count()', () => {
    it('初始为空', () => {
      expect(service.list()).toEqual([])
      expect(service.count()).toBe(0)
    })

    it('创建多个后,list 返回所有用户', () => {
      service.create({ name: 'A', email: 'a@x.com' })
      service.create({ name: 'B', email: 'b@x.com' })

      expect(service.count()).toBe(2)
      // toHaveLength:数组/字符串长度的专用断言,失败信息更清晰
      expect(service.list()).toHaveLength(2)
    })
  })

  describe('delete()', () => {
    it('删除存在的用户,返回 true,count 减 1', () => {
      const u = service.create({ name: 'A', email: 'a@x.com' })

      const ok = service.delete(u.id)

      expect(ok).toBe(true)
      expect(service.count()).toBe(0)
    })

    it('删除不存在的 id,返回 false', () => {
      expect(service.delete(999)).toBe(false)
    })
  })

  // 标记跳过——演示 skip 怎么用(报告里会显示但不执行)
  describe.skip('未来要做:update()', () => {
    it('能更新用户名', () => {
      // ...
    })
  })
})
