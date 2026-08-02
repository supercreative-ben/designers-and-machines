import { chromium } from "playwright-core";

const run = async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  page.on("pageerror", (err) => logs.push("PAGEERROR: " + err.message));

  await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
  // First click (opening the tab) auto-starts the music.
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(2500);

  const state = async () =>
    (await page.getByRole("button", { name: "Pause music" }).count())
      ? "playing"
      : "paused";
  console.log("AFTER OPEN:", await state());

  await page.getByRole("button", { name: /Pause music|Play music/ }).click();
  await page.waitForTimeout(1000);
  console.log("AFTER TOGGLE 1:", await state());

  await page.getByRole("button", { name: /Pause music|Play music/ }).click();
  await page.waitForTimeout(2000);
  console.log("AFTER TOGGLE 2:", await state());

  await page.screenshot({ path: "scripts/play-pause.png" });
  console.log("ERRORS:", logs.length ? logs : "none");
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
