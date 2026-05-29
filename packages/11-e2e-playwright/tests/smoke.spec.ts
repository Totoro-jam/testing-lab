import { test, expect } from "@playwright/test";

const EXAMPLE_HTML = `<!DOCTYPE html>
<html><head><title>Example Domain</title></head>
<body>
  <h1>Example Domain</h1>
  <p>This domain is for use in illustrative examples.</p>
  <p><a href="https://www.iana.org/domains/example">More information...</a></p>
</body></html>`;

// 用 route.fulfill 拦截请求，不依赖外部网络（CI 环境网络不稳定）
test.describe("example.com 冒烟", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://example.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: EXAMPLE_HTML }),
    );
  });

  test("页面标题正确", async ({ page }) => {
    await page.goto("https://example.com");
    await expect(page).toHaveTitle(/Example Domain/);
  });

  test("页面上有 More information 链接", async ({ page }) => {
    await page.goto("https://example.com");
    const link = page.getByRole("link", { name: /More information/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /iana\.org/);
  });

  test("点击链接跳转到 iana.org", async ({ page }) => {
    // 同时拦截 iana.org 的跳转目标
    await page.route("https://www.iana.org/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>IANA</body></html>",
      }),
    );

    await page.goto("https://example.com");
    await page.getByRole("link", { name: /More information/i }).click();
    await expect(page).toHaveURL(/iana\.org/);
  });
});
