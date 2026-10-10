const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");

/**
 * Promotes vetted candidates into `public/images` at full resolution.
 *
 * The staging copies are 600px review thumbnails, which is far too small for a
 * menu frame rendered at full column width, so each pick is re-fetched from the
 * CDN at its shipping width.
 *
 * PICKS is the whole editorial decision in one table: role, and the staged index
 * that was reviewed for it. Two menu items are deliberately absent —
 *
 *   canele, black-sesame-cortado
 *
 * Neither exists on free stock photography, and the candidate pool for both came
 * back as display cases and generic lattes. The site already cuts products that
 * cannot be shown honestly rather than illustrate them with something that merely
 * resembles them; the same rule applies here, since a generic latte captioned
 * "black sesame cortado" is a small lie repeated on every visit.
 *
 * Rejected during review, for the record:
 *   #030  small layered coffee on a pale blue ground — off-palette
 *   #068  ice falling into an amber drink outdoors — reads as a cocktail
 */
const PICKS = {
  // --- espresso & milk ---
  "menu-espresso": 27,
  "menu-macchiato": 8,
  "menu-cortado": 10,
  "menu-latte": 24,
  "menu-flat-white": 20,
  "menu-americano": 31,
  "menu-filter-shot": 84,
  // --- signature ---
  "menu-cardamom-flat-white": 86,
  "menu-honey-oat-latte": 107,
  "menu-mocha-pot": 94,
  // --- brewed ---
  "menu-batch-filter": 113,
  "menu-batch-decaf": 114,
  // --- cold ---
  "menu-cold-brew": 64,
  "menu-iced-latte": 13,
  "menu-espresso-soda": 103,
  "menu-cold-brew-bottle": 112,
  // --- kitchen ---
  "menu-almond-pain": 130,
  // --- breakfast ---
  "menu-avo-toast": 149,
  "menu-eggs-any": 155,
  "menu-granola-bowl": 198,
  // --- seasonal ---
  "menu-maple-oat": 180,
  "menu-pumpkin-spice": 172,
  "menu-gingerbread": 183,
  "menu-lavender-tonic": 196,
};

const POOL = path.resolve("scripts/candidate-pool.json");
const OUT = path.resolve("public/images");
const SHIPPING_WIDTH = 1200;

function get(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "user-agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return redirects > 5
            ? reject(new Error("too many redirects"))
            : resolve(get(new URL(res.headers.location, url).toString(), redirects + 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`status ${res.statusCode}`));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

(async () => {
  const pool = JSON.parse(fs.readFileSync(POOL, "utf8")).pool;
  const byIndex = new Map(pool.map((entry, index) => [index, entry]));

  const queue = Object.entries(PICKS);
  const failed = [];

  async function worker() {
    while (queue.length) {
      const [name, index] = queue.shift();
      const entry = byIndex.get(index);
      if (!entry) {
        failed.push([name, index, "index not in pool"]);
        continue;
      }
      try {
        const buf = await get(
          `https://images.unsplash.com/${entry.id}?w=${SHIPPING_WIDTH}&q=82&fm=jpg&fit=max&auto=format`,
        );
        await sharp(buf)
          .rotate()
          .jpeg({ quality: 82, progressive: true })
          .toFile(path.join(OUT, `${name}.jpg`));
        process.stdout.write(`\rpromoted ${Object.keys(PICKS).length - queue.length}/${Object.keys(PICKS).length}`);
      } catch (error) {
        failed.push([name, index, error.message]);
      }
    }
  }

  await Promise.all([worker(), worker(), worker(), worker()]);

  // Emitted so download-images.cjs can be updated with the same ids.
  const manifest = Object.fromEntries(
    Object.entries(PICKS)
      .map(([name, index]) => [name, byIndex.get(index)])
      .filter(([, entry]) => entry)
      .map(([name, entry]) => [name, entry.id]),
  );
  fs.writeFileSync(
    path.resolve("scripts/promoted-manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`\npromoted ${Object.keys(manifest).length} frames`);
  if (failed.length) {
    console.log("FAILED:", JSON.stringify(failed));
    process.exitCode = 1;
  }
})();