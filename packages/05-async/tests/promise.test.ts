import { fetchUser } from "../src/api";

describe("Promise 断言", () => {
  describe("await 写法", () => {
    it("resolve 返回值", async () => {
      const u = await fetchUser(1);
      expect(u).toEqual({ id: 1, name: "Alice" });
    });

    it("reject 用 try/catch 接(可读性差,不推荐)", async () => {
      expect.assertions(2); // 强制保证 catch 一定被执行,否则测试失败
      try {
        await fetchUser(-1);
      } catch (err) {
        expect(err).toBeInstanceOf(RangeError);
        expect((err as Error).message).toMatch(/invalid/);
      }
    });
  });

  describe(".resolves / .rejects 写法(推荐)", () => {
    it("resolves.toEqual", async () => {
      await expect(fetchUser(2)).resolves.toEqual({ id: 2, name: "Bob" });
    });

    it("rejects.toThrow + 错误信息", async () => {
      await expect(fetchUser(-1)).rejects.toThrow(/invalid/);
    });

    it("rejects.toBeInstanceOf", async () => {
      await expect(fetchUser(-1)).rejects.toBeInstanceOf(RangeError);
    });

    it("找不到的用户 reject 普通 Error", async () => {
      await expect(fetchUser(999)).rejects.toThrow("user 999 not found");
    });
  });

  describe("忘记 await 的坑", () => {
    it("expect.assertions 保护伞", async () => {
      // 这条断言写在异步链里,如果忘记 await 测试也能通过
      // 用 expect.assertions(N) 告诉 vitest "本测试必须执行 N 次断言"
      expect.assertions(1);
      const u = await fetchUser(1);
      expect(u.name).toBe("Alice");
    });
  });
});
