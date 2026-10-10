const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");

const OUT = path.resolve("public/images");

/**
 * Curated art direction for Espressly.
 *
 * Every frame was reviewed before it was assigned to a role, so the collection
 * stays coherent: dark roasted browns, warm cream, cinematic shadow, editorial
 * composition. Roles describe how an image is used rather than what it depicts,
 * which keeps the naming meaningful as content changes.
 */
const MANIFEST = {
  // --- cinematic hero ---
  "hero-primary": { id: "1518057111178-44a106bad636", width: 2400 },
  "hero-counter": { id: "1543007630-9710e4a00a20", width: 2200 },
  "hero-bar": { id: "1511081692775-05d0f180a065", width: 2000 },

  // --- espresso bar ---
  "bar-espresso": { id: "1510591509098-f4fdc6d0ff04", width: 1200 },
  "bar-macchiato": { id: "1509042239860-f550ce710b93", width: 1200 },
  "bar-cortado": { id: "1497515114629-f71d768fd07c", width: 1200 },
  "bar-cappuccino": { id: "1498804103079-a6351b050096", width: 1200 },
  "bar-flatwhite": { id: "1495474472287-4d71bcdd2085", width: 1200 },
  "bar-pourover": { id: "1507133750040-4a8f57021571", width: 1200 },
  "bar-batch": { id: "1559496417-e7f25cb247f3", width: 1200 },
  "bar-cupping": { id: "1610889556528-9a770e32642f", width: 1200 },

  // --- cold ---
  "cold-brew": { id: "1517701550927-30cf4ba1dba5", width: 1200 },
  "cold-iced": { id: "1514432324607-a09d9b4aefdd", width: 1200 },
  "cold-tonic": { id: "1517701604599-bb29b565090c", width: 1200 },

  // --- tea ---
  "tea-matcha": { id: "1536256263959-770b48d82b0a", width: 1200 },
  // These two used to share one Unsplash id, so Sencha and Earl Grey rendered
  // as the same photograph under different names. A shared id in the manifest
  // is worse than a missing frame: nothing looks broken, the picture is just
  // quietly wrong.
  "tea-loose-leaf": { id: "1433891248364-3ce993ff0e92", width: 1200 },
  "tea-glass": { id: "1606265771707-c052d0e14656", width: 1200 },
  "tea-pot": { id: "1594631252845-29fc4cc8cde9", width: 1200 },
  "tea-ceramic": { id: "1572442388796-11668a67e53d", width: 1200 },
  // Star anise and milk visible in the cup, so the frame is actually masala chai.
  // Masala Chai previously pointed at the matcha bowl, which showed the reader a
  // green drink and called it spiced tea.
  "tea-chai": { id: "1636920272028-c27f1ae474c3", width: 1200 },

  // --- kitchen & pastry ---
  "food-croissant": { id: "1555507036-ab1f4038808a", width: 1200 },
  "food-viennoiserie": { id: "1517433670267-08bbd4be890f", width: 1200 },
  "food-tray": { id: "1608198093002-ad4e005484ec", width: 1200 },
  "food-counter": { id: "1587668178277-295251f900ce", width: 1200 },
  "food-biscuit": { id: "1544787219-7f47ccb76574", width: 1200 },
  "food-cake": { id: "1541783245831-57d6fb0926d3", width: 1200 },
  "food-toast": { id: "1484723091739-30a097e8f929", width: 1200 },
  "food-breakfast": { id: "1533089860892-a7c6f0a88666", width: 1200 },
  "food-affogato": { id: "1481391032119-d89fee407e44", width: 1200 },
  "food-bread": { id: "1586444248902-2f64eddc13df", width: 1200 },
  "food-dessert": { id: "1519915028121-7d3463d20b13", width: 1200 },

  // --- space ---
  "space-counter": { id: "1453614512568-c4024d13c247", width: 1800 },
  "space-seating": { id: "1554118811-1e0d58224f24", width: 1800 },
  "space-room": { id: "1521017432531-fbd92d768814", width: 1800 },
  "space-menu": { id: "1493857671505-72967e2e2760", width: 1800 },
  "space-window": { id: "1534040385115-33dcb3acba5b", width: 1800 },
  "space-garden": { id: "1600093463592-8e36ae95ef56", width: 1800 },
  "space-facade": { id: "1559305616-3f99cd43e353", width: 1800 },
  "space-street": { id: "1559925393-8be0ec4767c8", width: 1800 },
  "space-table": { id: "1445116572660-236099ec97a0", width: 1800 },

  // --- craft ---
  "craft-machine": { id: "1461988091159-192b6df7054f", width: 1600 },
  "craft-pour": { id: "1541167760496-1628856ab772", width: 1200 },
  "craft-beans": { id: "1610632380989-680fe40816c6", width: 1600 },
  "craft-origin": { id: "1493925410384-84f842e616fb", width: 1200 },

  // --- product & retail ---
  // Frames showing a third party's printed branding — a roaster's name on a bag, a
  // logo on a takeaway cup — are deliberately absent from this manifest. They
  // cannot ship on a site for a different brand, and cropping around a label is
  // not a fix.
  "product-beans": { id: "1442550528053-c431ecb55509", width: 1400 },
  "product-scoop": { id: "1416879595882-3373a0480b5b", width: 1400 },

  // --- menu items ---
  // One frame per item, each reviewed against the photograph rather than
  // against the item's name. Two items were cut from the menu rather than
  // illustrated with a lookalike -- see scripts/promote-candidates.cjs.
  "menu-espresso": { id: "photo-1674642387246-463a03b100be", width: 1200 },
  "menu-macchiato": { id: "photo-1485808191679-5f86510681a2", width: 1200 },
  "menu-cortado": { id: "photo-1563731649913-fab41907b535", width: 1200 },
  "menu-latte": { id: "photo-1534687941688-651ccaafbff8", width: 1200 },
  "menu-flat-white": { id: "photo-1668001178163-45a0badd1ef3", width: 1200 },
  "menu-americano": { id: "photo-1510591509098-f4fdc6d0ff04", width: 1200 },
  "menu-filter-shot": { id: "photo-1599837210403-1a17b48bfee2", width: 1200 },
  "menu-cardamom-flat-white": { id: "photo-1495774856032-8b90bbb32b32", width: 1200 },
  "menu-honey-oat-latte": { id: "photo-1582202737800-8ab9a8cc6e6a", width: 1200 },
  "menu-mocha-pot": { id: "photo-1619286310410-a95de97b0aec", width: 1200 },
  "menu-batch-filter": { id: "photo-1587955245893-389f2215c6eb", width: 1200 },
  "menu-batch-decaf": { id: "photo-1582768772255-7fb8066357ce", width: 1200 },
  "menu-cold-brew": { id: "photo-1642647391072-6a2416f048e5", width: 1200 },
  "menu-iced-latte": { id: "photo-1517701604599-bb29b565090c", width: 1200 },
  "menu-espresso-soda": { id: "photo-1636144832475-0d81f893354d", width: 1200 },
  "menu-cold-brew-bottle": { id: "photo-1647972488473-ca3796499272", width: 1200 },
  "menu-almond-pain": { id: "photo-1710220988376-16dbd51fd1de", width: 1200 },
  "menu-avo-toast": { id: "photo-1783307525039-b92506474dc8", width: 1200 },
  "menu-eggs-any": { id: "photo-1642451378137-7bf98fb6a65a", width: 1200 },
  "menu-granola-bowl": { id: "photo-1612182062572-e29c5dfb5eb4", width: 1200 },
  "menu-maple-oat": { id: "photo-1476283721796-dd935b062838", width: 1200 },
  "menu-pumpkin-spice": { id: "photo-1569383893830-b73dc4a03af0", width: 1200 },
  "menu-gingerbread": { id: "photo-1698672362963-ace2504043b7", width: 1200 },
  "menu-lavender-tonic": { id: "photo-1599137937030-454e1c0de965", width: 1200 },

  // --- editorial ---
  "editorial-still": { id: "1504630083234-14187a9df0f5", width: 1800 },
  "editorial-sign": { id: "1497935586351-b67a49e012bf", width: 1800 },
};

function get(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
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
  fs.mkdirSync(OUT, { recursive: true });
  const entries = Object.entries(MANIFEST);
  const queue = [...entries];
  const failed = [];

  async function worker() {
    while (queue.length) {
      const [name, { id, width }] = queue.shift();
      const file = path.join(OUT, `${name}.jpg`);
      if (fs.existsSync(file)) continue;
      try {
        const buf = await get(
          `https://images.unsplash.com/photo-${id}?w=${width}&q=82&fm=jpg&fit=max&auto=format`
        );
        await sharp(buf)
          .rotate()
          .jpeg({ quality: 82, progressive: true })
          .toFile(file);
        process.stdout.write(`. ${name}\n`);
      } catch (e) {
        failed.push([name, id, e.message]);
        process.stdout.write(`X ${name} (${e.message})\n`);
      }
    }
  }

  await Promise.all(Array.from({ length: 4 }, worker));
  console.log(`\ndone: ${entries.length} roles`);
  if (failed.length) {
    console.log("FAILED:", JSON.stringify(failed));
    process.exitCode = 1;
  }
})();