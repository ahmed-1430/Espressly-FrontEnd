const puppeteer = require("puppeteer");

/**
 * Checks the gallery's horizontal band actually travels.
 *
 * A pinned section that fails to build silently does nothing at all: the strip
 * just sits there as a plain horizontal scroller, which looks almost like the
 * intended mobile behaviour. Only measuring the track's transform at several
 * scroll positions distinguishes the two.
 */
const base = process.argv[2] ?? "http://localhost:3000";

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
};

const TRACK = 'section[aria-label="The set at a glance"] ul';

// Passed as a function rather than an IIFE string: a string is evaluated as an
// expression by the page, which is easy to get wrong and fails silently by
// returning undefined. The selector is inlined rather than closed over, because
// anything from this module's scope does not exist inside the page.
const readX = () => {
  const track = document.querySelector(
    'section[aria-label="The set at a glance"] ul',
  );
  if (!track) return null;
  const m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
  return {
    x: Math.round(m.m41),
    scrollWidth: track.scrollWidth,
    clientWidth: track.clientWidth,
    vw: window.innerWidth,
    firstChildWidth: track.firstElementChild
      ? Math.round(track.firstElementChild.getBoundingClientRect().width)
      : null,
  };
};

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  // One page for both legs. Opening a second page per viewport left both alive at
  // once and navigation began timing out, which is a fault in the harness rather
  // than anything about the site.
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  // --- desktop: pinned and scrubbed ---
  {
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(base + "/gallery", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1500));

    const sectionTop = await page.evaluate(() => {
      const s = document.querySelector('section[aria-label="The set at a glance"]');
      return s ? s.getBoundingClientRect().top + window.scrollY : null;
    });
    check("band exists", sectionTop !== null);

    if (sectionTop !== null) {
      const overflow = await page.evaluate((sel) => {
        const track = document.querySelector(sel);
        const box = track.getBoundingClientRect();
        return {
          travel: track.scrollWidth - window.innerWidth,
          // The element's own width, which is what the transform moves. If this is
          // not wider than the viewport then translating it moves the whole box
          // off screen, and the frames — correctly positioned inside it — are
          // clipped away. This is the assertion that catches it.
          boxWidth: Math.round(box.width),
          contentWidth: track.scrollWidth,
          firstChildWidth: Math.round(
            track.firstElementChild.getBoundingClientRect().width,
          ),
        };
      }, TRACK);

      check(
        "frames have real width",
        overflow.firstChildWidth > 100,
        `${overflow.firstChildWidth}px`,
      );
      check(
        "track box is wider than the viewport",
        overflow.boxWidth > 1440,
        `box=${overflow.boxWidth}px, content=${overflow.contentWidth}px`,
      );
      check(
        "track is wider than the viewport",
        overflow.travel > 0,
        `${overflow.travel}px of travel`,
      );

      const samples = [];
      // Enter the band, then sample through its pinned range.
      for (const offset of [0, 0.35, 0.7, 1]) {
        await page.evaluate((y) => window.scrollTo(0, y), sectionTop + offset * (overflow.travel + 400));
        await new Promise((r) => setTimeout(r, 900));
        const s = await page.evaluate(readX);
        samples.push(s ? s.x : null);
      }

      check(
        "track stays pinned at the start",
        samples[0] === 0,
        `x=${samples[0]}`,
      );
      check(
        "track travels as the page scrolls",
        samples[3] < samples[1] && samples[1] < -20,
        JSON.stringify(samples),
      );
      check(
        "travels no further than the track's overflow",
        samples[3] >= -overflow.travel - 12,
        `x=${samples[3]}, max=${-overflow.travel}`,
      );
      check(
        "travel is monotonic",
        samples.every((v, i) => i === 0 || v <= samples[i - 1]),
        JSON.stringify(samples),
      );

      // A band can translate perfectly and still show nothing: lazy images in a
      // transformed track are judged against their untransformed layout box, so
      // the frames currently on screen never fetch. Assert the pictures are
      // actually there at each point in the travel.
      for (const offset of [0, 0.4, 0.8]) {
        await page.evaluate((y) => window.scrollTo(0, y), sectionTop + offset * (overflow.travel + 400));
        await new Promise((r) => setTimeout(r, 900));
        const loaded = await page.evaluate(() => {
          const track = document.querySelector(
            'section[aria-label="The set at a glance"] ul',
          );
          return [...track.children]
            .filter((li) => {
              const r = li.getBoundingClientRect();
              return r.right > 0 && r.left < window.innerWidth;
            })
            .map((li) => {
              const img = li.querySelector("img");
              return img && img.naturalWidth > 0 ? 1 : 0;
            });
        });
        check(
          `frames in view have loaded images at ${Math.round(offset * 100)}%`,
          loaded.length > 0 && loaded.every(Boolean),
          `${loaded.filter(Boolean).length}/${loaded.length} loaded`,
        );
      }
    }

    // Nothing may spill sideways once the strip is done.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 900));
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    check("no horizontal page overflow after the pin", overflowX <= 1, `${overflowX}px`);
  }

  // --- no transformed ancestor above fixed content ----------------------
  // A transformed ancestor becomes the containing block for position: fixed
  // descendants, so anything pinned inside it stops being pinned and scrolls away
  // instead. The page transition once left a translate3d(0,0,0) on the element
  // wrapping <main>, which silently broke this pin while every other check passed.
  {
    const routes = ["/", "/gallery", "/menu", "/shop", "/about", "/contact"];
    const offenders = [];

    for (const route of routes) {
      await page.goto(base + route, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 1400));

      const found = await page.evaluate(() => {
        const out = [];
        for (const fixed of document.querySelectorAll("main *")) {
          const cs = getComputedStyle(fixed);
          if (cs.position !== "fixed") continue;
          // GSAP's own pin sets this deliberately on the element it pins.
          if (fixed.closest(".pin-spacer")) continue;
          let el = fixed.parentElement;
          while (el && el !== document.body) {
            const st = getComputedStyle(el);
            if (st.transform !== "none") {
              out.push(
                `${fixed.tagName.toLowerCase()} under ${el.tagName.toLowerCase()}.${String(
                  el.className,
                ).slice(0, 30)} [${st.transform.slice(0, 24)}]`,
              );
              break;
            }
            el = el.parentElement;
          }
        }
        return out;
      });

      offenders.push(...found.map((f) => `${route}: ${f}`));
    }

    check(
      "no transformed ancestor traps fixed content",
      offenders.length === 0,
      offenders.slice(0, 3).join(" | "),
    );
  }

  // --- mobile: must NOT pin, must remain natively draggable ---
  {
    await page.setViewport({
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true,
    });
    await page.goto(base + "/gallery", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1500));

    const sectionTop = await page.evaluate(() => {
      const s = document.querySelector('section[aria-label="The set at a glance"]');
      return s ? s.getBoundingClientRect().top + window.scrollY : null;
    });

    const samples = [];
    for (const offset of [0, 0.5, 1]) {
      await page.evaluate((y) => window.scrollTo(0, y), sectionTop + offset * 900);
      await new Promise((r) => setTimeout(r, 700));
      const s = await page.evaluate(readX);
      samples.push(s ? s.x : null);
    }

    check(
      "mobile does not pin the band",
      samples.every((x) => x === 0),
      JSON.stringify(samples),
    );

    const scrollable = await page.evaluate(() => {
      const track = document.querySelector(
        'section[aria-label="The set at a glance"] ul',
      );
      return { canScroll: track.scrollWidth > track.clientWidth, overflowX: getComputedStyle(track).overflowX };
    });
    check("mobile track is a real scroller", scrollable.canScroll, JSON.stringify(scrollable));

    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    check("no page overflow on mobile", pageOverflow <= 1, `${pageOverflow}px`);
  }

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
  process.exitCode = failures ? 1 : 0;
})();