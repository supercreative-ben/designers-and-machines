import { chromium } from "playwright-core";

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3001", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const rect = () =>
    page.locator('[role="dialog"]').evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        opacity: s.opacity,
        visibility: s.visibility,
        radius: s.borderRadius,
      };
    });

  console.log("closed:", JSON.stringify(await rect()));

  await page.getByRole("button", { name: "Lineup", exact: true }).click();
  await page.waitForTimeout(150);
  console.log("mid-open:", JSON.stringify(await rect()));
  await page.screenshot({
    path: "scripts/audit/morph-midopen.png",
    clip: { x: 540, y: 330, width: 360, height: 560 },
  });
  await page.waitForTimeout(700);
  console.log("open:", JSON.stringify(await rect()));
  const header = await page.locator("header h2").textContent();
  console.log("DEFAULT MONTH:", header);
  await page.screenshot({
    path: "scripts/audit/morph-open.png",
    clip: { x: 540, y: 330, width: 360, height: 560 },
  });

  await page.getByRole("button", { name: "Lineup", exact: true }).click();
  await page.waitForTimeout(200);
  console.log("mid-close:", JSON.stringify(await rect()));
  await page.screenshot({
    path: "scripts/audit/morph-midclose.png",
    clip: { x: 540, y: 330, width: 360, height: 560 },
  });
  await page.waitForTimeout(600);
  console.log("closed again:", JSON.stringify(await rect()));

  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
