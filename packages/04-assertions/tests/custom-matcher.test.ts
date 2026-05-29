import { expect } from "vitest";

// 1. 扩展 matcher 实现
expect.extend({
  toBeValidEmail(received: unknown) {
    const pass = typeof received === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received);
    return {
      pass,
      // pass 时显示在 .not.toBeValidEmail 失败时;反之同理
      message: () =>
        pass
          ? `expected ${JSON.stringify(received)} not to be a valid email`
          : `expected ${JSON.stringify(received)} to be a valid email`,
    };
  },

  toBeWithinRange(received: number, floor: number, ceil: number) {
    const pass = received >= floor && received <= ceil;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be within ${floor}..${ceil}`
          : `expected ${received} to be within ${floor}..${ceil}`,
    };
  },
});

// 2. 加 TS 类型声明,让 expect(x).toBeValidEmail() 有类型提示
declare module "vitest" {
  interface Assertion<T = any> {
    toBeValidEmail(): T;
    toBeWithinRange(floor: number, ceil: number): T;
  }
  interface AsymmetricMatchersContaining {
    toBeValidEmail(): any;
    toBeWithinRange(floor: number, ceil: number): any;
  }
}

describe("自定义 matcher", () => {
  it("toBeValidEmail 通过", () => {
    expect("alice@example.com").toBeValidEmail();
  });

  it("toBeValidEmail 失败信息友好", () => {
    expect("not-an-email").not.toBeValidEmail();
    expect(123).not.toBeValidEmail();
  });

  it("toBeWithinRange 接受范围", () => {
    expect(5).toBeWithinRange(1, 10);
    expect(0).not.toBeWithinRange(1, 10);
  });
});

// 现实判断:何时该写自定义 matcher?
//   - 同一个断言在 3+ 个测试里出现
//   - 业务概念明确(比如"合法订单号""有效手机号")
//   - 用原生 matcher 写起来 > 3 行
// 否则直接用原生 matcher + 一个 helper 函数就够,别滥用 expect.extend
