import { chromium } from "playwright-core";
import { mkdirSync } from "fs";

const SHOTS = [
  ["https://www.malayvasa.com/work/logo-agent", "public/projects/logo-agent.png"],
];

const run = async () => {
  mkdirSync("public/projects", { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 600 },
    deviceScaleFactor: 2,
  });
  for (const [url, path] of SHOTS) {
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    // The gallery hydrates client-side; wait for logos to actually appear.
    await page
      .waitForFunction(() => document.querySelectorAll("img, svg").length > 10, {
        timeout: 30000,
      })
      .catch(() => {});
    await page.waitForTimeout(4000);
    await page.screenshot({ path });
    console.log("shot", url);
  }
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
