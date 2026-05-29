import { sampleUser, sampleUsers } from "../src/examples";

describe("部分匹配 matcher (最常用!)", () => {
  describe("expect.objectContaining", () => {
    it("只断对象的部分字段,其他字段不管", () => {
      expect(sampleUser).toEqual(
        expect.objectContaining({
          name: "Alice",
          email: expect.stringMatching(/@example\.com$/),
        }),
      );
    });

    it("嵌套使用", () => {
      expect(sampleUser).toEqual(
        expect.objectContaining({
          profile: expect.objectContaining({
            city: "Shanghai",
          }),
        }),
      );
    });
  });

  describe("expect.arrayContaining", () => {
    it("数组必须包含这些元素(顺序不限,可有额外元素)", () => {
      expect(["a", "b", "c", "d"]).toEqual(expect.arrayContaining(["b", "a"]));
    });

    it("对象数组里找指定结构的元素", () => {
      expect(sampleUsers).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: "Alice" })]),
      );
    });
  });

  describe("expect.stringContaining / stringMatching", () => {
    it("包含子串", () => {
      expect("hello world").toEqual(expect.stringContaining("world"));
    });

    it("匹配正则", () => {
      expect("error: 404").toEqual(expect.stringMatching(/^error:/));
    });
  });

  describe("expect.any / expect.anything", () => {
    it("any 匹配某类型", () => {
      expect({ id: 1, createdAt: new Date() }).toEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
      });
    });

    it("anything 匹配任意非 null/undefined 值", () => {
      expect({ id: 1, name: "A" }).toEqual({
        id: 1,
        name: expect.anything(),
      });
    });
  });
});
