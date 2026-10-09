const puppeteer = require("puppeteer");
const base = process.argv[2] ?? "http://localhost:3000";
const routes = process.argv[3].split(",");

(async () => {
  const b = await puppeteer.launch({ headless: "new" });
  for (const route of routes) {
    for (const width of [375, 768, 1440]) {
      const p = await b.newPage();
      await p.setViewport({ width, height: 900 });
      await p.goto(base + route, { waitUntil: "domcontentloaded" });
      await p.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 70));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 200));
      });
      const out = await p.evaluate(() => {
        const d = (el) => {
          const r = el.getBoundingClientRect();
          return {
            txt: (el.textContent || "").trim().slice(0, 42),
            w: Math.round(r.width),
            h: Math.round(r.height),
            cls: String(el.className).slice(0, 58),
            parent: el.parentElement
              ? el.parentElement.tagName.toLowerCase() +
                "." +
                String(el.parentElement.className).slice(0, 34)
              : "",
          };
        };
        return {
          narrow: [...document.querySelectorAll("main p, main h1, main h2, main h3")]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && (r.width < 60 || r.height < 10);
            })
            .map(d),
          smallImgs: [...document.querySelectorAll("main img")]
            .map((el) => ({ ...d(el), src: el.src.slice(-30), parentCls: String(el.parentElement?.className || "").slice(0, 50) }))
            .filter((m) => m.w < 120 || m.h < 120),
        };
      });
      if (out.narrow.length || out.smallImgs.length) {
        console.log(`\n== ${route} @${width}`);
        out.narrow.forEach((n) =>
          console.log(`  TXT  ${n.w}x${n.h} "${n.txt}"  <${n.cls}>  in ${n.parent}`),
        );
        out.smallImgs.forEach((n) =>
          console.log(`  IMG  ${n.w}x${n.h} ${n.src}  in .${n.parentCls}`),
        );
      }
      await p.close();
    }
  }
  await b.close();
})();