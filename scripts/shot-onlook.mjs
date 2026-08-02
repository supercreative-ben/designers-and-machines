import { chromium } from "playwright-core";
import { mkdirSync } from "fs";

const run = async () => {
  mkdirSync("public/projects", { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 600 },
    deviceScaleFactor: 2,
  });
  await page.goto("https://onlook.com/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(6000);
  const decline = page.getByRole("button", { name: "Decline" });
  if (await decline.isVisible().catch(() => false)) {
    await decline.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: "public/projects/onlook.png" });
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
