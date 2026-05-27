// 故意和 02 章完全一样 —— 演示"业务代码不变,只换测试运行器"
export function add(a: number, b: number): number {
  return a + b
}

export function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Cannot divide by zero')
  return a / b
}

export function isEven(n: number): boolean {
  return n % 2 === 0
}
