import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { Cart } from '../src/cart.js'

describe('Cart', () => {
  let cart

  // beforeEach 在每个 test 前重置环境 —— 保证测试独立
  // 这是后面所有框架(vitest/jest/mocha)都有的概念
  beforeEach(() => {
    cart = new Cart()
  })

  describe('add()', () => {
    test('空购物车添加一个商品后,items 长度为 1 且 total 等于商品价格', () => {
      const item = { id: 1, name: 'apple', price: 10 }

      cart.add(item)

      // 同一个事实的两个维度:数量 + 金额,可以都断
      assert.equal(cart.items.length, 1)
      assert.equal(cart.total, 10)
    })

    test('添加多个商品时,total 等于各价格之和', () => {
      cart.add({ id: 1, price: 10 })
      cart.add({ id: 2, price: 20 })
      cart.add({ id: 3, price: 30 })

      assert.equal(cart.total, 60)
    })

    test('添加无效商品(无 price)时抛出错误', () => {
      assert.throws(
        () => cart.add({ id: 1 }),
        /Invalid item/
      )
    })

    test('添加 null 时抛出错误', () => {
      assert.throws(() => cart.add(null), /Invalid item/)
    })
  })

  describe('remove()', () => {
    test('删除存在的商品后,items 不再包含该商品', () => {
      cart.add({ id: 1, price: 10 })
      cart.add({ id: 2, price: 20 })

      cart.remove(1)

      assert.equal(cart.items.length, 1)
      assert.equal(cart.items[0].id, 2)
    })

    test('删除不存在的 id 时,items 长度不变', () => {
      cart.add({ id: 1, price: 10 })

      cart.remove(999)

      assert.equal(cart.items.length, 1)
    })
  })

  describe('clear()', () => {
    test('清空后 items 为空、total 为 0', () => {
      cart.add({ id: 1, price: 10 })
      cart.add({ id: 2, price: 20 })

      cart.clear()

      assert.deepEqual(cart.items, [])
      assert.equal(cart.total, 0)
    })
  })
})
