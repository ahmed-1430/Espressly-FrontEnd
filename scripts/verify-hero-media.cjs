/**
 * Hero media integrity.
 *
 * `HeroMedia` renders one absolutely positioned child and nothing in flow, so its
 * frame collapses to zero height unless a caller gives it size. Every historical
 * caller passed `absolute inset-0`, which supplied that size implicitly — and the
 * three rewritten heroes passed a plain `className` instead. The result was three
 * hero images rendering at zero pixels: present in the DOM, with a valid `src`,
 * `complete === true`, and `naturalWidth > 0`, so every existence check passed
 * while the hero showed three empty rectangles.
 *
 * A collapsed image is only caught by measuring the rendered box. This asserts
 * every hero image occupies real space, and that it is actually painted.
 *
 * Usage: node scripts/verify-hero-media.cjs http://localhost:3000
 */
const puppeteer = require("puppeteer");
const base = process.argv[2] ?? "http://localhost:3000";

(async () => {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.setViewport({ width: 1440, height: 900 });

  let failures = 0;

  for (const route of ["/", "/menu", "/shop", "/gallery", "/about", "/contact"]) {
    await page.goto(base + route, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1600));

    const report = await page.evaluate(() => {
      const frames = [...document.querySelectorAll("[data-hero-media]")];
      const collapsed = [];
      const unpainted = [];

      for (const frame of frames) {
        const r = frame.getBoundingClientRect();
        const img = frame.querySelector("img");
        if (!img) continue;
        const ir = img.getBoundingClientRect();

        // The frame must occupy real space.
        if (r.width < 8 || r.height < 8) {
          collapsed.push(
            `frame ${Math.round(r.width)}x${Math.round(r.height)} (${img.getAttribute("src")?.slice(-28)})`,
          );
        }
        // The image inside must too.
        if (ir.width < 8 || ir.height < 8) {
          collapsed.push(
            `img ${Math.round(ir.width)}x${Math.round(ir.height)} (${img.getAttribute("src")?.slice(-28)})`,
          );
        }
        // And it must have decoded and be visible, not masked away.
        const cs = getComputedStyle(img);
        if (img.naturalWidth === 0) {
          unpainted.push(`${img.getAttribute("src")?.slice(-28)} did not decode`);
        } else if (cs.opacity === "0" || cs.visibility === "hidden") {
          unpainted.push(
            `${img.getAttribute("src")?.slice(-28)} opacity=${cs.opacity} visibility=${cs.visibility}`,
          );
        }
      }

      return { frames: frames.length, collapsed, unpainted };
    });

    const ok = report.collapsed.length === 0 && report.unpainted.length === 0;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"} ${route.padEnd(9)} hero media=${report.frames} collapsed=${report.collapsed.length} unpainted=${report.unpainted.length}`,
    );
    for (const c of report.collapsed) console.log("       collapsed: " + c);
    for (const u of report.unpainted) console.log("       unpainted: " + u);
  }

  await browser.close();
  console.log(failures ? `\n${failures} route(s) failed` : "\nall routes passed");
  process.exitCode = failures ? 1 : 0;
})();