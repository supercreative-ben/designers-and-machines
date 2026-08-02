import { chromium } from "playwright-core";

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3001", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: "scripts/audit/play-reordered.png",
    clip: { x: 540, y: 330, width: 360, height: 560 },
  });

  const radius = await page
    .locator('input[aria-label="Radius"]')
    .inputValue();
  const slack = await page.locator('input[aria-label="Slack"]').inputValue();
  console.log("radius:", radius, "slack:", slack);

  await page.getByRole("button", { name: "Lineup", exact: true }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: "scripts/audit/lineup-roundnav.png",
    clip: { x: 540, y: 330, width: 360, height: 300 },
  });

  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
