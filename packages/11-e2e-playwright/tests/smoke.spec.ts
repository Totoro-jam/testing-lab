import { test, expect } from "@playwright/test";

// example.com 是 IANA 的官方占位站,可放心当公网 e2e 对象
test.describe("example.com 冒烟", () => {
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
    await page.goto("https://example.com");
    await page.getByRole("link", { name: /More information/i }).click();
    await expect(page).toHaveURL(/iana\.org/);
  });
});
