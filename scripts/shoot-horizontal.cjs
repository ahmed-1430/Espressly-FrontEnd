const puppeteer = require("puppeteer");

/**
 * Captures the gallery's horizontal band at three points in its travel, plus the
 * mobile scroller, so the pinned section can be reviewed as a picture rather
 * than only as a transform.
 */
const base = process.argv[2] ?? "http://localhost:3000";
const outDir = process.argv[3] ?? ".";
const target = process.argv[4] ?? ".staging/shots";

const fs = require("fs");
fs.mkdirSync(target, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(base + "/gallery", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));

  const sectionTop = await page.evaluate(() => {
    const s = document.querySelector('section[aria-label="The set at a glance"]');
    return s ? s.getBoundingClientRect().top + window.scrollY : null;
  });
  const travel = await page.evaluate(() => {
    const t = document.querySelector('section[aria-label="The set at a glance"] ul');
    return t.scrollWidth - window.innerWidth;
  });

  for (const [name, fraction] of [["start", 0], ["mid", 0.5], ["end", 0.95]]) {
    await page.evaluate((y) => window.scrollTo(0, y), sectionTop + fraction * (travel + 400));
    await new Promise((r) => setTimeout(r, 1100));

    // Capture twice. A pinned section with a transformed track lives on its own
    // compositor layer, and headless Chrome will screenshot it before the images
    // have been rasterised into that layer — giving a band with correct geometry
    // and no pictures, which is indistinguishable from the real bug. The second
    // capture has a rasterised layer behind it.
    await page.screenshot({ type: "jpeg", quality: 40 });
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    await new Promise((r) => setTimeout(r, 700));
    await page.screenshot({ path: `${target}/horizontal-${name}.jpg`, type: "jpeg", quality: 80 });
    console.log(`horizontal-${name}.jpg`);
  }

  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(base + "/gallery", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));
  const mobileTop = await page.evaluate(() => {
    const s = document.querySelector('section[aria-label="The set at a glance"]');
    return s ? s.getBoundingClientRect().top + window.scrollY : 0;
  });
  await page.evaluate((y) => window.scrollTo(0, y), mobileTop - 40);
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: `${target}/horizontal-mobile.jpg`, type: "jpeg", quality: 80 });
  console.log("horizontal-mobile.jpg");

  await browser.close();
})();