const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Renders the images referenced by the gallery data file as a labelled sheet so
// the authored alt text can be checked against what is actually in each frame.
const data = fs
  .readFileSync(path.join(__dirname, "..", "src", "data", "gallery.ts"), "utf8");
const entries = [...data.matchAll(/id:\s*"([^"]+)"[\s\S]*?src:\s*"([^"]+)"[\s\S]*?alt:\s*\n?\s*"([^"]+)"/g)];

const W = 400;
const H = 250;
const COLS = 3;
const ROWS = Math.ceil(entries.length / COLS);

(async () => {
  const comps = [];
  for (let i = 0; i < entries.length; i++) {
    const [, id, src, alt] = entries[i];
    const file = path.join(__dirname, "..", "public", src.replace(/^\//, ""));
    const cell = await sharp(file)
      .resize(W, H, { fit: "cover" })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${W}" height="${H}">
               <rect x="0" y="0" width="${W}" height="${H}" fill="rgba(0,0,0,0.55)"/>
               <text x="8" y="20" font-family="monospace" font-size="13" fill="#f0a">${i + 1} ${id}</text>
               <foreignObject x="0" y="${H - 52}" width="${W}" height="52">
                 <div xmlns="http://www.w3.org/1999/xhtml" style="font:11px monospace;color:#fff;padding:4px;line-height:1.25">${alt.replace(/[<&]/g, "")}</div>
               </foreignObject>
             </svg>`,
          ),
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 74 })
      .toBuffer();
    comps.push({ input: cell, left: (i % COLS) * W, top: Math.floor(i / COLS) * H });
  }

  await sharp({
    create: { width: COLS * W, height: ROWS * H, channels: 3, background: "#000" },
  })
    .composite(comps)
    .jpeg({ quality: 76 })
    .toFile(path.join(process.argv[2]));

  console.log(`${entries.length} frames -> ${process.argv[2]}`);
})();