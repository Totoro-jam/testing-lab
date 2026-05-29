import { vi } from "vitest";

describe("全局对象 stub", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stubGlobal 替换 fetch", async () => {
    const fakeResponse = new Response(JSON.stringify({ hello: "world" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(fakeResponse));

    const res = await fetch("https://example.com/api");
    const json = await res.json();
    expect(json).toEqual({ hello: "world" });
    expect(fetch).toHaveBeenCalledWith("https://example.com/api");
  });

  it("stubGlobal 替换 window 上的某个属性(浏览器场景)", () => {
    vi.stubGlobal("navigator", { userAgent: "fake-bot/1.0" });
    expect(navigator.userAgent).toBe("fake-bot/1.0");
  });

  it("stubEnv 替换环境变量", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(process.env.NODE_ENV).toBe("production");
    vi.unstubAllEnvs();
  });
});

// 关键经验:
//  - 全局对象 stub 一定要 afterEach 还原,否则会污染同一进程内其它测试
//  - 真正大型项目里建议在 vitest.config.ts 设 unstubGlobals: true / unstubEnvs: true
//    让框架自动 afterEach,人就不用写 clean-up 了
