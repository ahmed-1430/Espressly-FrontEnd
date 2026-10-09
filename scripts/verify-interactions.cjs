/**
 * Interaction and overflow checks.
 *
 * Covers the behaviours that are easy to break and hard to see in a screenshot:
 * horizontal overflow at each target width, mobile menu open/close with scroll
 * lock and focus restoration, gallery lightbox navigation, menu category
 * filtering, and the contact form's validation and submit states.
 *
 * Run against a served build:
 *   node scripts/verify-interactions.cjs http://localhost:3000
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

const WIDTHS = [320, 375, 390, 414, 768, 1024, 1280, 1440, 1920];
const ROUTES = ["/", "/menu", "/shop", "/gallery", "/about", "/contact", "/404-check"];

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
};

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });

  // --- horizontal overflow across breakpoints -------------------------------
  console.log("\n— overflow —");
  for (const width of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900 });
    const offenders = [];

    for (const route of ROUTES) {
      // `domcontentloaded` rather than `networkidle0`: lazy images keep fetching as
      // the page settles, so an idle network is not a reliable signal here.
      await page.goto(baseUrl + route, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("main", { timeout: 15000 });
      const result = await page.evaluate(() => {
        const doc = document.documentElement;
        const over = doc.scrollWidth - doc.clientWidth;
        if (over <= 1) return { over: 0, culprit: null };
        const culprit = [...document.querySelectorAll("body *")]
          .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
          .slice(0, 3)
          .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`);
        return { over, culprit };
      });
      if (result.over > 1) offenders.push(`${route} +${result.over}px ${result.culprit ?? ""}`);
    }

    check(`width ${width}px no horizontal overflow`, offenders.length === 0, offenders.join("; "));
    await page.close();
  }

  // --- mobile menu ----------------------------------------------------------
  console.log("\n— mobile navigation —");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(baseUrl + "/", { waitUntil: "domcontentloaded" });

    // The panel is mounted only while open, so "closed" means no dialog at all.
    // Asserting on a clip-path would only be valid for the old always-mounted
    // implementation and would pass vacuously against this one.
    const closed = await page.evaluate(() => ({
      dialog: !!document.querySelector('[role="dialog"]'),
      expanded: document
        .querySelector('button[aria-controls="mobile-navigation"]')
        ?.getAttribute("aria-expanded"),
    }));
    check("menu panel starts closed", !closed.dialog, JSON.stringify(closed));
    check("trigger starts collapsed", closed.expanded === "false", String(closed.expanded));

    await page.click('button[aria-controls="mobile-navigation"]');
    await new Promise((r) => setTimeout(r, 800));

    const open = await page.evaluate(() => ({
      dialog: !!document.querySelector('[role="dialog"]'),
      bodyOverflow: document.body.style.overflow,
      expanded: document
        .querySelector('button[aria-controls="mobile-navigation"]')
        ?.getAttribute("aria-expanded"),
      focusInside: !!document.querySelector('[role="dialog"]')?.contains(document.activeElement),
      // The explicit close control must be a real, reachable button.
      closeButton: !!document.querySelector('[role="dialog"] button'),
    }));
    check("menu opens", open.dialog, JSON.stringify(open));
    check("menu locks page scroll", open.bodyOverflow === "hidden", open.bodyOverflow);
    check("menu marks expanded", open.expanded === "true", String(open.expanded));
    check("focus moves into menu", open.focusInside);
    check("panel has a close control", open.closeButton);

    // Background scrolling must actually be blocked, not merely requested.
    // Driven with a real wheel gesture: `window.scrollBy` is programmatic and
    // is not what `overflow: hidden` is there to stop, so asserting on it would
    // fail against a perfectly working lock.
    const scrollHeld = await page.evaluate(() => window.scrollY);
    await page.mouse.move(195, 500);
    await page.mouse.wheel({ deltaY: 900 });
    await new Promise((r) => setTimeout(r, 600));
    const scrollAfter = await page.evaluate(() => window.scrollY);
    check("background scroll is blocked", scrollAfter === scrollHeld,
      `${scrollHeld} -> ${scrollAfter}`);

    await page.keyboard.press("Escape");

    // The panel unmounts through its exit animation, so it is still in the DOM
    // briefly after Escape — that presence is the point of AnimatePresence.
    // Wait for the node to actually detach rather than guessing a duration.
    const detached = await page
      .waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    const afterClose = await page.evaluate(() => ({
      dialog: !!document.querySelector('[role="dialog"]'),
      bodyOverflow: document.body.style.overflow,
      expanded: document
        .querySelector('button[aria-controls="mobile-navigation"]')
        ?.getAttribute("aria-expanded"),
      // Focus must return to the trigger that opened the panel.
      focusOnTrigger:
        document.activeElement ===
        document.querySelector('button[aria-controls="mobile-navigation"]'),
    }));
    check("Escape closes menu", detached && !afterClose.dialog, JSON.stringify(afterClose));
    check("trigger collapses again", afterClose.expanded === "false", String(afterClose.expanded));
    check("scroll lock released", afterClose.bodyOverflow !== "hidden", afterClose.bodyOverflow);
    check("focus returns to trigger", afterClose.focusOnTrigger);

    await page.close();
  }

  // --- menu filtering -------------------------------------------------------
  console.log("\n— menu filtering —");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(baseUrl + "/menu", { waitUntil: "domcontentloaded" });

    const counts = await page.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      const out = [];
      for (const tab of tabs) {
        tab.click();
        await sleep(1300);
        out.push({
          label: tab.textContent.trim(),
          heading: document.querySelector("main h2")?.textContent.trim(),
          items: document.querySelectorAll("main ul li h3").length,
          selected: tab.getAttribute("aria-selected"),
        });
      }
      return out;
    });

    const stuck = counts.filter((c) => !c.heading || c.items === 0);
    check("every category renders items", stuck.length === 0, JSON.stringify(stuck));
    const uniqueHeadings = new Set(counts.map((c) => c.heading));
    check("each category has its own heading", uniqueHeadings.size === counts.length,
      `${uniqueHeadings.size}/${counts.length}`);
    check("active tab marked selected", counts.every((c) => c.selected === "true"));

    await page.close();
  }

  // --- gallery lightbox -----------------------------------------------------
  console.log("\n— gallery lightbox —");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(baseUrl + "/gallery", { waitUntil: "domcontentloaded" });

    // Click the first frame the way a user does.
    await page.evaluate(() => {
      document.querySelector('button[data-cursor="view"]')?.scrollIntoView({ block: "center" });
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.click('button[data-cursor="view"]');
    await new Promise((r) => setTimeout(r, 900));

    const opened = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"][aria-modal="true"]');
      return {
        open: !!dlg,
        counter: dlg?.querySelector(".micro")?.textContent.trim(),
        scrollLocked: document.body.style.overflow === "hidden",
      };
    });
    check("lightbox opens", opened.open, JSON.stringify(opened));
    check("lightbox locks page scroll", opened.scrollLocked, String(opened.scrollLocked));

    await page.keyboard.press("ArrowRight");
    await new Promise((r) => setTimeout(r, 600));
    const stepped = await page.evaluate(
      () =>
        document.querySelector('[role="dialog"][aria-modal="true"] .micro')?.textContent.trim(),
    );
    check("arrow key advances", stepped !== opened.counter, `${opened.counter} -> ${stepped}`);

    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 600));
    const closed = await page.evaluate(() => ({
      open: !!document.querySelector('[role="dialog"][aria-modal="true"]'),
      overflow: document.body.style.overflow,
    }));
    check("Escape closes lightbox", !closed.open, JSON.stringify(closed));
    check("lightbox scroll lock released", closed.overflow !== "hidden", closed.overflow);

    await page.close();
  }

  // --- contact form ---------------------------------------------------------
  console.log("\n— contact form —");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(baseUrl + "/contact", { waitUntil: "domcontentloaded" });

    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 400));
    const invalid = await page.evaluate(() => ({
      alerts: [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent.trim()),
      invalid: [...document.querySelectorAll('[aria-invalid="true"]')].length,
    }));
    check("empty submit blocks and reports", invalid.alerts.length >= 2, JSON.stringify(invalid.alerts));
    check("invalid fields marked", invalid.invalid >= 2, String(invalid.invalid));

    await page.type("#contact-name", "Jane Whitfield");
    await page.type("#contact-email", "not-an-email");
    await page.type("#contact-message", "I would like a standing order for the office.");
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 400));
    const emailErr = await page.evaluate(
      () => document.querySelector("#contact-email-error")?.textContent.trim(),
    );
    check("bad email rejected", Boolean(emailErr), String(emailErr));

    await page.click("#contact-email", { clickCount: 3 });
    await page.type("#contact-email", "jane@example.com");
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2500));
    const submitted = await page.evaluate(() => ({
      success: !!document.querySelector('[role="status"]'),
      body: document.body.innerText.includes("Form received"),
    }));
    check("valid submit reaches success state", submitted.success && submitted.body);

    await page.close();
  }

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
  process.exitCode = failures ? 1 : 0;
})();