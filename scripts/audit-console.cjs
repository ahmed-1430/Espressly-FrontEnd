/**
 * Console, heading and alt-text audit.
 *
 * Three things that are cheap to regress and expensive to notice:
 *
 *  - Console errors and failed requests. A hydration mismatch or a 404 on an
 *    image shows up here and nowhere else — the page still renders.
 *  - Heading order. Skipping a level breaks navigation for screen reader users
 *    and reads as a structural mistake in the markup.
 *  - Alt text coverage. Every image needs an `alt`; decorative ones need `alt=""`.
 *    Missing entirely is a bug, and a non-empty alt on a purely decorative image
 *    is noise.
 *
 * Run against a served build:
 *   node scripts/audit-console.cjs http://localhost:3000
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

/**
 * Checked separately. A missing route *should* answer 404, and both the browser
 * console and the response handler will say so — so asserting a clean console
 * here would be asserting that the not-found page works by not existing.
 */
const NOT_FOUND = "/does-not-exist";

let failures = 0;
const fail = (label, detail) => {
  failures++;
  console.log(`FAIL  ${label}${detail ? "  — " + detail : ""}`);
};

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const route of ROUTES) {
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 160));
    });
    page.on("pageerror", (err) => pageErrors.push(String(err).slice(0, 160)));
    page.on("requestfailed", (req) =>
      failedRequests.push(`${req.url().slice(-50)} ${req.failure()?.errorText ?? ""}`),
    );
    page.on("response", (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url().slice(-50)}`);
    });

    await page.goto(baseUrl + route, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 600));

    const audit = await page.evaluate(() => {
      // --- heading order ---
      const headings = [...document.querySelectorAll("main h1, main h2, main h3, main h4")]
        .map((el) => ({
          level: Number(el.tagName.slice(1)),
          text: (el.textContent || "").trim().slice(0, 34),
        }));
      const skips = [];
      let previous = 0;
      for (const heading of headings) {
        if (previous && heading.level > previous + 1) {
          skips.push(`h${previous} -> h${heading.level} "${heading.text}"`);
        }
        previous = heading.level;
      }

      // --- alt text ---
      const missingAlt = [];
      const redundantAlt = [];
      for (const img of document.querySelectorAll("img")) {
        const alt = img.getAttribute("alt");
        const decorative = img.getAttribute("aria-hidden") === "true" || img.closest("[aria-hidden='true']");
        if (alt === null) {
          missingAlt.push(img.src.slice(-40));
        } else if (decorative && alt.trim() !== "") {
          redundantAlt.push(img.src.slice(-40));
        }
      }

      const h1s = headings.filter((h) => h.level === 1).length;

      return { headings, skips, missingAlt, redundantAlt, h1s };
    });

    if (consoleErrors.length) fail(`${route} console errors`, consoleErrors.join(" | "));
    if (pageErrors.length) fail(`${route} uncaught exceptions`, pageErrors.join(" | "));
    if (failedRequests.length) fail(`${route} failed requests`, failedRequests.join(" | "));
    if (audit.h1s !== 1) fail(`${route} has ${audit.h1s} <h1> elements`);
    if (audit.skips.length) fail(`${route} skips a heading level`, audit.skips.join(" | "));
    if (audit.missingAlt.length) fail(`${route} images missing alt`, audit.missingAlt.join(" | "));
    if (audit.redundantAlt.length)
      fail(`${route} decorative images have alt text`, audit.redundantAlt.join(" | "));

    if (
      !consoleErrors.length &&
      !pageErrors.length &&
      !failedRequests.length &&
      audit.h1s === 1 &&
      !audit.skips.length &&
      !audit.missingAlt.length &&
      !audit.redundantAlt.length
    ) {
      console.log(
        `PASS  ${route}  — ${audit.headings.length} headings, clean console, alt text complete`,
      );
    }
  }

  // --- the not-found route --------------------------------------------------
  console.log("\n— not found —");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    const response = await page.goto(baseUrl + NOT_FOUND, { waitUntil: "networkidle0" });

    const status = response?.status();
    if (status !== 404) fail(`${NOT_FOUND} returns 404`, `got ${status}`);

    const rendered = await page.evaluate(() => ({
      h1: document.querySelector("main h1")?.textContent.trim(),
      links: document.querySelectorAll("main a[href^='/']").length,
    }));
    if (!rendered.h1) fail(`${NOT_FOUND} renders no heading`);
    if (rendered.links < 2) fail(`${NOT_FOUND} offers no way out`, `${rendered.links} links`);

    if (status === 404 && rendered.h1 && rendered.links >= 2) {
      console.log(`PASS  404 — "${rendered.h1}", ${rendered.links} links out`);
    }
    await page.close();
  }

  await browser.close();
  console.log(failures ? `\n${failures} problem(s) found` : "\nno problems found");
  process.exitCode = failures ? 1 : 0;
})();