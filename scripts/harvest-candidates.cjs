const fs = require("fs");
const path = require("path");

/**
 * Harvests candidate photo ids from Unsplash search pages.
 *
 * The search API needs a key, but the rendered search page carries the CDN urls
 * in its markup, so the ids can be lifted straight out of it. Results are written
 * to a candidates file for review — nothing is assigned to a menu item until the
 * frame has actually been looked at, which is the only reliable way to stop a
 * "cortado" slot being filled with a photograph of a siphon.
 */
const OUT = path.resolve("scripts/candidates.json");

// One query per menu item that still needs a frame of its own.
const QUERIES = {
  "item-espresso": "espresso shot glass",
  "item-double-espresso": "double espresso cup",
  "item-macchiato": "macchiato",
  "item-cortado": "cortado coffee glass",
  "item-cappuccino": "cappuccino foam saucer",
  "item-latte": "latte cup table",
  "item-flat-white": "flat white latte art",
  "item-cold-brew": "cold brew glass ice",
  "item-iced-latte": "iced latte glass ice",
  "item-specialty": "specialty coffee latte art",
  "item-matcha": "matcha latte",
  "item-pastry": "pastry croissant plate",
  "item-breakfast": "breakfast plate cafe",

  "item-americano": "americano coffee cup",
  "item-filter-shot": "filter coffee cup",
  "item-cardamom": "cardamom latte",
  "item-sesame-cortado": "cortado small coffee",
  "item-honey-latte": "honey latte",
  "item-mocha": "mocha chocolate coffee",
  "item-batch-filter": "batch filter coffee",
  "item-batch-decaf": "decaf coffee cup",
  "item-espresso-soda": "coffee soda sparkling",
  "item-cold-brew-bottle": "cold brew bottle",
  "item-assam": "assam black tea cup",
  "item-almond-pain": "almond croissant pain suisse",
  "item-canele": "canele pastry",
  "item-avo-toast": "avocado toast",
  "item-eggs": "eggs any style plate",
  "item-granola": "granola bowl yogurt",
  "item-maple": "maple latte autumn",
  "item-pumpkin": "pumpkin spice latte",
  "item-gingerbread": "gingerbread latte",
  "item-lavender": "lavender drink glass",
};

const PER_QUERY = 8;

const getText = (url) =>
  new Promise((resolve, reject) => {
    const https = require("https");
    https
      .get(url, { headers: { "user-agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return res.statusCode && !res.headers.location
            ? reject(new Error("redirect loop"))
            : resolve(getText(new URL(res.headers.location, url).toString()));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`status ${res.statusCode}`));
        }
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      })
      .on("error", reject);
  });

(async () => {
  const results = {};
  const seen = new Map();

  const names = Object.keys(QUERIES);
  let done = 0;

  const worker = async () => {
    while (names.length) {
      const key = names.shift();
      const url = `https://unsplash.com/s/photos/${QUERIES[key]}`;
      try {
        const html = await getText(url);
        const ids = [...new Set(
          [...html.matchAll(/photo-1[0-9]{12}-[a-z0-9]{12}/g)].map((m) => m[0]),
        )].slice(0, PER_QUERY);
        for (const id of ids) {
          if (!seen.has(id)) seen.set(id, key);
        }
        results[key] = ids;
      } catch (error) {
        results[key] = { error: String(error.message).slice(0, 60) };
      }
      done++;
      process.stdout.write(`\rsearched ${done}/${Object.keys(QUERIES).length}`);
    }
  };

  await Promise.all([worker(), worker(), worker()]);

  const pool = [...seen.entries()].map(([id, firstSeenFor]) => ({ id, firstSeenFor }));
  fs.writeFileSync(
    OUT,
    JSON.stringify({ queries: QUERIES, results, pool }, null, 1),
  );

  console.log(`\n${Object.keys(QUERIES).length} queries`);
  console.log(`${pool.length} unique candidate ids -> ${OUT}`);
  const failed = Object.entries(results).filter(([, v]) => v && v.error);
  if (failed.length) console.log("failed:", JSON.stringify(failed));
})();