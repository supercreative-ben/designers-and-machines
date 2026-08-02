import { chromium } from "playwright-core";

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3001", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await page.waitForTimeout(6000); // avatars + OG images

  // Check all images actually loaded (naturalWidth > 0).
  const images = await page
    .locator("[role='dialog'] img")
    .evaluateAll((imgs) =>
      imgs.map((img) => ({
        src: img.currentSrc || img.src,
        ok: img.naturalWidth > 0,
      }))
    );
  for (const img of images) console.log(img.ok ? "OK " : "FAIL", img.src.slice(0, 110));

  const links = await page
    .locator("[role='dialog'] a")
    .evaluateAll((as) => as.map((a) => `${a.target} ${a.href}`));
  console.log("LINKS:", links);

  await page.screenshot({ path: "scripts/preview-tab.png" });

  // Scroll to the bottom of the card to capture the rest.
  await page.locator("[role='dialog'] .overflow-y-auto").evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "scripts/preview-tab-bottom.png" });
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
