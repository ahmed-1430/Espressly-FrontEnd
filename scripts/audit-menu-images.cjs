const fs = require("fs");
const path = require("path");

// Lists every menu item id and whether it carries its own frame, so leftovers
// and gaps are visible without reading the data file by hand.
const src = fs.readFileSync(
  path.join(__dirname, "..", "src", "data", "menu.ts"),
  "utf8",
);

const blocks = src.split(/\n  \{\n/).slice(1);
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
console.log(`\nframes on disk: ${onDisk.length}, referenced by an item: ${referenced.size}`);
console.log(`menu frames unreferenced by any item: ${orphans.filter((f) => f.includes("/menu-")).join(", ") || "none"}`);