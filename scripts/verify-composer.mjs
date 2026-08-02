import { createHmac } from "crypto";
import { readFileSync } from "fs";
import { chromium } from "playwright-core";

const secret = readFileSync(".env.local", "utf8").match(/AUTH_SECRET=(\S+)/)[1];
const payload = Buffer.from(
  JSON.stringify({
    id: "test-1",
    name: "Test User",
    handle: "testuser",
    avatar: "",
    exp: Date.now() + 3600_000,
  })
).toString("base64url");
const token = `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;

const cardClip = async (page, pad = 20) => {
  const card = await page.evaluate(() => {
    const r = document.querySelector('[role="dialog"]').getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  return { x: card.x - pad, y: card.y - pad, width: card.width + pad * 2, height: card.height + 60 };
};

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addCookies([
    { name: "dm_session", value: token, domain: "localhost", path: "/", httpOnly: true },
  ]);
  const page = await context.newPage();
  // Delay messages so the loading indicator stays visible for a screenshot.
  await page.route("**/api/chat/messages", async (route) => {
    await new Promise((r) => setTimeout(r, 8000));
    await route.continue();
  });
  await page.goto("http://localhost:3001", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: "Chat", exact: true }).click();
  await page.waitForSelector("textarea", { timeout: 15000 });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: "scripts/chat-loading.png", clip: await cardClip(page) });

  const composer = await page
    .locator("textarea")
    .evaluate((el) => el.closest("div").getBoundingClientRect());
  const nav = await page.locator("nav").evaluate((el) => el.getBoundingClientRect());
  console.log("COMPOSER:", composer.x.toFixed(1), "w", composer.width.toFixed(1), "bottom", composer.bottom.toFixed(1));
  console.log("NAV PILL:", nav.x.toFixed(1), "w", nav.width.toFixed(1), "top", nav.top.toFixed(1));
  console.log("GAP composer->nav:", (nav.top - composer.bottom).toFixed(1));

  await page.waitForTimeout(8000);
  await page.screenshot({ path: "scripts/chat-loaded.png", clip: await cardClip(page) });
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
