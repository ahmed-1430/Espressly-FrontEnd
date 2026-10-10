const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

/**
 * Renders a shortlist of staged candidates at a readable size, so the index in
 * front of the reviewer can be trusted before anything is promoted.
 *
 * The full contact sheets are too small to read the labels, and a misread index
 * silently puts the wrong photograph on a menu item — so the shortlist gets its
 * own pass at a legible scale.
 */
const STAGING = path.resolve(".staging/candidates");
const OUT = path.resolve(".staging");
const index = JSON.parse(fs.readFileSync(path.join(OUT, "index.json"), "utf8"));

const wanted = process.argv.slice(2).map(Number);
if (!wanted.length) {
  console.error("usage: node render-shortlist.cjs <index> [index...]");
  process.exit(1);
}

const CW = 420;
const CH = 420;
const COLS = 5;

(async () => {
  const comps = [];
  const missing = [];

  for (let i = 0; i < wanted.length; i++) {
    const n = wanted[i];
    const file = path.join(STAGING, `${n}.jpg`);
    if (!fs.existsSync(file)) {
      missing.push(n);
      continue;
    }
    const meta = index[n] ?? {};
    const cell = await sharp(file)
      .resize(CW, CH, { fit: "cover" })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${CW}" height="${CH}">
               <rect x="0" y="${CH - 58}" width="${CW}" height="58" fill="rgba(0,0,0,0.82)"/>
               <text x="10" y="30" font-family="monospace" font-size="26" font-weight="bold" fill="#ffb020">#${n}</text>
               <text x="80" y="30" font-family="monospace" font-size="14" fill="#fff">${meta.query ?? "?"}</text>
             </svg>`,
          ),
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 76 })
      .toBuffer();

    comps.push({ input: cell, left: (i % COLS) * CW, top: Math.floor(i / COLS) * CH });
  }

  if (missing.length) console.log("missing from staging:", missing.join(", "));
  if (!comps.length) process.exit(1);

  const rows = Math.ceil(comps.length / COLS);
  await sharp({
    create: { width: COLS * CW, height: rows * CH, channels: 3, background: "#000" },
  })
    .composite(comps)
    .jpeg({ quality: 78 })
    .toFile(path.join(OUT, "shortlist.jpg"));

  console.log(`${comps.length} frames -> .staging/shortlist.jpg`);
})();