const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Renders contact sheets where each cell is labelled with the Unsplash photo id,
// so manifest roles can be assigned against what each frame actually shows.
const srcDir = process.argv[2];
const outDir = process.argv[3];
const perSheet = Number(process.argv[4] || 9);
const cell = 340;
const cols = 3;

fs.mkdirSync(outDir, { recursive: true });

const files = fs
  .readdirSync(srcDir)
  .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
  .sort();

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

(async () => {
  const sheets = [];
  for (let i = 0; i < files.length; i += perSheet) {
    sheets.push(files.slice(i, i + perSheet));
  }

  for (let s = 0; s < sheets.length; s++) {
    const batch = sheets[s];
    const rows = Math.ceil(batch.length / cols);
    const composites = [];

    for (let b = 0; b < batch.length; b++) {
      const file = batch[b];
      const label = escape(file.replace(/\.(jpg|jpeg|png)$/i, ""));

      const photo = await sharp(path.join(srcDir, file))
        .resize(cell, cell, { fit: "cover" })
        .jpeg({ quality: 74 })
        .toBuffer();

      const overlay = Buffer.from(
        `<svg width="${cell}" height="${cell}">
          <rect x="0" y="0" width="${cell}" height="${cell}" fill="none" />
          <rect x="0" y="${cell - 46}" width="${cell}" height="46" fill="#000" opacity="0.62" />
          <text x="10" y="${cell - 26}" font-family="monospace" font-size="15" fill="#FFE9C7">${label}</text>
          <text x="10" y="${cell - 9}" font-family="monospace" font-size="12" fill="#C9A87C">[${b + 1}]</text>
        </svg>`
      );

      composites.push({
        input: Buffer.concat([photo, overlay]),
        left: (b % cols) * cell,
        top: Math.floor(b / cols) * cell,
      });
    }

    const name = `id-sheet-${String(s + 1).padStart(2, "0")}.jpg`;
    await sharp({
      create: {
        width: cols * cell,
        height: rows * cell,
        channels: 3,
        background: "#111111",
      },
    })
      .composite(composites)
      .jpeg({ quality: 80 })
      .toFile(path.join(outDir, name));
    console.log(name, batch.map((f) => f.replace(/\..+$/, "")).join(" | "));
  }
})();