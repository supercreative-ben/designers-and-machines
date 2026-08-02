import { chromium } from "playwright-core";

const shot = (page, name) =>
  page.screenshot({ path: `scripts/audit/${name}.png` });

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });

  // --- Desktop, fresh visitor ---
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3001", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  await shot(page, "01-landing");

  // Try the canvas interaction: click a few places
  await page.mouse.click(400, 300);
  await page.waitForTimeout(300);
  await page.mouse.click(900, 250);
  await page.waitForTimeout(300);
  await page.mouse.click(700, 500);
  await page.waitForTimeout(1200);
  await shot(page, "02-after-canvas-clicks");

  // Preview tab
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await page.waitForTimeout(1500);
  await shot(page, "03-preview-initial");

  // Navigate back a month
  const prev = page.locator('button[aria-label*="revious"], button[aria-label*="rev"]').first();
  if (await prev.count()) {
    await prev.click();
    await page.waitForTimeout(2500);
    await shot(page, "04-preview-prev-month");
    await prev.click();
    await page.waitForTimeout(2500);
    await shot(page, "05-preview-prev-month-2");
  }

  // Play tab
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(1200);
  await shot(page, "06-play");

  // Scroll play tab content
  await page.mouse.move(720, 600);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(600);
  await shot(page, "07-play-scrolled");

  // Toggle code overlay if present
  const eye = page.locator('button[aria-label*="Strudel"]').first();
  if (await eye.count()) {
    await eye.click();
    await page.waitForTimeout(1000);
    await shot(page, "08-play-code-overlay");
    await eye.click();
  }

  // Chat tab (logged out)
  await page.getByRole("button", { name: "Chat", exact: true }).click();
  await page.waitForTimeout(1200);
  await shot(page, "09-chat-logged-out");

  // Join tab
  await page.getByRole("button", { name: "Join", exact: true }).click();
  await page.waitForTimeout(3500);
  await shot(page, "10-join");

  // Close card, look at page again
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  await page.close();

  // --- Mobile, fresh visitor ---
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    hasTouch: true,
    isMobile: true,
  });
  await mobile.goto("http://localhost:3001", { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(3500);
  await shot(mobile, "11-mobile-landing");

  await mobile.getByRole("button", { name: "Preview", exact: true }).click();
  await mobile.waitForTimeout(1500);
  await shot(mobile, "12-mobile-preview");

  await mobile.getByRole("button", { name: "Join", exact: true }).click();
  await mobile.waitForTimeout(3000);
  await shot(mobile, "13-mobile-join");

  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
