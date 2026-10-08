/**
 * Capture full-page screenshots for visual review.
 *
 *   node scripts/shoot.cjs http://localhost:3000 <outDir> [route ...]
 */
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const outDir = process.argv[3] ?? path.join(process.env.TEMP, "espressly-shots");
const only = process.argv.slice(4);

const ROUTES = only.length
  ? only
  : ["/", "/menu", "/shop", "/gallery", "/about", "/contact"];

const slug = (r) => (r === "/" ? "home" : r.replace(/\//g, "-").replace(/^-/, ""));

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: "new" });

  for (const route of ROUTES) {
    for (const [label, viewport] of [
      ["desktop", { width: 1440, height: 900 }],
      ["mobile", { width: 390, height: 844 }],
    ]) {
      const page = await browser.newPage();
      await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
      // `domcontentloaded` plus an explicit image wait: `networkidle0` is unreliable
      // here because Next streams prefetches and image optimisation requests
      // continue well past first paint.
      await page.goto(baseUrl + route, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForSelector("main", { timeout: 30000 });

      // Walk the page so lazy images and reveals resolve before capture.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.4;
        for (let y = 0; y <= document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 130));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 600));
      });

      await page.screenshot({
        path: path.join(outDir, `${slug(route)}-${label}.jpg`),
        fullPage: true,
        type: "jpeg",
        quality: 62,
      });
      console.log(`${slug(route)}-${label}.jpg`);
      await page.close();
    }
  }

  await browser.close();
})();