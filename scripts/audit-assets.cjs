/**
 * Production image and weight audit.
 *
 * Reports, per route, the transferred image bytes and the largest single image —
 * the two numbers that actually decide whether a photography-led site feels fast.
 * Also counts JS delivered, since a heavy animation stack is the usual culprit.
 *
 * Run against a served production build:
 *   node scripts/audit-assets.cjs http://localhost:3000
 */
const puppeteerAvailable = (() => {
  try {
    require.resolve("puppeteer");
    return true;
  } catch {
    return false;
  }
})();

if (!puppeteerAvailable) {
  console.log("puppeteer not installed — skipping (optional dev check).");
  process.exit(0);
}

const puppeteer = require("puppeteer");
const baseUrl = process.argv[2] ?? "http://localhost:3000";
const ROUTES = ["/", "/menu", "/shop", "/gallery", "/about", "/contact"];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const rows = [];

  for (const route of ROUTES) {
    const page = await browser.newPage();
    // A mid-size laptop viewport: representative without pretending to be mobile.
    await page.setViewport({ width: 1440, height: 900 });

    let jsBytes = 0;
    page.on("response", async (res) => {
      const type = res.headers()["content-type"] ?? "";
      if (type.includes("javascript") && res.ok()) {
        const length = Number(res.headers()["content-length"] ?? 0);
        jsBytes += length;
      }
    });

    await page.goto(baseUrl + route, { waitUntil: "networkidle0" });
    // Nudge lazy images into loading so the whole page is accounted for.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.35;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 500));
    });
    await new Promise((r) => setTimeout(r, 600));

    const images = await page.evaluate(() =>
      [...document.images].map((img) => ({
        src: img.currentSrc || img.src,
        bytes: Math.round(
          Number(performance.getEntriesByName(img.currentSrc || img.src)[0]?.transferSize ?? 0),
        ),
        w: img.naturalWidth,
        h: img.naturalHeight,
        loaded: img.complete && img.naturalWidth > 0,
      })),
    );

    const sized = images.filter((i) => i.bytes > 0);
    const totalImageBytes = sized.reduce((sum, i) => sum + i.bytes, 0);
    const largest = sized.reduce((max, i) => (i.bytes > max.bytes ? i : max), sized[0]);
    const oversized = sized.filter((i) => i.w > 2000);

    rows.push({
      route,
      count: images.length,
      loaded: images.filter((i) => i.loaded).length,
      totalImageBytes,
      largest,
      jsBytes,
      oversized: oversized.map((i) => `${i.src.split("?")[0].split("/").slice(-1)[0]} ${i.w}px`),
    });

    await page.close();
  }

  console.log("route     imgs   image bytes   largest            JS");
  for (const r of rows) {
    console.log(
      `${r.route.padEnd(9)} ${String(r.loaded + "/" + r.count).padEnd(6)} ` +
        `${kb(r.totalImageBytes).padEnd(13)} ` +
        `${kb(r.largest?.bytes ?? 0).padEnd(18)} ` +
        kb(r.jsBytes),
    );
    if (r.oversized.length) {
      console.log(`          oversized: ${r.oversized.join(", ")}`);
    }
  }

  const notLoaded = rows.flatMap((r) =>
    r.loaded === r.count ? [] : [`${r.route}: ${r.count - r.loaded} image(s) did not load`],
  );
  if (notLoaded.length) {
    console.log("\n" + notLoaded.join("\n"));
  }

  await browser.close();
})();