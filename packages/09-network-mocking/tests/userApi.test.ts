import { http, HttpResponse } from "msw";
import { server } from "./setup";
import { createUser, fetchUser, listUsers } from "../src/userApi";

describe("userApi (with MSW)", () => {
  describe("fetchUser", () => {
    it("返回 handler 配置的用户", async () => {
      const u = await fetchUser(1);
      expect(u).toEqual({ id: 1, name: "Alice" });
    });

    it("404 抛错", async () => {
      await expect(fetchUser(999)).rejects.toThrow(/404/);
    });

    it("server.use 临时让 server 报 500", async () => {
      server.use(
        http.get(
          "https://api.example.com/users/:id",
          () => new HttpResponse("boom", { status: 500 }),
        ),
      );
      await expect(fetchUser(1)).rejects.toThrow(/500/);
    });

    it("上面那个临时 handler 已经被 resetHandlers 清掉了", async () => {
      const u = await fetchUser(1);
      expect(u.name).toBe("Alice");
    });
  });

  describe("createUser", () => {
    it("POST 后返回新用户", async () => {
      const u = await createUser("Charlie");
      expect(u.id).toBeGreaterThan(0);
      expect(u.name).toBe("Charlie");
    });

    it("断言请求 body 是否符合预期(用 server.use 拦截读 body)", async () => {
      let receivedBody: unknown = null;
      server.use(
        http.post("https://api.example.com/users", async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({ id: 999, name: "whatever" }, { status: 201 });
        }),
      );

      await createUser("Dave");
      expect(receivedBody).toEqual({ name: "Dave" });
    });
  });

  describe("listUsers", () => {
    it("无 query 返回全部", async () => {
      const list = await listUsers();
      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it("q 参数过滤", async () => {
      const list = await listUsers({ q: "ali" });
      expect(list).toEqual([expect.objectContaining({ name: "Alice" })]);
    });
  });
});

// 这章关键经验:
//   1. 业务代码用 fetch,测试用 MSW 拦截,完全不需要在业务里"注入 client"
//   2. 默认 handlers 写公共桩,server.use 写本测试独有的桩
//   3. 想验证请求参数 -> 把 body / URL 在 handler 里取出来,存到外部变量再断言
