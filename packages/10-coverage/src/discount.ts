// 一个故意有"分支"的业务函数,用来演示 branch coverage
export interface Order {
  total: number;
  vip: boolean;
  couponCode?: string;
}

export function calcDiscount(order: Order): number {
  let discount = 0;

  // 分支 1:VIP 减 10%
  if (order.vip) {
    discount += order.total * 0.1;
  }

  // 分支 2:满 1000 再减 50
  if (order.total >= 1000) {
    discount += 50;
  }

  // 分支 3:有 coupon 再减
  if (order.couponCode) {
    if (order.couponCode === "SUMMER") {
      discount += 30;
    } else if (order.couponCode === "WINTER") {
      discount += 20;
    }
    // else: 未识别的 coupon,不加折扣(隐式分支!)
  }

  // 三元:不可超过总价
  return discount > order.total ? order.total : discount;
}

// 没被测过的函数 —— 看看 functions 覆盖率怎么变
export function unusedHelper(x: number): number {
  return x * x;
}
