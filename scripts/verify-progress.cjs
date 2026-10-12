/**
 * Confirms the reading-progress line sits at the top edge of the viewport,
 * above the navigation, and actually advances.
 *
 * The first version of this indicator was pinned below the navigation at z-99 —
 * under the nav's z-100 — which is the opposite of the intended reading-progress
 * placement. This asserts the geometry directly so it cannot drift back.
 */
const puppeteer = require("puppeteer");

const base = process.argv[2] ?? "http://localhost:3000";
const route = process.argv[3] ?? "/menu";

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
};

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 860 });
  await page.goto(base + route, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));

  const probe = await page.evaluate(() => {
    const wrapper = document.querySelector('[data-scroll-progress]');
    const nav = document.querySelector("header");
    if (!wrapper) return { found: false };
    const bar = wrapper.firstElementChild;
    const r = wrapper.getBoundingClientRect();
    const navStyle = nav ? getComputedStyle(nav) : null;
    return {
      found: true,
      top: r.top,
      height: r.height,
      width: r.width,
      viewportWidth: window.innerWidth,
      zIndex: getComputedStyle(wrapper).zIndex,
      navZIndex: navStyle?.zIndex,
      scaleX: bar ? getComputedStyle(bar).transform : null,
      position: getComputedStyle(wrapper).position,
    };
  });

  check("indicator is present", probe.found);
  check("pinned to viewport top", probe.top === 0, `top=${probe.top}`);
  check("position fixed", probe.position === "fixed", String(probe.position));
  check(
    "extremely thin",
    probe.height > 0 && probe.height <= 2,
    `${probe.height}px`,
  );
  check("full width", probe.width === probe.viewportWidth, `${probe.width}/${probe.viewportWidth}`);
  check(
    "above the navigation",
    Number(probe.zIndex) > Number(probe.navZIndex),
    `progress=${probe.zIndex} nav=${probe.navZIndex}`,
  );

  // Advance and confirm the fill grows.
  const readScale = () =>
    page.evaluate(() => {
      const bar = document.querySelector('[data-scroll-progress]')?.firstElementChild;
      if (!bar) return null;
      const m = new DOMMatrixReadOnly(getComputedStyle(bar).transform);
      return m.a;
    });

  const atTop = await readScale();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.5));
  await new Promise((r) => setTimeout(r, 1200));
  const atMiddle = await readScale();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await new Promise((r) => setTimeout(r, 1400));
  const atEnd = await readScale();

  check("empty at the top of the page", (atTop ?? 1) < 0.02, String(atTop));
  check(
    "partially filled mid-page",
    atMiddle > 0.3 && atMiddle < 0.95,
    String(atMiddle),
  );
  check("complete at the foot of the page", (atEnd ?? 0) > 0.98, String(atEnd));

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
  process.exitCode = failures ? 1 : 0;
})();