/**
 * Geometry sanity checks.
 *
 * Catches the class of failure that screenshots and overflow tests both miss:
 * elements that are technically present and technically within the viewport, but
 * have collapsed to slivers.
 *
 * This exists because the gallery grid once rendered all nineteen of its frames
 * as ~86px-wide slivers inside a 965px band. Nothing was overflowing, no console
 * error was raised, and the DOM looked correct — the images were simply zero
 * pixels tall. Overflow checks pass that happily; only a measurement of actual
 * rendered size catches it.
 *
 * Run against a served build:
 *   node scripts/verify-layout.cjs http://localhost:3000
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

const WIDTHS = [375, 768, 1440];
const ROUTES = ["/", "/menu", "/shop", "/gallery", "/about", "/contact"];

/** Below this a frame is a sliver rather than a photograph. */
const MIN_MEDIA = { width: 120, height: 120 };
/**
 * Text that is squeezed out of readability.
 *
 * Short strings are legitimately narrow, and so is almost everything at 375px:
 * an "Espresso Tonic" heading at 118px beside its price is correct, not broken.
 * Width alone cannot tell a healthy heading from a squeezed paragraph.
 *
 * Wrapping can. A `Range`'s client rects are the actual line boxes the text
 * occupies, so counting distinct tops gives the true line count. Measuring the
 * element's height instead would be wrong — a grid item stretched to a tall row
 * reports a large height whether or not its text wrapped, which flagged every
 * ordinal in a values grid before this was fixed.
 *
 * So: narrow *and* genuinely wrapped onto several lines. That catches the defect
 * this was written for — a 27-character stamp broken across ten lines inside a
 * 91px column — and leaves one-line headings alone.
 */
const MIN_TEXT = { width: 160, height: 8, minLines: 3 };
/** A page that renders almost nothing is broken even if every check passes. */
const MIN_DOC_HEIGHT = 1200;

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
};

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });

  for (const width of WIDTHS) {
    console.log(`\n— geometry at ${width}px —`);
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900 });

    for (const route of ROUTES) {
      await page.goto(baseUrl + route, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("main", { timeout: 15000 });

      // Walk the whole page so lazily-loaded media below the fold is measured too.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 90));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 250));
      });

      const report = await page.evaluate(
        (minMedia, minDocHeight, minText) => {
          const describe = (el) => {
            const cls = String(el.className).slice(0, 60);
            return `${el.tagName.toLowerCase()}${el.className ? "." + cls : ""}`;
          };

          // Only consider media that has actually been given a slot.
          const media = [...document.querySelectorAll("main img")].filter((img) => {
            // `[data-decorative-thumb]` marks images that are intentionally small:
            // the gallery hero's supporting frames are a three-up strip by design,
            // and treating them as collapsed media is a false positive.
            if (img.closest("[data-decorative-thumb]")) return false;
            const r = img.getBoundingClientRect();
            return r.width > 0 || r.height > 0;
          });

          const collapsed = media
            .map((img) => {
              const r = img.getBoundingClientRect();
              return { el: describe(img), w: Math.round(r.width), h: Math.round(r.height), src: img.src.slice(-34) };
            })
            .filter((m) => m.w < minMedia.width || m.h < minMedia.height);

          // Text that has been squeezed into a column too narrow for what it carries.
          // Line count comes from real line boxes, not the element's height: see
          // MIN_TEXT for why height is misleading here.
          const countLines = (el) => {
            const range = document.createRange();
            range.selectNodeContents(el);
            const tops = new Set();
            for (const rect of range.getClientRects()) {
              if (rect.width > 1 && rect.height > 1) tops.add(Math.round(rect.top));
            }
            return tops.size;
          };

          const clippedText = [...document.querySelectorAll("main p, main h1, main h2, main h3")]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              if (r.width <= 0 || r.height < minText.height) return false;
              if (r.width >= minText.width) return false;
              return countLines(el) >= minText.minLines;
            })
            .map((el) => {
              const r = el.getBoundingClientRect();
              return `${describe(el)} "${el.textContent.trim().slice(0, 28)}" ${Math.round(r.width)}px x ${countLines(el)} lines`;
            });

          return {
            docHeight: document.documentElement.scrollHeight,
            mediaCount: media.length,
            collapsed: collapsed.slice(0, 5),
            collapsedCount: collapsed.length,
            clippedText: clippedText.slice(0, 5),
            clippedTextCount: clippedText.length,
          };
        },
        MIN_MEDIA,
        MIN_DOC_HEIGHT,
        MIN_TEXT,
      );

      check(
        `${route} renders no collapsed media`,
        report.collapsedCount === 0,
        `${report.collapsedCount}/${report.mediaCount} — ${report.collapsed
          .map((c) => `${c.w}x${c.h} ${c.src}`)
          .join("; ")}`,
      );

      check(
        `${route} text is not squeezed`,
        report.clippedTextCount === 0,
        report.clippedText.join("; "),
      );

      check(
        `${route} page has substance`,
        report.docHeight >= MIN_DOC_HEIGHT,
        `${report.docHeight}px`,
      );
    }

    await page.close();
  }

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
  process.exitCode = failures ? 1 : 0;
})();