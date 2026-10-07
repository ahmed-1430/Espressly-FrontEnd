const sharp = require("sharp");
const path = require("path");

const SRC = path.resolve("public/brand/espressly-logo.png");
const OUT_DIR = path.resolve("public/brand");

// Knockout variants: the supplied logo is a single-colour-biased flat mark on a
// flat background. A tonal knockout lets it sit on both dark and light surfaces
// without a visible plate, while the original artwork stays untouched.
const CREAM = [243, 236, 224];
const ESPRESSO = [58, 38, 24];

async function knockout(colour) {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  for (let p = 0; p < width * height; p++) {
    const i = p * channels;
    const a = data[i + 3];
    // Preserve the original edge anti-aliasing by using the source alpha directly.
    out[p * 4] = colour[0];
    out[p * 4 + 1] = colour[1];
    out[p * 4 + 2] = colour[2];
    out[p * 4 + 3] = a;
  }

  return sharp(out, { raw: { width, height, channels: 4 } });
}

(async () => {
  const base = await sharp(SRC).metadata();

  await (await knockout(CREAM))
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, "espressly-logo-cream.png"));

  await (await knockout(ESPRESSO))
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, "espressly-logo-espresso.png"));

  console.log("knockouts written", base.width, base.height);

  // Favicon: the cup mark reads at 32px, the full wordmark does not.
  const cupMark = (size) =>
    sharp(SRC)
      .extract({ left: 0, top: 0, width: 182, height: 239 })
      .resize({ width: size, height: size, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "lanczos3" })
      .toBuffer();

  for (const [name, size] of [["icon-32", 32], ["icon-192", 192], ["apple-icon-180", 180]]) {
    await sharp({ create: { width: size, height: size, channels: 4, background: { r: 28, g: 22, b: 17, alpha: 1 } } })
      .composite([{ input: await cupMark(Math.round(size * 0.76)), gravity: "center" }])
      .png()
      .toFile(path.join(OUT_DIR, `${name}.png`));
  }
  console.log("icons written");
})().catch((e) => { console.error(e); process.exit(1); });