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

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addCookies([
    { name: "dm_session", value: token, domain: "localhost", path: "/", httpOnly: true },
  ]);
  const page = await context.newPage();
  await page.goto("http://localhost:3001", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: "Chat", exact: true }).click();
  await page.waitForSelector("textarea", { timeout: 15000 });
  await page.waitForTimeout(2000);

  const composer = await page
    .locator("textarea")
    .evaluate((el) => el.closest("div").getBoundingClientRect());
  const nav = await page.locator("nav").evaluate((el) => el.getBoundingClientRect());
  console.log("COMPOSER:", composer.x.toFixed(1), "w", composer.width.toFixed(1));
  console.log("NAV PILL:", nav.x.toFixed(1), "w", nav.width.toFixed(1));
  const card = await page.locator("textarea").evaluate((el) => {
    let n = el.parentElement;
    while (n && n.getBoundingClientRect().width < 300) n = n.parentElement;
    const r = n.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  await page.screenshot({
    path: "scripts/composer.png",
    clip: { x: card.x - 20, y: card.y - 20, width: card.width + 40, height: Math.min(card.height + 100, 900 - card.y + 20) },
  });
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
