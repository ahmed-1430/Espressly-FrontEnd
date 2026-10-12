/**
 * Within-page duplication check.
 *
 * Two of the three "repetitive" complaints turned out to be one mistake: the same
 * content rendered twice on one page.
 *
 *   - the gallery showed twelve of the same photographs in a pinned band between
 *     two sections showing the same photographs again
 *   - the contact hero rendered the address, hours, phone and email, all four of
 *     which `ContactDetails` renders again directly below
 *
 * This compares rendered text across the page's top-level sections. It is a
 * lexical check, not a semantic one, so it is deliberately narrow: it flags a
 * long distinctive string appearing in two different sections. Shared chrome
 * (nav labels, footer links, the wordmark) lives outside those sections and is
 * not counted.
 *
 * Usage: node scripts/audit-duplication.cjs http://localhost:3000
 */
const puppeteer = require("puppeteer");
const base = process.argv[2] ?? "http://localhost:3000";
const routes = ["/", "/gallery", "/menu", "/shop", "/about", "/contact"];

// Long enough that ordinary repeated UI copy ("Opening hours") is not flagged.
const MIN_WORDS = 5;

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.setViewport({ width: 1440, height: 900 });

  let failures = 0;

  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1400));

    const report = await page.evaluate((minWords) => {
      // Only top-level landmarks: a duplicated paragraph inside one section is a
      // different bug from a duplicated section.
      const sections = [...document.querySelectorAll("main > section")].filter(
        (s) => !s.querySelector("section"),
      );

      const seen = new Map();
      const dupes = [];

      for (const [sectionIndex, section] of sections.entries()) {
        // Long runs of prose, normalised so wrapping and punctuation differences
        // do not hide a match.
        const text = section.innerText.replace(/\s+/g, " ").trim();
        const sentences = text
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter(Boolean);

        for (const sentence of sentences) {
          const words = sentence.split(" ");
          if (words.length < minWords) continue;
          // The whole sentence, not a leading window. A six-word prefix matched
          // two unrelated About sentences that merely open the same way ("We roast
          // on site so the...") and cried wolf; identical prose is what actually
          // indicates a section rendered twice.
          const key = sentence.toLowerCase().replace(/[^\w\s]/g, "");
          if (key.length < 20) continue;
          if (seen.has(key)) {
            dupes.push({
              key,
              from: seen.get(key),
              to: sectionIndex,
              text: sentence.slice(0, 70),
            });
          } else {
            seen.set(key, sectionIndex);
          }
        }
      }
      return { sections: sections.length, dupes };
    }, MIN_WORDS);

    const ok = report.dupes.length === 0;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"} ${route.padEnd(9)} sections=${report.sections} repeated=${report.dupes.length}`,
    );
    for (const d of report.dupes.slice(0, 5)) {
      console.log(`       "${d.text}" — sections ${d.from} and ${d.to}`);
    }
  }

  await browser.close();
  console.log(failures ? `\n${failures} route(s) failed` : "\nall routes passed");
  process.exitCode = failures ? 1 : 0;
})();