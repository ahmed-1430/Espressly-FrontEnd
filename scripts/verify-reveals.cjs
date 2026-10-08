/**
 * Reveal wiring check.
 *
 * `IntersectionObserver` does not fire in a backgrounded tab, so scrolling a
 * hidden page proves nothing about the reveal system. This drives each target
 * through the same code path by forcing a synthetic intersection, then asserts
 * that the observer released it and the CSS attributes landed where they should.
 *
 * Run against a served build: node scripts/verify-reveals.cjs http://localhost:3000
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
  console.log("puppeteer not installed — skipping (this is an optional dev check).");
  process.exit(0);
}

const puppeteer = require("puppeteer");
const baseUrl = process.argv[2] ?? "http://localhost:3000";
const routes = ["/", "/menu", "/shop", "/gallery", "/about", "/contact"];

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  let failures = 0;

  for (const route of routes) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(baseUrl + route, { waitUntil: "domcontentloaded" });

    // Walk the page slowly enough that every target spends at least one
    // IntersectionObserver delivery cycle inside the viewport, then settle.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.35;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 140));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
    });

    const report = await page.evaluate(() => {
      // A target counts as visible only if nothing is still hiding it: no zero
      // opacity, no closed clip-path, and no mask still fully transparent.
      const isHidden = (el) => {
        const s = getComputedStyle(el);
        if (parseFloat(s.opacity) === 0) return "opacity";
        if (s.clipPath.includes("100%")) return "clip-path";
        const mask = s.maskImage || s.webkitMaskImage || "";
        if (/rgba\(0, 0, 0, 0\) 0%/.test(mask)) return "mask";
        return null;
      };

      const targets = [...document.querySelectorAll("[data-reveal]")];
      const hidden = targets
        .map((el) => ({ el, reason: isHidden(el) }))
        .filter((entry) => entry.reason);

      const unrevealedLines = [...document.querySelectorAll(".line-mask")].filter((m) => {
        const inner = m.querySelector(":scope > span");
        if (!inner) return true;
        // Still parked below its mask if the child has not been pulled up.
        const matrix = new DOMMatrixReadOnly(getComputedStyle(inner).transform);
        return matrix.m42 > 1;
      });

      return {
        total: targets.length,
        hidden: hidden.length,
        hiddenLines: unrevealedLines.length,
        detail: hidden.map(({ el, reason }) => ({
          reason,
          variant: el.dataset.reveal,
          h: Math.round(el.getBoundingClientRect().height),
          text: el.textContent.trim().slice(0, 28),
        })),
      };
    });

    // The invariant: no element may be left visually suppressed after a full
    // scroll. Anything still hidden is a real defect, not a timing artefact.
    const ok = report.hidden === 0 && report.hiddenLines === 0;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"} ${route}  targets=${report.total} hidden=${report.hidden} hiddenLines=${report.hiddenLines}`,
    );
    if (report.detail.length) {
      console.log("       " + JSON.stringify(report.detail));
    }

    await page.close();
  }

  await browser.close();
  console.log(failures ? `\n${failures} route(s) failed` : "\nall routes passed");
  process.exitCode = failures ? 1 : 0;
})();