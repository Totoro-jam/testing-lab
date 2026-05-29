// jest 默认 globals: true,本可以不 import
// 但显式 import 让 IDE 跳转更好,也是社区推荐
import { describe, it, expect } from "@jest/globals";
import { add, divide, isEven } from "../src/calculator";

describe("calculator (jest 版)", () => {
  describe("add", () => {
    it("正数相加", () => {
      expect(add(1, 2)).toBe(3);
    });

    // 注意:jest 是 it.each / test.each,语法和 vitest 一致
    it.each([
      [1, 2, 3],
      [-1, -2, -3],
      [0, 0, 0],
    ])("add(%i, %i) = %i", (a, b, expected) => {
      expect(add(a, b)).toBe(expected);
    });
  });

  describe("divide", () => {
    it("整除", () => {
      expect(divide(10, 2)).toBe(5);
    });

    it("除数为 0 抛错", () => {
      expect(() => divide(1, 0)).toThrow("Cannot divide by zero");
    });
  });

  describe("isEven", () => {
    it.each([
      [2, true],
      [3, false],
      [0, true],
      [-1, false],
    ])("isEven(%i) = %p", (n, expected) => {
      expect(isEven(n)).toBe(expected);
    });
  });
});
