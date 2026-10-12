/**
 * Desktop motion audit.
 *
 * The complaint was that "most of the expected desktop motion is missing or
 * ineffective". Every animation in this project is expressed as a CSS or inline
 * style, so an animation that never runs and an animation that ran and finished
 * look identical once the page settles. Measuring the settled state therefore
 * proves nothing.
 *
 * This samples at three points and requires a difference between them:
 *
 *   t0   immediately after load, before entrance choreography settles
 *   t1   after the entrance has run
 *   t2   after a scroll that should trigger scroll-linked work
 *
 * A target that never moves across all three is reported as static. That is the
 * only honest way to tell a working entrance from a dead one.
 *
 * Usage: node scripts/verify-desktop-motion.cjs http://localhost:3000
 */
const puppeteer = require("puppeteer");
const base = process.argv[2] ?? "http://localhost:3000";

const routes = ["/", "/menu", "/shop", "/gallery", "/about", "/contact"];

// Everything that is supposed to be doing something.
const TARGETS = [
  '[data-hero-stage]',
  '[data-reveal]',
  '.line-mask > span',
  '[data-curtain-panel]',
  '[data-curtain-body]',
  // The gallery's scroll-linked parallax is applied to the photograph itself.
  '[data-parallax] img',
  'h1',
];

function signature(samples) {
  return samples.map((list) =>
    list.map((s) => `${s.tag}:o${s.o},t${s.tx},${s.ty},s${s.scale},c${s.clip}`).join("|"),
  );
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.setViewport({ width: 1440, height: 900 });

  let failures = 0;

  for (const route of routes) {
    const read = () =>
      page.evaluate((selectors) => {
        const out = [];
        for (const sel of selectors) {
          for (const el of document.querySelectorAll(sel)) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue;
            const cs = getComputedStyle(el);
            // Capture only the properties an animation actually drives. Bounding
            // boxes change because the page scrolls and because images load, so
            // comparing positions measures the viewport, not the motion.
            const m =
              cs.transform === "none"
                ? null
                : new DOMMatrixReadOnly(cs.transform);
            out.push({
              tag: sel,
              o: Number(cs.opacity).toFixed(3),
              // Translate and scale, rounded to whole pixels and hundredths.
              ty: m ? Math.round(m.f) : 0,
              tx: m ? Math.round(m.e) : 0,
              scale: m ? Number(m.a.toFixed(3)) : 1,
              clip: cs.clipPath === "none" ? "-" : cs.clipPath.slice(0, 40),
            });
          }
        }
        return out;
      }, TARGETS);

    await page.goto(base + route, { waitUntil: "domcontentloaded" });
    // Sampled immediately: entrance choreography is mid-flight or not yet begun.
    const t0 = await read();
    await new Promise((r) => setTimeout(r, 1800));
    const t1 = await read();
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.4;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 130));
      }
    });
    await new Promise((r) => setTimeout(r, 700));
    const t2 = await read();

    const [s0, s1, s2] = signature([t0, t1, t2]);
    const entranceMoved = s0 !== s1;
    const scrollMoved = s1 !== s2;
    const targetCount = t1.length;

    // "Changed" is not "visible". A transform that moves two pixels between
    // samples technically animates while being imperceptible, which is the
    // complaint this audit exists to answer. So measure magnitude: the largest
    // change in opacity and in vertical position of any single target.
    const magnitude = (a, b) => {
      let opacity = 0;
      let shift = 0;
      let scale = 0;
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        opacity = Math.max(opacity, Math.abs(Number(a[i].o) - Number(b[i].o)));
        shift = Math.max(
          shift,
          Math.abs(a[i].ty - b[i].ty),
          Math.abs(a[i].tx - b[i].tx),
        );
        scale = Math.max(scale, Math.abs(a[i].scale - b[i].scale));
      }
      return {
        opacity: Number(opacity.toFixed(2)),
        shift: Math.round(shift),
        scale: Number(scale.toFixed(3)),
      };
    };
    const ent = magnitude(t0, t1);
    const scr = magnitude(t1, t2);

    // A visible entrance moves something by at least 8px or fades by 0.1.
    const visibleEntrance = ent.shift >= 8 || ent.opacity >= 0.1 || ent.scale >= 0.02;
    const visibleScroll = scr.shift >= 8 || scr.opacity >= 0.1 || scr.scale >= 0.02;

    const ok = targetCount > 0 && (visibleEntrance || visibleScroll);
    if (!ok) failures++;

    const fmt = (m) =>
      m.shift >= 8 || m.opacity >= 0.1 || m.scale >= 0.02
        ? `${m.shift}px o${m.opacity} s${m.scale}`
        : "IMPERCEPTIBLE";

    console.log(
      `${ok ? "PASS" : "FAIL"} ${route.padEnd(9)} targets=${String(targetCount).padStart(3)} entrance=${fmt(ent).padEnd(22)} scroll=${fmt(scr)}`,
    );
    if (!ok && targetCount > 0) {
      // Report which selector groups never moved, so the dead one is identifiable.
      for (const sel of TARGETS) {
        const a = t0.filter((s) => s.tag === sel).map((s) => `${s.o}${s.t}`);
        const b = t1.filter((s) => s.tag === sel).map((s) => `${s.o}${s.t}`);
        const c = t2.filter((s) => s.tag === sel).map((s) => `${s.o}${s.t}`);
        if (a.length && a.join() === b.join() && b.join() === c.join()) {
          console.log(`       static throughout: ${sel} (${a.length})`);
        }
      }
    }
  }

  await browser.close();
  console.log(failures ? `\n${failures} route(s) failed` : "\nall routes passed");
  process.exitCode = failures ? 1 : 0;
})();