// 稍微有状态一点的被测代码:购物车。
// 用它演示"对象/类"类型的测试以及多 assert 边界。

export class Cart {
  constructor() {
    this.items = []
  }

  add(item) {
    if (!item || typeof item.price !== 'number') {
      throw new Error('Invalid item')
    }
    this.items.push(item)
  }

  remove(itemId) {
    this.items = this.items.filter(i => i.id !== itemId)
  }

  get total() {
    return this.items.reduce((sum, i) => sum + i.price, 0)
  }

  clear() {
    this.items = []
  }
}
