const fs = require("fs");
const path = require("path");

/**
 * Assigns a reviewed frame to each menu item and drops the ones that cannot be
 * shown honestly.
 *
 * Done as a transformation rather than by hand because there are two dozen of
 * them: an edit that misses one item would leave that item falling back to its
 * category image again, which is the exact defect this is meant to remove.
 *
 * Cuts `canele` and `black-sesame-cortado`. No honest photograph of either
 * exists in the reviewed pool, and the site's existing rule — that a product
 * which cannot be represented truthfully is cut rather than illustrated with a
 * lookalike — applies to menu items for the same reason it applies to products.
 */
const ASSIGN = {
  espresso: "/images/menu-espresso.jpg",
  macchiato: "/images/menu-macchiato.jpg",
  cortado: "/images/menu-cortado.jpg",
  "flat-white": "/images/menu-flat-white.jpg",
  americano: "/images/menu-americano.jpg",
  "filter-shot": "/images/menu-filter-shot.jpg",
  "cardamom-flat-white": "/images/menu-cardamom-flat-white.jpg",
  "honey-oat-latte": "/images/menu-honey-oat-latte.jpg",
  "mocha-pot": "/images/menu-mocha-pot.jpg",
  "batch-filter": "/images/menu-batch-filter.jpg",
  "batch-decaf": "/images/menu-batch-decaf.jpg",
  "cold-brew": "/images/menu-cold-brew.jpg",
  "iced-latte": "/images/menu-iced-latte.jpg",
  "espresso-soda": "/images/menu-espresso-soda.jpg",
  "cold-brew-bottle": "/images/menu-cold-brew-bottle.jpg",
  "almond-pain": "/images/menu-almond-pain.jpg",
  "avo-toast": "/images/menu-avo-toast.jpg",
  "eggs-any": "/images/menu-eggs-any.jpg",
  "granola-bowl": "/images/menu-granola-bowl.jpg",
  "maple-oat": "/images/menu-maple-oat.jpg",
  "pumpkin-spice": "/images/menu-pumpkin-spice.jpg",
  gingerbread: "/images/menu-gingerbread.jpg",
  "lavender-tonic": "/images/menu-lavender-tonic.jpg",
  // Black tea in a ceramic cup: an existing frame already on the site.
  assam: "/images/tea-ceramic.jpg",
};

const CUT = ["canele", "black-sesame-cortado"];

const file = path.join(__dirname, "..", "src", "data", "menu.ts");
let source = fs.readFileSync(file, "utf8");

// --- 1. remove the cut items ---------------------------------------------
for (const id of CUT) {
  const marker = `id: "${id}",`;
  const at = source.indexOf(marker);
  if (at === -1) {
    console.log(`cut: ${id} not found`);
    continue;
  }
  const blockStart = source.lastIndexOf("  {\n", at);
  const blockEnd = source.indexOf("\n  },", at);
  if (blockStart === -1 || blockEnd === -1) {
    console.log(`cut: ${id} block not delimited`);
    continue;
  }
  source = source.slice(0, blockStart) + source.slice(blockEnd + "\n  },".length + 1);
  console.log(`cut ${id}`);
}

// --- 2. assign images ----------------------------------------------------
const unmatched = [];
const alreadyOwned = new Set();

for (const [id, image] of Object.entries(ASSIGN)) {
  const marker = `id: "${id}",`;
  const at = source.indexOf(marker);
  if (at === -1) {
    unmatched.push(id);
    continue;
  }
  const blockEnd = source.indexOf("\n  },", at);
  const block = source.slice(at, blockEnd);

  // Guard against one frame silently serving two items.
  for (const [, otherImage] of Object.entries(ASSIGN)) {
    if (otherImage !== image) continue;
    const otherId = Object.entries(ASSIGN).find(([, i]) => i === image)[0];
    if (otherId !== id && source.includes(`id: "${otherId}"`)) alreadyOwned.add(image);
  }

  if (block.includes("image:")) {
    source =
      source.slice(0, at) +
      block.replace(/image:\s*"[^"]*",?\s*/, `image: "${image}",\n    `) +
      source.slice(blockEnd);
  } else {
    // Insert before the closing brace, keeping the last property's trailing comma style.
    const insertAt = blockEnd;
    source =
      source.slice(0, insertAt) +
      `\n    image: "${image}",` +
      source.slice(insertAt);
  }
  console.log(`assigned ${id} -> ${image}`);
}

fs.writeFileSync(file, source);

if (alreadyOwned.size) {
  console.log("\nWARNING shared frames:", [...alreadyOwned].join(", "));
}
if (unmatched.length) {
  console.log("\nno such item (left on its existing image):", unmatched.join(", "));
}