import { chromium } from "playwright-core";

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3001", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "Join", exact: true }).click();
  await page.waitForTimeout(6000); // let the Luma iframe load

  await page.screenshot({ path: "scripts/join-tab.png" });
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
