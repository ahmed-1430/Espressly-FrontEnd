const puppeteer = require("puppeteer");

/**
 * Checks the page transition actually runs.
 *
 * The stylesheet previously carried `::view-transition` rules and a comment
 * claiming a ViewTransition wrapper existed. Nothing triggered them. This asserts
 * the replacement really does: content hidden on arrival, revealed after paint,
 * and revealed again on every navigation rather than only the first.
 */
const base = process.argv[2] ?? "http://localhost:3000";

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
};

const read = () => {
  const el = document.querySelector("[style*='page-enter']");
  if (!el) return null;
  const cs = getComputedStyle(el);
  return {
    opacity: Number(cs.opacity),
    animationName: cs.animationName,
    playState: cs.animationPlayState,
  };
};

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.setViewport({ width: 1440, height: 900 });

  // Sample mid-animation on a fresh load.
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  const early = await page.evaluate(read);
  check("element carries the animation", early !== null && early.animationName === "page-enter", JSON.stringify(early));
  check("content starts hidden", early !== null && early.opacity < 0.5, JSON.stringify(early));

  await new Promise((r) => setTimeout(r, 1600));
  const settled = await page.evaluate(read);
  check(
    "content is visible once settled",
    settled !== null && settled.opacity > 0.98,
    JSON.stringify(settled),
  );

  // Navigate, and confirm the animation restarts rather than the element simply
  // being recreated already-visible.
  await page.evaluate(() => {
    const link = [...document.querySelectorAll("a[href='/menu']")].find(
      (a) => a.offsetParent !== null,
    );
    link.click();
  });

  let sawHidden = false;
  let samples = 0;
  for (let i = 0; i < 14; i++) {
    const s = await page.evaluate(read);
    if (s && s.opacity < 0.85) {
      sawHidden = true;
      break;
    }
    samples++;
    await new Promise((r) => setTimeout(r, 40));
  }
  check("transition replays on navigation", sawHidden, `no hidden frame in ${samples} samples`);

  await new Promise((r) => setTimeout(r, 1600));
  const afterNav = await page.evaluate(() => {
    const el = document.querySelector("[style*='page-enter']");
    return {
      opacity: Number(getComputedStyle(el).opacity),
      path: location.pathname,
    };
  });
  check("navigation happened", afterNav.path === "/menu", afterNav.path);
  check(
    "new page settles visible",
    afterNav.opacity > 0.98,
    JSON.stringify(afterNav),
  );

  // Reduced motion must not leave anything hidden.
  const reduced = await browser.newPage();
  await reduced.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await reduced.setViewport({ width: 1440, height: 900 });
  await reduced.goto(base + "/gallery", { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 700));
  const reducedState = await reduced.evaluate(read);
  check(
    "reduced motion shows content",
    reducedState !== null && reducedState.opacity > 0.98,
    JSON.stringify(reducedState),
  );

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
  process.exitCode = failures ? 1 : 0;
})();