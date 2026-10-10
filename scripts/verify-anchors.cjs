/**
 * In-page anchor behaviour.
 *
 * Plain `href="#id"` links were the site's original approach, and they were wrong
 * twice over: they land the target underneath the fixed header, and they fight the
 * smooth-scroll layer rather than driving it. `AnchorScroll` delegates them, but a
 * delegated listener is exactly the kind of thing that silently stops
 * intercepting, so this drives real clicks and measures where the target landed.
 */
const puppeteer = require("puppeteer");

const base = process.argv[2] ?? "http://localhost:3000";

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
};

const CASES = [
  { route: "/menu", anchor: 'a[href="#categories"]', id: "categories", width: 1440 },
  // Same link at mobile width, where the header is shorter and the rail hugs it.
  { route: "/menu", anchor: 'a[href="#categories"]', id: "categories", width: 390 },
  { route: "/shop", anchor: 'a[href="#catalogue"]', id: "catalogue", width: 1440 },
  { route: "/gallery", anchor: 'a[href="#frames"]', id: "frames", width: 1440 },
  { route: "/", anchor: 'a[href="#featured"]', id: "featured", width: 1440 },
];

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  // One page throughout. Creating a page per case left several alive at once and
  // navigation started timing out, which is a fault in the harness rather than
  // anything about the site.
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  for (const { route, anchor, id, width } of CASES) {
    await page.setViewport({ width, height: 860 });
    await page.goto(base + route, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("main");
    await new Promise((r) => setTimeout(r, 1500));

    const present = await page.evaluate((selector) => Boolean(document.querySelector(selector)), anchor);
    if (!present) {
      check(`${route} ${anchor} exists`, false, "not found");
      continue;
    }

    // Click from a scrolled position, the way a reader reaches a hero's action.
    await page.evaluate(() => window.scrollTo(0, 120));
    await new Promise((r) => setTimeout(r, 500));
    await page.click(anchor);
    // Long enough for the eased scroll to settle.
    await new Promise((r) => setTimeout(r, 2400));

    const result = await page.evaluate((targetId) => {
      const target = document.getElementById(targetId);
      if (!target) return null;

      // Measure the header's *layout* height, not its current box. The navbar
      // retracts on sustained downward scroll, so at the moment of measurement it
      // sits above the viewport and its rect reads as zero-height — which would
      // make any clearance assertion pass no matter where the target landed.
      const header = document.querySelector("header");
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      let occluderBottom = headerHeight;

      for (const pinned of document.querySelectorAll("[data-anchor-offset]")) {
        // A rail the target is itself, or that contains the target, is not an
        // occluder — it is the thing being revealed. Only rails that sit above
        // the target in the document hide it.
        if (pinned === target || pinned.contains(target) || target.contains(pinned)) continue;
        const box = pinned.getBoundingClientRect();
        if (box.height > 0 && box.top <= headerHeight + 1) {
          occluderBottom = Math.max(occluderBottom, box.bottom);
        }
      }

      const targetBox = target.getBoundingClientRect();
      return {
        targetTop: Math.round(targetBox.top),
        occluderBottom: Math.round(occluderBottom),
        clear: targetBox.top >= occluderBottom - 2,
        focusInside: target.contains(document.activeElement),
        // A native jump or a Next router push both leave the hash set; ours does not.
        hash: location.hash,
      };
    }, id);

    check(`${route} ${anchor} @${width}px resolves the target`, result !== null);
    if (result) {
      check(
        `${route} #${id} @${width}px lands clear of the navigation`,
        result.clear,
        `target top=${result.targetTop}, occludes to ${result.occluderBottom}`,
      );
      check(`${route} #${id} @${width}px takes focus`, result.focusInside);
      check(
        `${route} #${id} @${width}px does not jump natively`,
        result.hash === "",
        `hash=${result.hash}`,
      );
    }
  }

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
  process.exitCode = failures ? 1 : 0;
})();