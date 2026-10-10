/**
 * Reduced-motion audit.
 *
 * The reveal components set elements to `opacity: 0` and hand them to GSAP. If
 * the reduced-motion branch ever fails to release them, the page renders blank
 * for exactly the users who asked for less movement — the worst possible failure
 * mode for an accessibility preference.
 *
 * So this asserts the end state rather than the animation: with
 * `prefers-reduced-motion: reduce` emulated, nothing that holds content may still
 * be hidden once the page has settled.
 *
 * Run against a served build:
 *   node scripts/verify-reduced-motion.cjs http://localhost:3000
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

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
};

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);

    await page.goto(baseUrl + route, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 800));

    // Scroll the whole page so every reveal has had its chance to settle.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
    });

    const report = await page.evaluate(() => {
      const describe = (el) => {
        const cls = String(el.className).slice(0, 44);
        return `${el.tagName.toLowerCase()}.${cls}`;
      };

      // Content that is present, has a size, and still cannot be seen.
      //
      // Elements marked `aria-hidden` are skipped: they are deliberately hidden
      // from sighted users and assistive technology alike, which is exactly what
      // the inactive slides of a cross-fade are. Treating those as failures would
      // mean demanding that a carousel show every slide at once.
      const invisible = [...document.querySelectorAll("main h1, main h2, main h3, main p, main img")]
        .filter((el) => {
          if (el.getAttribute("aria-hidden") === "true") return false;
          if (el.closest("[aria-hidden='true']")) return false;
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) return false;
          const cs = getComputedStyle(el);
          if (parseFloat(cs.opacity) < 0.05) return true;
          // A mask or clip that fully hides the element also counts as hidden.
          const mask = cs.maskImage || cs.webkitMaskImage;
          if (mask && /transparent/.test(mask)) return true;
          return false;
        })
        .map((el) => {
          const cs = getComputedStyle(el);
          return `${describe(el)} opacity=${cs.opacity} "${(el.textContent || "").trim().slice(0, 26)}"`;
        });

      // Smooth scroll must not be installed at all under reduced motion.
      const lenisActive = Boolean(window.__espresslyLenis);

      return {
        invisible: invisible.slice(0, 6),
        invisibleCount: invisible.length,
        lenisActive,
      };
    });

    check(
      `${route} content is visible under reduced motion`,
      report.invisibleCount === 0,
      `${report.invisibleCount} hidden — ${report.invisible.join("; ")}`,
    );
    check(`${route} skips smooth scroll`, !report.lenisActive, String(report.lenisActive));

    await page.close();
  }

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
  process.exitCode = failures ? 1 : 0;
})();