import { chromium } from "playwright-core";

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3001", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: "Lineup", exact: true }).click();
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: "scripts/audit/header-june.png",
    clip: { x: 540, y: 330, width: 360, height: 300 },
  });
  const prev = page.locator("header button").nth(0);
  await prev.click();
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: "scripts/audit/header-may.png",
    clip: { x: 540, y: 330, width: 360, height: 300 },
  });
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
