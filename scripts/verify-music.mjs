import { chromium } from "playwright-core";

const run = async () => {
  const browser = await chromium.launch({
    channel: "chrome",
    args: ["--autoplay-policy=no-user-gesture-required"],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  page.on("console", (msg) => logs.push(msg.text()));
  page.on("pageerror", (err) => logs.push("PAGEERROR: " + err.message));

  await page.goto("http://localhost:3001", { waitUntil: "networkidle" });

  // First click anywhere should start track one.
  await page.mouse.click(720, 200);
  await page.waitForTimeout(4000);

  // Open the Play tab and check the music button state.
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(1500);
  const trackBtn = page.getByRole("button", {
    name: /(Stop — |Play )(One|Two|Three|Four|Five|Six)/,
  });
  console.log("MUSIC BUTTON:", await trackBtn.textContent());

  // Switch to track two while playing.
  await page.getByRole("button", { name: "Next track" }).click();
  await page.waitForTimeout(2500);
  console.log("AFTER NEXT:", await trackBtn.textContent());

  // Stop playback.
  await trackBtn.click();
  await page.waitForTimeout(1000);
  console.log("AFTER STOP:", await trackBtn.textContent());

  await page.screenshot({ path: "scripts/play-tab-music.png" });

  const errors = logs.filter(
    (l) => l.startsWith("PAGEERROR") || l.toLowerCase().includes("error")
  );
  console.log("ERROR LOGS:", errors.length ? errors : "none");
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
