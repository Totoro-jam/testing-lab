// 一个最简单的"被测代码":纯函数,无副作用,无依赖。
// 真实业务代码很少这么干净,但概念演示用它最合适。

export function add(a, b) {
  return a + b
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero')
  }
  return a / b
}
