const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "public", "images");
const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

(async () => {
  const rows = [];
  for (const f of files) {
    try {
      const m = await sharp(path.join(dir, f)).metadata();
      rows.push([f, m.width, m.height, m.width / m.height]);
    } catch {
      rows.push([f, 0, 0, 0]);
    }
  }
  rows.sort((a, b) => b[3] - a[3]);
  for (const r of rows) {
    console.log(
      r[3].toFixed(2).padStart(5),
      String(r[1] + "x" + r[2]).padEnd(12),
      r[0],
    );
  }
})();