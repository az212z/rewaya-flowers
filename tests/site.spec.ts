import { test, expect } from "@playwright/test";

test.describe("رواية للزهور — site", () => {
  test("loads with RTL Arabic and correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/رواية للزهور/);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "ar");
  });

  test("hero headline and primary CTA visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: "اطلب باقتك", exact: true })).toBeVisible();
  });

  test("Google rating is cited", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/تقييم 310 على خرائط قوقل/)).toBeVisible();
  });

  test("every image has a src that resolves and an alt", async ({ page }) => {
    await page.goto("/");
    // scroll through the page so lazy images load
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    const imgs = page.locator("main img, header img, footer img");
    const count = await imgs.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const img = imgs.nth(i);
      const alt = await img.getAttribute("alt");
      expect(alt).not.toBeNull();
      await expect(img).toHaveJSProperty("complete", true);
      const natural = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(natural).toBeGreaterThan(0);
    }
  });

  test("mobile full-screen menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const menu = page.locator("[data-menu]");
    await expect(menu).toHaveAttribute("aria-hidden", "true");
    await page.locator("[data-burger]").click();
    await expect(menu).toHaveClass(/open/);
    await expect(menu).toHaveAttribute("aria-hidden", "false");
    // overlay covers full viewport
    const box = await menu.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(380);
    await page.locator("[data-menu-close]").click();
    await expect(menu).not.toHaveClass(/open/);
  });

  test("no horizontal scroll at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("order form validates required fields", async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-order-form] button[type=submit]").click();
    await expect(page.getByText("فضلًا اكتب الاسم")).toBeVisible();
  });

  test("valid order shows success toast", async ({ page, context }) => {
    await context.grantPermissions([]);
    await page.goto("/");
    await page.fill("#name", "نورة");
    await page.fill("#phone", "0551234567");
    await page.selectOption("#service", "باقة ورد");
    // prevent real tab from opening
    await page.evaluate(() => { window.open = () => null; });
    await page.locator("[data-order-form] button[type=submit]").click();
    await expect(page.locator("[data-toast]")).toHaveClass(/show/);
  });

  test("404 page has return-home link", async ({ page }) => {
    await page.goto("/404.html");
    await expect(page.getByRole("link", { name: "العودة للرئيسية" })).toBeVisible();
  });
});
