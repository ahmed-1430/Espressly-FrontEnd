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
      // Longer than SplitLines' own 2600ms safety net. Settling for less than
      // that tested whether a reveal finished inside 400ms, which is not a
      // guarantee anything makes, and produced an intermittent failure on /shop
      // where the hero's mask was still parked.
      await new Promise((r) => setTimeout(r, 3000));
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

      // Curtain reveals hide their subject two ways at once, so neither is
      // covered by the opacity/clip-path check above: a panel still at scale 1
      // paints straight over the photograph, and the body still at opacity 0
      // hides it even with every panel collapsed. Both must have been released.
      const curtains = [...document.querySelectorAll("[data-curtain]")];
      const stuckCurtains = curtains.filter((root) => {
        const body = root.querySelector("[data-curtain-body]");
        if (body && parseFloat(getComputedStyle(body).opacity) === 0) return true;
        // Panels are direct children of the overlay; any panel retaining more
        // than a sliver of its axis is still covering.
        return [...root.querySelectorAll("[data-curtain-panel]")].some((panel) => {
          const m = new DOMMatrixReadOnly(getComputedStyle(panel).transform);
          // scaleY collapses height (matrix.d), scaleX collapses width (matrix.a).
          // Either still above 0.02 means the panel is painted over the frame.
          return Math.abs(m.d) > 0.02 || Math.abs(m.a) > 0.02;
        });
      });

      return {
        total: targets.length,
        hidden: hidden.length,
        hiddenLines: unrevealedLines.length,
        curtains: curtains.length,
        stuckCurtains: stuckCurtains.length,
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
    const ok =
      report.hidden === 0 && report.hiddenLines === 0 && report.stuckCurtains === 0;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"} ${route}  targets=${report.total} hidden=${report.hidden} hiddenLines=${report.hiddenLines} curtains=${report.curtains} stuck=${report.stuckCurtains}`,
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