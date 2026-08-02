import { chromium } from "playwright-core";

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  page.on("pageerror", (err) => logs.push("PAGEERROR: " + err.message));

  await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(400);

  for (const [label, value] of [
    ["Radius", "300"],
    ["Push Force", "40"],
    ["Friction", "2"],
    ["Slack", "80"],
  ]) {
    const input = page.locator(`input[aria-label="${label}"]`);
    await input.scrollIntoViewIfNeeded();
    await input.fill(value);
    console.log(label, "=>", await input.inputValue());
  }

  await page.waitForTimeout(1500);
  await page.screenshot({ path: "scripts/sliders.png" });
  console.log("ERRORS:", logs.length ? logs : "none");
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
