import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";
import { handlers } from "./mocks/handlers";

export const server = setupServer(...handlers);

// 启动前所有请求都要由 handler 命中,否则报错
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
// 每个测试结束后,清掉测试里临时 server.use(...) 注册的 handler
afterEach(() => server.resetHandlers());
// 测试套件结束后,停掉拦截
afterAll(() => server.close());
