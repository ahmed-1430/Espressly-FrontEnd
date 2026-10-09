/**
 * Screenshots the mobile navigation open, and the gallery viewer.
 *
 * The `browser` tool cannot capture these — its screenshot path needs a visible
 * window, and a backgrounded tab never fires IntersectionObserver, so the reveal
 * animations that gate both surfaces never start. Puppeteer renders them
 * faithfully.
 */
const puppeteer = require("puppeteer");

const base = process.argv[2] ?? "http://localhost:3000";
const outDir = process.argv[3] ?? ".";

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  await page.goto(base + "/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1400));

  await page.click('button[aria-controls="mobile-navigation"]');
  await new Promise((r) => setTimeout(r, 1100));
  await page.screenshot({ path: `${outDir}/mobile-nav-open.jpg`, type: "jpeg", quality: 78 });
  console.log("mobile-nav-open.jpg");

  // The viewer, opened on a real frame.
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 900));
  await page.setViewport({ width: 1280, height: 860, deviceScaleFactor: 1 });
  await page.goto(base + "/gallery", { waitUntil: "networkidle0" });
  await page.evaluate(() =>
    document.querySelector('button[data-cursor="view"]')?.scrollIntoView({ block: "center" }),
  );
  await new Promise((r) => setTimeout(r, 1400));
  await page.click('button[data-cursor="view"]');
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: `${outDir}/gallery-viewer.jpg`, type: "jpeg", quality: 78 });
  console.log("gallery-viewer.jpg");

  await browser.close();
})();