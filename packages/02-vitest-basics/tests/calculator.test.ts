// globals: true 时不需要 import 这些,但显式 import 也能工作
// 这里演示两种风格——本文件用 globals,下一个文件用 import
import { add, divide, isEven } from "../src/calculator";

describe("calculator", () => {
  describe("add", () => {
    it("正数相加", () => {
      expect(add(1, 2)).toBe(3);
    });

    it("与零相加返回自身", () => {
      expect(add(5, 0)).toBe(5);
    });

    // it.each:表驱动测试,同一逻辑跑多组数据
    // 第二个 it.each 是字符串模板,$a 等会被对应字段替换到测试名里
    it.each([
      { a: 1, b: 2, expected: 3 },
      { a: -1, b: -2, expected: -3 },
      { a: 0, b: 0, expected: 0 },
      { a: 1.5, b: 2.5, expected: 4 },
    ])("add($a, $b) = $expected", ({ a, b, expected }) => {
      expect(add(a, b)).toBe(expected);
    });
  });

  describe("divide", () => {
    it("整除", () => {
      expect(divide(10, 2)).toBe(5);
    });

    // 断言"抛错"的两种写法:正则 / Error 类
    it("除数为 0 时抛出错误(用正则匹配错误信息)", () => {
      expect(() => divide(1, 0)).toThrow(/Cannot divide by zero/);
    });

    it("除数为 0 时抛出 Error 实例", () => {
      expect(() => divide(1, 0)).toThrow(Error);
    });
  });

  describe("isEven", () => {
    it("偶数返回 true", () => {
      expect(isEven(2)).toBe(true);
    });

    it("奇数返回 false", () => {
      expect(isEven(3)).toBe(false);
    });

    // todo:占位,提醒"这个 case 还没写",不会失败
    it.todo("处理负数情况");
  });
});
