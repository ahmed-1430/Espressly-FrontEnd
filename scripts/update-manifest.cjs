const fs = require("fs");
const path = require("path");

/**
 * Folds promoted candidate frames into the download manifest.
 *
 * `scripts/download-images.cjs` is the manifest of record: if a frame is not
 * listed there it cannot be regenerated, so promoted items have to land in it
 * rather than only on disk.
 */
const promoted = JSON.parse(
  fs.readFileSync(path.join(__dirname, "promoted-manifest.json"), "utf8"),
);
const file = path.join(__dirname, "download-images.cjs");

if (fs.readFileSync(file, "utf8").includes("// --- menu items ---")) {
  console.log("menu items already present in the manifest");
  process.exit(0);
}

const entries = Object.entries(promoted)
  .map(([name, id]) => `  "${name}": { id: "${id}", width: 1200 },`)
  .join("\n");

const block = [
  "  // --- menu items ---",
  "  // One frame per item, each reviewed against the photograph rather than",
  "  // against the item's name. Two items were cut from the menu rather than",
  "  // illustrated with a lookalike -- see scripts/promote-candidates.cjs.",
  entries,
].join("\n");

const anchor = "  // --- editorial ---";
const source = fs.readFileSync(file, "utf8");
if (!source.includes(anchor)) {
  console.error("anchor not found in the manifest");
  process.exit(1);
}

fs.writeFileSync(file, source.replace(anchor, `${block}\n\n${anchor}`));
console.log(`added ${Object.keys(promoted).length} manifest entries`);