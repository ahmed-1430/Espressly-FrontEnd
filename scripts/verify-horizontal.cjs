const puppeteer = require("puppeteer");

/**
 * Fixed-content and overflow integrity, across every route.
 *
 * This used to be a gallery-specific check on the pinned horizontal contact-sheet
 * band. The band is gone — it rendered twelve of the same photographs as a
 * scrolling strip between two sections showing the same photographs again, which
 * was the single biggest reason the gallery read as endless.
 *
 * What is worth keeping is the invariant underneath it, and it is worth more
 * without a band: a transformed ancestor makes itself the containing block for
 * any `position: fixed` descendant, so a sticky navigation or a pinned section
 * stops being pinned and scrolls away instead. The page transition once left a
 * `translate3d(0,0,0)` on the element wrapping <main> and silently broke a pin
 * while every other check passed, because the DOM assertions were all still true.
 * Nothing about that failure was visible from measurements of the pinned element
 * alone — it had to be compared against the scroll offset.
 */
const base = process.argv[2] ?? "http://localhost:3000";
const routes = ["/", "/gallery", "/menu", "/shop", "/about", "/contact"];

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
};

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  for (const width of [390, 1440]) {
    await page.setViewport({ width, height: width === 390 ? 844 : 900 });

    const offenders = [];
    const overflows = [];

    for (const route of routes) {
      await page.goto(base + route, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 1400));

      const found = await page.evaluate(() => {
        const trapped = [];
        for (const fixed of document.querySelectorAll("main *")) {
          const cs = getComputedStyle(fixed);
          if (cs.position !== "fixed") continue;
          // GSAP's own pin sets this deliberately on the element it pins.
          if (fixed.closest(".pin-spacer")) continue;
          let el = fixed.parentElement;
          while (el && el !== document.body) {
            const st = getComputedStyle(el);
            if (st.transform !== "none") {
              trapped.push(
                `${fixed.tagName.toLowerCase()} under ${el.tagName.toLowerCase()}.${String(
                  el.className,
                ).slice(0, 30)}`,
              );
              break;
            }
            el = el.parentElement;
          }
        }

        const doc = document.documentElement;
        return {
          trapped,
          overflowX: Math.max(0, doc.scrollWidth - doc.clientWidth),
        };
      });

      offenders.push(...found.trapped.map((f) => `${route}: ${f}`));
      if (found.overflowX > 1) {
        overflows.push(`${route}: ${found.overflowX}px`);
      }
    }

    const tag = `${width}px`;
    check(`no transformed ancestor traps fixed content @${tag}`, offenders.length === 0);
    if (offenders.length) console.log("       " + offenders.join("\n       "));
    check(`no horizontal page overflow @${tag}`, overflows.length === 0);
    if (overflows.length) console.log("       " + overflows.join(", "));
  }

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
  process.exitCode = failures ? 1 : 0;
})();