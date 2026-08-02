import { chromium } from "playwright-core";

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  page.on("pageerror", (err) => logs.push("PAGEERROR: " + err.message));

  await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(500);

  const trackName = () =>
    page
      .locator("text=Music")
      .locator("xpath=following-sibling::span")
      .textContent();

  // Pick themes and confirm the track follows.
  for (const [theme, expected] of [
    ["purple theme", "Two"],
    ["yellow theme", "Five"],
    ["rainbow theme", "Six"],
    ["blue theme", "One"],
  ]) {
    await page.getByRole("button", { name: theme }).click();
    await page.waitForTimeout(800);
    console.log(theme, "=> track", await trackName());
  }

  await page.screenshot({ path: "scripts/theme-dials.png" });
  console.log("ERRORS:", logs.length ? logs : "none");
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
