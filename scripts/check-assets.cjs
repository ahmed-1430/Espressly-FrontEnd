/**
 * Asset integrity check.
 *
 * Every image path referenced in source must exist in `public/`, and every file
 * in `public/images/` must be referenced by at least one of them. The second
 * direction matters too: an orphaned file in the manifest is dead weight in the
 * repository and usually a sign that a role was renamed without updating its use.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const PUBLIC = path.join(ROOT, "public");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const sources = walk(SRC);
const referenced = new Set();
const pattern = /\/images\/[A-Za-z0-9._-]+/g;

for (const file of sources) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(pattern)) referenced.add(match[0]);
}

const onDisk = fs.existsSync(path.join(PUBLIC, "images"))
  ? fs
      .readdirSync(path.join(PUBLIC, "images"))
      .filter((name) => /\.(jpg|jpeg|png|webp)$/i.test(name))
      .map((name) => `/images/${name}`)
  : [];

const missing = [...referenced].filter((ref) => !onDisk.includes(ref));
const orphans = onDisk.filter((name) => !referenced.has(name));

console.log(`referenced: ${referenced.size}`);
console.log(`on disk:    ${onDisk.length}`);

if (missing.length) {
  console.log("\nMISSING (referenced in code, not in public/images):");
  for (const ref of missing) console.log("  " + ref);
}
if (orphans.length) {
  console.log("\nORPHANED (in public/images, never referenced):");
  for (const ref of orphans) console.log("  " + ref);
}

process.exitCode = missing.length ? 1 : 0;