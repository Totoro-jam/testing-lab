// Page Object Model 演示
// 把页面元素和操作封装成类,测试只写"用户视角的剧本"
import { test, expect, type Page } from "@playwright/test";

const EXAMPLE_HTML = `<!DOCTYPE html>
<html><head><title>Example Domain</title></head>
<body>
  <h1>Example Domain</h1>
  <p><a href="https://www.iana.org/domains/example">More information...</a></p>
</body></html>`;

class ExamplePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("https://example.com");
  }

  get heading() {
    return this.page.getByRole("heading");
  }

  get moreInfoLink() {
    return this.page.getByRole("link", { name: /More information/i });
  }

  async clickMoreInfo() {
    await this.moreInfoLink.click();
  }
}

test.describe("Page Object Model", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://example.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: EXAMPLE_HTML }),
    );
    await page.route("https://www.iana.org/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>IANA</body></html>",
      }),
    );
  });

  test("用 POM 写测试", async ({ page }) => {
    const home = new ExamplePage(page);

    await home.goto();
    await expect(home.heading).toHaveText("Example Domain");

    await home.clickMoreInfo();
    await expect(page).toHaveURL(/iana\.org/);
  });
});

// POM 适用场景:
//  - 大型 e2e suite(50+ 测试)
//  - 一个页面被多个测试复用
//  - 元素经常变,集中改一处比改 50 处省事
//
// 不适用:
//  - 小项目 / 单个 smoke test —— POM 反而是过度设计
