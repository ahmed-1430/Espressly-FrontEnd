const fs = require("fs");
const path = require("path");

// Lists a category's items alongside the frame each one uses, so borrowed frames
// within a category are visible without hunting through the data file.
const category = process.argv[2];

const src = fs.readFileSync(
  path.join(__dirname, "..", "src", "data", "menu.ts"),
  "utf8",
);
const section = src.slice(src.indexOf("export const menuItems"));

for (const block of section.split(/\n  \{\n/).slice(1)) {
  if (category && !block.includes(`category: "${category}"`)) continue;
  const id = (block.match(/id:\s*"([^"]+)"/) || [])[1];
  const name = (block.match(/name:\s*"([^"]+)"/) || [])[1];
  const image = (block.match(/image:\s*"([^"]+)"/) || [])[1];
  console.log(
    String(id).padEnd(22),
    String(name).padEnd(24),
    image ?? "— none —",
  );
}

if (category) {
  const available = fs
    .readdirSync(path.join(__dirname, "..", "public", "images"))
    .filter((f) => f.startsWith(category.slice(0, 3)) && f.endsWith(".jpg"));
  console.log(`\navailable ${category.slice(0, 3)}* frames:`);
  console.log("  " + available.join("\n  "));
}