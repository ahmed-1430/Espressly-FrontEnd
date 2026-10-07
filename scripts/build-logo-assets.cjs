const sharp = require("sharp");
const path = require("path");

const SRC = path.resolve("resource/expressly-logo.jpeg");
const OUT_DIR = path.resolve("public/brand");

// Background tolerance for the connected-from-edges flood fill.
const TOLERANCE = 34; // euclidean distance in sRGB

function isBackground(r, g, b, br, bg, bb) {
  const d = Math.hypot(r - br, g - bg, b - bb);
  return d <= TOLERANCE;
}

async function main() {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Sample the background reference colour from the top-left corner region.
  let br = 0, bg = 0, bb = 0, n = 0;
  for (let y = 2; y < 8; y++) {
    for (let x = 2; x < 8; x++) {
      const i = (y * width + x) * channels;
      br += data[i]; bg += data[i + 1]; bb += data[i + 2]; n++;
    }
  }
  br = Math.round(br / n); bg = Math.round(bg / n); bb = Math.round(bb / n);
  console.log("background reference rgb:", br, bg, bb);

  // Alpha mask: 0 = background, 1 = artwork. Seeded from every border pixel.
  const mask = new Uint8Array(width * height);

  const seeds = [];
  for (let x = 0; x < width; x++) {
    seeds.push(x, (height - 1) * width + x);
    seeds.push(x, 0);
    seeds.push(0, x);
    seeds.push(width - 1, x);
  }

  const stack = [];
  const push = (idx) => {
    if (mask[idx]) return;
    const i = idx * channels;
    if (data[i + 3] === 0) { mask[idx] = 1; return; }
    if (!isBackground(data[i], data[i + 1], data[i + 2], br, bg, bb)) return;
    mask[idx] = 1;
    stack.push(idx);
  };
  for (const s of seeds) push(s);

  while (stack.length) {
    const idx = stack.pop();
    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) push(idx - 1);
    if (x < width - 1) push(idx + 1);
    if (y > 0) push(idx - width);
    if (y < height - 1) push(idx + width);
  }

  let transparent = 0;
  for (let idx = 0; idx < mask.length; idx++) {
    if (mask[idx]) {
      data[idx * channels + 3] = 0;
      transparent++;
    } else {
      data[idx * channels + 3] = 255;
    }
  }
  console.log("transparent pixels:", transparent, `(${(100 * transparent / mask.length).toFixed(1)}%)`);

  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x]) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  console.log("artwork bounds:", { minX, minY, maxX, maxY });

  const left = Math.max(0, minX - 4);
  const top = Math.max(0, minY - 4);
  const w = Math.min(width, maxX + 5) - left;
  const h = Math.min(height, maxY + 5) - top;

  const cropped = sharp(data, { raw: { width, height, channels } }).extract({
    left, top, width: w, height: h,
  });

  await cropped
    .clone()
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, "espressly-logo.png"));

  // Dark-surface variant: the wordmark is a deep espresso brown, so lift it to a
  // warm cream for use on dark backgrounds while keeping the mark's own colours.
  await cropped
    .clone()
    .resize({ width: 1200, withoutEnlargement: false, kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, "espressly-logo@1200.png"));

  console.log("wrote logo assets", { w, h });
}

main().catch((e) => { console.error(e); process.exit(1); });