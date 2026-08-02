import { chromium } from "playwright-core";
import { mkdirSync } from "fs";

const run = async () => {
  mkdirSync("public/projects", { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 600 },
    deviceScaleFactor: 2,
  });
  await page.goto("https://hellothisis.cc/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "public/projects/hellothisis.png" });
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
