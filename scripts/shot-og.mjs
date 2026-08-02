import { chromium } from "playwright-core";

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  await page.goto("http://localhost:3001", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  // Hide the Next.js dev-tools badge
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

  // Draw a couple of extra strings so the artwork feels alive
  await page.mouse.click(430, 200);
  await page.waitForTimeout(400);
  await page.mouse.click(760, 190);
  await page.waitForTimeout(2500);

  await page.screenshot({ path: "app/opengraph-image.png" });
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
