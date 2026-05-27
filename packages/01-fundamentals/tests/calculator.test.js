// node 内置 test runner,无需任何依赖。
// node:test 提供 test/describe/it;node:assert 提供断言。
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { add, divide } from '../src/calculator.js'

// 最朴素写法:test() 一个个写
test('add: 1 + 2 应该等于 3', () => {
  // Arrange
  const a = 1
  const b = 2

  // Act
  const result = add(a, b)

  // Assert
  assert.equal(result, 3)
})

test('add: 负数也能正常加', () => {
  assert.equal(add(-1, -2), -3)
})

// 分组写法:describe + it
describe('divide(a, b)', () => {
  it('正常除法返回商', () => {
    assert.equal(divide(10, 2), 5)
  })

  it('除数为 0 时抛出错误', () => {
    // 断言"会抛错"的标准姿势:断言一个会抛错的函数,而不是直接调用
    assert.throws(
      () => divide(10, 0),
      /Cannot divide by zero/
    )
  })

  it('被除数为 0 时返回 0', () => {
    assert.equal(divide(0, 5), 0)
  })
})
