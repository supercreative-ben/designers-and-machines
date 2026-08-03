import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
await page.goto("http://localhost:3001/", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(3500);

// Hero with live spots + rotating avatar
await page.screenshot({ path: "/tmp/verify-hero.png" });

// People tab
await page.locator('button:has-text("People")').first().click();
await page.waitForTimeout(2500);
await page.screenshot({ path: "/tmp/verify-people.png" });

// Lineup tab, scrolled to the bottom for the featured photo placeholder
await page.locator('nav button:has-text("Lineup")').first().click();
await page.waitForTimeout(2000);
await page.evaluate(() => {
  const card = document.querySelector('[role="dialog"] .overflow-y-auto');
  if (card) card.scrollTop = card.scrollHeight;
});
await page.waitForTimeout(1500);
await page.screenshot({ path: "/tmp/verify-lineup-bottom.png" });

await browser.close();
console.log("done");
