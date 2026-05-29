import { vi } from "vitest";
import { greetUser } from "../src/service";
import { fetchUser } from "../src/api";

// importActual — 只 mock 部分 export,其余保留真实现
vi.mock("../src/api", async () => {
  const actual = await vi.importActual<typeof import("../src/api")>("../src/api");
  return {
    ...actual,
    fetchUser: vi.fn().mockResolvedValue({ id: 99, name: "mocked" }),
  };
});

describe("vi.mock + importActual — 只 mock 部分 export", () => {
  it("fetchUser 被 mock,saveUser 用真实现", async () => {
    const msg = await greetUser(1);
    expect(msg).toBe("hello mocked");
    expect(fetchUser).toHaveBeenCalledWith(1);
  });
});
