const puppeteer = require("puppeteer");
const fs = require("fs");

/**
 * Walks a route in viewport-sized steps and captures each one.
 *
 * A single full-page screenshot cannot be used on this site any more. A pinned
 * section becomes a spacer of its travel length, and in a full-page capture the
 * pinned element renders at its fixed position while the spacer stays blank, so
 * the page looks like it has a large empty hole in it that no reader would ever
 * see. Stepping the viewport captures what is actually on screen at each point of
 * the scroll.
 */
const base = process.argv[2] ?? "http://localhost:3000";
const route = process.argv[3] ?? "/gallery";
const outDir = process.argv[4] ?? ".staging/walk";
const width = Number(process.argv[5] ?? 1440);
const height = Number(process.argv[6] ?? 900);
const maxShots = Number(process.argv[7] ?? 14);

fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.setViewport({ width, height });
  await page.goto(base + route, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1800));

  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const stride = Math.round(height * 0.92);
  const shots = Math.min(maxShots, Math.ceil(total / stride));
  const slug = route.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home";

  const taken = [];
  for (let i = 0; i < shots; i++) {
    const y = i * stride;
    // Step rather than jump, so pinned sections behave as they do for a reader.
    await page.evaluate(async (target) => {
      const start = window.scrollY;
      const delta = target - start;
      const steps = Math.max(1, Math.ceil(Math.abs(delta) / 260));
      for (let s = 0; s < steps; s++) {
        window.scrollTo(0, start + (delta * (s + 1)) / steps);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, target);
    }, y);
    await new Promise((r) => setTimeout(r, 750));

    const file = `${outDir}/${slug}-${String(i).padStart(2, "0")}.jpg`;
    await page.screenshot({ path: file, type: "jpeg", quality: 72 });
    taken.push({ i, y, file });
  }

  console.log(`route ${route} @${width}x${height}, page ${total}px, ${taken.length} shots`);
  taken.forEach((t) => console.log(`  ${t.file}  y=${t.y}`));
  await browser.close();
})();