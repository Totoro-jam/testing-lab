import { calcDiscount } from "../src/discount";

describe("calcDiscount", () => {
  // 这组测试故意只覆盖部分分支
  // 跑 pnpm test:coverage 后,你会看到 branches 不是 100%
  // 然后你应该思考:"剩下的分支值得补吗?"

  it("VIP 减 10%", () => {
    expect(calcDiscount({ total: 100, vip: true })).toBe(10);
  });

  it("普通用户无折扣", () => {
    expect(calcDiscount({ total: 100, vip: false })).toBe(0);
  });

  it("满 1000 减 50", () => {
    expect(calcDiscount({ total: 1000, vip: false })).toBe(50);
  });

  it("VIP + 满 1000", () => {
    expect(calcDiscount({ total: 1000, vip: true })).toBe(150);
  });

  it("SUMMER coupon", () => {
    expect(calcDiscount({ total: 100, vip: false, couponCode: "SUMMER" })).toBe(30);
  });

  // 故意不测:
  // - WINTER coupon
  // - 未知 coupon code
  // - 折扣超过总价的边界
  // - unusedHelper
  //
  // 跑 coverage 后,HTML 报告会清晰标出来,这就是 coverage 真正的价值:
  // 不是绿了就行,而是"还有哪儿没测过,值不值得补"。
});
