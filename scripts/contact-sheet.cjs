const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const srcDir = process.argv[2];
const outDir = process.argv[3];
const perSheet = Number(process.argv[4] || 9);
const cell = 300;

fs.mkdirSync(outDir, { recursive: true });

const files = fs
  .readdirSync(srcDir)
  .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
  .sort();

(async () => {
  for (let i = 0; i < files.length; i += perSheet) {
    const batch = files.slice(i, i + perSheet);
    const cols = 3;
    const rows = Math.ceil(batch.length / cols);
    const composites = [];
    for (let b = 0; b < batch.length; b++) {
      const buf = await sharp(path.join(srcDir, batch[b]))
        .resize(cell, cell, { fit: "cover" })
        .jpeg({ quality: 70 })
        .toBuffer();
      composites.push({
        input: buf,
        left: (b % cols) * cell,
        top: Math.floor(b / cols) * cell,
      });
    }
    await sharp({
      create: {
        width: cols * cell,
        height: rows * cell,
        channels: 3,
        background: "#111111",
      },
    })
      .composite(composites)
      .jpeg({ quality: 78 })
      .toFile(path.join(outDir, `sheet-${String(i / perSheet + 1).padStart(2, "0")}.jpg`));

    console.log(
      `sheet-${String(i / perSheet + 1).padStart(2, "0")}.jpg:`,
      batch.map((f, idx) => `${idx + 1}. ${f.replace(/\.(jpg|jpeg|png)$/i, "")}`).join(" | ")
    );
  }
})();