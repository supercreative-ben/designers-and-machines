import { createHmac } from "crypto";
import { readFileSync } from "fs";
import { chromium } from "playwright-core";

// Mint a session token exactly like lib/session.ts does.
const env = readFileSync(".env.local", "utf8");
const secret = env.match(/^AUTH_SECRET="?([^"\n]+)"?$/m)?.[1];
if (!secret) throw new Error("AUTH_SECRET not found in .env.local");

const user = {
  id: "12345",
  name: "Test Human",
  handle: "test_human",
  avatar: "",
  exp: Date.now() + 86400000,
};
const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
const sig = createHmac("sha256", secret).update(payload).digest("base64url");
const token = `${payload}.${sig}`;

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // 1. Signed-out state: CTA text.
  const anon = await ctx.newPage();
  await anon.goto("http://localhost:3001", { waitUntil: "networkidle" });
  await anon.getByRole("button", { name: "Chat", exact: true }).click();
  await anon.waitForTimeout(1500);
  const cta = await anon.locator("a", { hasText: "Connect" }).textContent();
  console.log("CTA TEXT:", JSON.stringify(cta.trim()));
  await anon.screenshot({ path: "scripts/chat-cta.png" });

  // 2. Signed-in state via forged session cookie.
  await ctx.addCookies([
    { name: "dm_session", value: token, url: "http://localhost:3001" },
  ]);
  const page = await ctx.newPage();
  await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Chat", exact: true }).click();
  await page.waitForTimeout(2500);

  const text = `Hello from the real backend ${Date.now()}`;
  await page.getByPlaceholder("Message the group").fill(text);
  await page.getByRole("button", { name: "Send" }).click();
  await page.waitForTimeout(2500);
  console.log("MESSAGE VISIBLE:", await page.getByText(text).count());

  // 3. Reload — the message must come back from Blob storage.
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Chat", exact: true }).click();
  await page.waitForTimeout(3000);
  console.log("PERSISTED AFTER RELOAD:", await page.getByText(text).count());
  console.log(
    "SENDER SHOWN:",
    await page.getByText("Test Human").count(),
    "| handle:",
    await page.getByText("@test_human").count()
  );
  await page.screenshot({ path: "scripts/chat-live.png" });

  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
