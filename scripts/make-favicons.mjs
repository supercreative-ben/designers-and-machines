// Builds transparent light/dark favicons from the white-head-on-black source
// image: luminance becomes alpha, tinted white (dark mode) or black (light).
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const SRC =
  "/Users/beni/.cursor/projects/Users-beni-Documents-Designers-and-Machines/assets/image-9581ea84-eb3b-482d-a4df-12c822ba0e78.png";
const SIZE = 512;

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage();

const dataUrl = `data:image/png;base64,${readFileSync(SRC).toString("base64")}`;

const results = await page.evaluate(
  async ({ dataUrl, size }) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    // Draw centered in a square canvas with a little padding.
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const pad = size * 0.03;
    const scale = Math.min(
      (size - pad * 2) / img.width,
      (size - pad * 2) / img.height
    );
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

    const src = ctx.getImageData(0, 0, size, size);
    const out = {};
    for (const [name, tint] of [
      ["dark", 255],
      ["light", 0],
    ]) {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const cx = c.getContext("2d");
      const im = cx.createImageData(size, size);
      for (let i = 0; i < src.data.length; i += 4) {
        // Source is a white shape on black: use luminance as alpha.
        const lum = (src.data[i] + src.data[i + 1] + src.data[i + 2]) / 3;
        im.data[i] = tint;
        im.data[i + 1] = tint;
        im.data[i + 2] = tint;
        im.data[i + 3] = src.data[i + 3] === 0 ? 0 : lum;
      }
      cx.putImageData(im, 0, 0);
      out[name] = c.toDataURL("image/png").split(",")[1];
    }
    return out;
  },
  { dataUrl, size: SIZE }
);

writeFileSync("public/icon-dark.png", Buffer.from(results.dark, "base64"));
writeFileSync("public/icon-light.png", Buffer.from(results.light, "base64"));
await browser.close();
console.log("wrote public/icon-dark.png and public/icon-light.png");
