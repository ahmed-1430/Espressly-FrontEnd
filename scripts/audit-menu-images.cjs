const fs = require("fs");
const path = require("path");

// Lists every menu item id and whether it carries its own frame, so leftovers
// and gaps are visible without reading the data file by hand.
const src = fs.readFileSync(
  path.join(__dirname, "..", "src", "data", "menu.ts"),
  "utf8",
);

// Only the items array. Splitting the whole file also catches `menuCategories`,
// whose entries carry `image` too and were being counted as items — which
// inflated the totals and hid that a few real items were still borrowing frames.
const itemsSection = src.slice(src.indexOf("export const menuItems"));
const blocks = itemsSection.split(/\n  \{\n/).slice(1);
const missing = [];
const usage = new Map();

for (const block of blocks) {
  const id = (block.match(/id:\s*"([^"]+)"/) || [])[1];
  const image = (block.match(/image:\s*"([^"]+)"/) || [])[1];
  if (!image) missing.push(id);
  else usage.set(image, (usage.get(image) || 0) + 1);
}

console.log(`items: ${blocks.length}`);
console.log(`items without their own frame: ${missing.length}`);
missing.forEach((id) => console.log("  " + id));

const shared = [...usage.entries()].filter(([, n]) => n > 1);
console.log(`\nframes serving more than one item: ${shared.length}`);
shared.forEach(([image, n]) => console.log(`  ${n}x ${image}`));

// Orphans on disk.
const onDisk = fs
  .readdirSync(path.join(__dirname, "..", "public", "images"))
  .filter((f) => f.endsWith(".jpg"))
  .map((f) => `/images/${f}`);
const referenced = new Set(usage.keys());
const orphans = onDisk.filter((f) => !referenced.has(f));
const orphanMenuFrames = orphans.filter((f) => f.includes("/menu-"));
console.log(`\nframes on disk: ${onDisk.length}, referenced by an item: ${referenced.size}`);
console.log(
  `menu frames unreferenced by any item: ${orphanMenuFrames.join(", ") || "none"}`,
);

// A promoted frame that nothing points at means an item was cut or renamed after
// the frames landed, which silently wastes the download and hints at a data
// mistake. Both conditions fail so they cannot be discovered by eye.
let failed = false;
if (missing.length) {
  console.log(
    "\nFAIL every menu item must carry its own frame — a category fallback asserts a photograph is the drink.",
  );
  failed = true;
}
if (orphanMenuFrames.length) {
  console.log("\nFAIL promoted menu frames are referenced by nothing.");
  failed = true;
}
process.exitCode = failed ? 1 : 0;