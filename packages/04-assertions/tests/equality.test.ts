describe("相等性 matcher", () => {
  describe("toBe — 引用相等 / 原始值相等", () => {
    it("原始值相等", () => {
      expect(1 + 1).toBe(2);
      expect("hello").toBe("hello");
      expect(true).toBe(true);
    });

    it("对象不同引用就不相等", () => {
      expect({ a: 1 }).not.toBe({ a: 1 });
    });

    it("同一引用相等", () => {
      const obj = { a: 1 };
      expect(obj).toBe(obj);
    });

    it("NaN 不等于 NaN(用 Object.is)", () => {
      // Object.is(NaN, NaN) === true,所以 toBe 也是 true
      expect(NaN).toBe(NaN);
    });

    it("+0 和 -0(用 Object.is 区分)", () => {
      // Object.is(+0, -0) === false —— 这是 === 不能区分的边界
      expect(+0).not.toBe(-0);
    });
  });

  describe("toEqual — 递归结构相等(忽略 undefined 字段)", () => {
    it("对象深度相等", () => {
      expect({ a: 1, b: { c: 2 } }).toEqual({ a: 1, b: { c: 2 } });
    });

    it("数组深度相等", () => {
      expect([1, [2, 3]]).toEqual([1, [2, 3]]);
    });

    it("忽略 undefined 字段", () => {
      expect({ a: 1, b: undefined }).toEqual({ a: 1 });
    });
  });

  describe("toStrictEqual — 严格结构相等", () => {
    it("undefined 字段也要在", () => {
      expect({ a: 1, b: undefined }).not.toStrictEqual({ a: 1 });
      expect({ a: 1, b: undefined }).toStrictEqual({ a: 1, b: undefined });
    });

    it("区分类实例与普通对象", () => {
      class User {
        constructor(public name: string) {}
      }
      const u = new User("A");

      expect(u).toEqual({ name: "A" }); // toEqual 觉得是同的
      expect(u).not.toStrictEqual({ name: "A" }); // toStrictEqual 觉得是不同的(类不同)
    });
  });

  describe("toBeCloseTo — 浮点近似", () => {
    it("0.1 + 0.2 不严格等于 0.3", () => {
      expect(0.1 + 0.2).not.toBe(0.3);
    });

    it("用 toBeCloseTo 可断浮点近似", () => {
      expect(0.1 + 0.2).toBeCloseTo(0.3);
      expect(0.1 + 0.2).toBeCloseTo(0.3, 5); // 第二参数是精度位数
    });
  });
});
