import { chromium } from "playwright-core";

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3001", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await page.waitForTimeout(700);
  const openShot = await page
    .locator('[role="dialog"]')
    .evaluate((el) => getComputedStyle(el).opacity);
  console.log("open opacity:", openShot);

  // Close and grab a frame mid-animation: content should still be visible.
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await page.waitForTimeout(180);
  const mid = await page.locator('[role="dialog"]').evaluate((el) => ({
    opacity: getComputedStyle(el).opacity,
    hasContent: el.textContent.length > 20,
  }));
  console.log("mid-close:", JSON.stringify(mid));
  await page.screenshot({
    path: "scripts/card-midclose.png",
    clip: { x: 540, y: 330, width: 360, height: 560 },
  });

  await page.waitForTimeout(700);
  const closed = await page.locator('[role="dialog"]').evaluate((el) => ({
    opacity: getComputedStyle(el).opacity,
    contentLength: el.textContent.length,
  }));
  console.log("closed:", JSON.stringify(closed));
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
