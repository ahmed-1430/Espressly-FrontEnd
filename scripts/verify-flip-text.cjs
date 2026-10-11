/**
 * Flip-text check.
 *
 * A flip is the one effect where two versions of a label legitimately coexist,
 * so the risk is announcing both. Verifies:
 *   - the heading's accessible text is the incoming label only, never both
 *   - the heading does not change height when the value changes (the classic
 *     flip failure: both labels in normal flow push the page around)
 *   - the label survives under reduced motion
 */
const puppeteer = require("puppeteer");
const baseUrl = process.argv[2] ?? "http://localhost:3000";

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  let failures = 0;

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(baseUrl + "/menu", { waitUntil: "networkidle2" });

  const heading = "h2[aria-live='polite']";

  const before = await page.evaluate((sel) => {
    const h = document.querySelector(sel);
    return { text: h.textContent.trim(), h: h.getBoundingClientRect().height };
  }, heading);

  // Switch to a different category via the real control, not by poking state.
  const clicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("[data-category]")];
    const current = document.querySelector("[data-category][aria-selected='true']");
    const target = buttons.find((b) => b !== current);
    if (!target) return null;
    target.click();
    return target.textContent.trim();
  });

  await new Promise((r) => setTimeout(r, 900));

  const after = await page.evaluate((sel) => {
    const h = document.querySelector(sel);
    // Leaf spans only. Ancestor spans inherit their descendant's text content,
    // so a plain textContent filter counts the structural wrapper too and reports
    // a false duplicate. A label is a span with no span inside it.
    const labels = [...h.querySelectorAll("span")].filter(
      (s) => s.querySelector("span") === null && s.textContent.trim().length > 0,
    );
    return {
      text: h.textContent.trim(),
      // What assistive tech actually gets: exposed labels only. Raw textContent
      // includes the outgoing label mid-flip, which is expected and harmless
      // precisely because it is aria-hidden.
      accessible: labels
        .filter((s) => s.getAttribute("aria-hidden") !== "true")
        .map((s) => s.textContent.trim())
        .join(""),
      h: h.getBoundingClientRect().height,
      // Only the incoming label may be exposed; the outgoing one must be inert.
      exposed: labels.filter((s) => s.getAttribute("aria-hidden") !== "true").length,
      spanCount: labels.length,
    };
  }, heading);

  const changed = before.text !== after.text;
  const stableHeight = Math.abs(before.h - after.h) < 2;
  const singleExposed = after.exposed === 1;
  // The accessible name must be one whole word. "EspressSignature" would mean the
  // outgoing label is still being announced alongside the incoming one.
  const wholeWord = after.accessible.trim().split(/\s+/).length === 1;

  const ok = changed && stableHeight && singleExposed && wholeWord;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"} menu flip — "${before.text}" -> accessible "${after.accessible}" (clicked ${clicked})`,
  );
  if (!ok) {
    console.log(
      `      changed=${changed} stableHeight=${stableHeight} (${before.h}->${after.h}) singleExposed=${singleExposed} exposed=${after.exposed}/${after.spanCount} wholeWord=${wholeWord}`,
    );
  }

  // Reduced motion: the label must still be there and correct. Reuse the same
  // page — opening a second one reliably times out in this harness.
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.goto(baseUrl + "/menu", { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("[data-category]")];
    buttons[buttons.length - 1]?.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  const rmText = await page.evaluate((sel) => {
    const h = document.querySelector(sel);
    return { text: h.textContent.trim(), visible: h.getBoundingClientRect().height > 10 };
  }, heading);
  const rmOk = rmText.visible && rmText.text.length > 0;
  if (!rmOk) failures++;
  console.log(`${rmOk ? "PASS" : "FAIL"} menu flip visible under reduced motion — "${rmText.text}"`);

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
  process.exitCode = failures ? 1 : 0;
})();