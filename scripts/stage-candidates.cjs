const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");

/**
 * Downloads harvested candidates to a staging folder and renders labelled
 * contact sheets.
 *
 * Nothing here touches `public/`. Candidates are reviewed as sheets first and only
 * promoted once a frame has been matched to an actual item — an unreviewed image
 * dropped straight into the manifest is how a cortado ends up illustrated with a
 * siphon and an alt text describing the wrong photograph.
 */
const STAGING = path.resolve(".staging/candidates");
const SHEETS = path.resolve(".staging/sheets");
const LIST = path.resolve("scripts/candidate-pool.json");

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

/** Labels a sheet cell with its index in the pool, so picks can be referenced. */
const label = (index, id) =>
  Buffer.from(
    `<svg width="300" height="270">
       <rect x="0" y="186" width="300" height="84" fill="rgba(0,0,0,0.78)"/>
       <text x="8" y="26" font-family="monospace" font-size="22" font-weight="bold" fill="#ffb020">${index}</text>
       <text x="8" y="212" font-family="monospace" font-size="13" fill="#fff">${id}</text>
     </svg>`,
  );

(async () => {
  const pool = JSON.parse(fs.readFileSync(LIST, "utf8")).pool;
  fs.mkdirSync(STAGING, { recursive: true });
  fs.mkdirSync(SHEETS, { recursive: true });

  const indexed = pool.map((entry, index) => ({ ...entry, index }));
  const queue = [...indexed];
  const failed = [];

  async function worker() {
    while (queue.length) {
      const { id, index, query } = queue.shift();
      const file = path.join(STAGING, `${index}.jpg`);
      if (fs.existsSync(file)) continue;
      try {
        const buf = await get(
          `https://images.unsplash.com/${id}?w=600&q=75&fm=jpg&fit=max&auto=format`,
        );
        await sharp(buf).rotate().jpeg({ quality: 72 }).toFile(file);
        process.stdout.write(`\rdownloaded ${pool.length - queue.length}/${pool.length}`);
      } catch (e) {
        failed.push([index, id, e.message]);
      }
    }
  }

  await Promise.all(Array.from({ length: 6 }, worker));
  console.log(`\ndownloaded ${pool.length - failed.length}/${pool.length}`);
  if (failed.length) {
    // Grouped by reason: a few dead ids is noise, 60 identical errors means the
    // request shape is wrong and every frame would silently be missing.
    const byReason = new Map();
    for (const [, , message] of failed) {
      byReason.set(message, (byReason.get(message) || 0) + 1);
    }
    console.log("failures by reason:", JSON.stringify([...byReason]));
    console.log("first failures:", JSON.stringify(failed.slice(0, 5)));
  }

  // --- contact sheets ---
  const CW = 300;
  const CH = 380;
  const COLS = 6;
  const PER_SHEET = 30;

  // Index lives on the staged entries, so the sheets must be built from those
  // rather than the raw pool — the raw pool has no index to name cells by.
  const available = indexed
    .filter((p) => fs.existsSync(path.join(STAGING, `${p.index}.jpg`)))
    .sort((a, b) => a.index - b.index);

  for (let start = 0; start < available.length; start += PER_SHEET) {
    const slice = available.slice(start, start + PER_SHEET);
    const comps = [];

    for (let i = 0; i < slice.length; i++) {
      const { index, id } = slice[i];
      const cell = await sharp(path.join(STAGING, `${index}.jpg`))
        .resize(CW, 270, { fit: "cover" })
        .composite([{ input: label(index, id), top: 0, left: 0 }])
        .jpeg({ quality: 70 })
        .toBuffer();
      comps.push({ input: cell, left: (i % COLS) * CW, top: Math.floor(i / COLS) * CH });
    }

    const rows = Math.ceil(slice.length / COLS);
    const sheet = path.join(SHEETS, `sheet-${String(start / PER_SHEET + 1).padStart(2, "0")}.jpg`);
    await sharp({
      create: { width: COLS * CW, height: rows * CH, channels: 3, background: "#000" },
    })
      .composite(comps)
      .jpeg({ quality: 74 })
      .toFile(sheet);

    console.log(
      `${path.basename(sheet)}  indices ${slice[0].index}..${slice[slice.length - 1].index}`,
    );
  }

  // Index so a chosen number can be resolved back to its query and id.
  fs.writeFileSync(
    path.resolve(".staging/index.json"),
    JSON.stringify(
      Object.fromEntries(available.map((p) => [p.index, { id: p.id, query: p.query }])),
      null,
      1,
    ),
  );
  console.log(`${available.length} frames available -> ${STAGING}`);
})();