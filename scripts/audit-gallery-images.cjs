/**
 * Gallery image audit.
 *
 * The gallery read as repetitive for a reason no existing gate could see: every
 * DOM assertion passed, every photograph loaded, and every `alt` was unique. What
 * was wrong was editorial, and only a data-level check catches it:
 *
 *   - the same file appeared in the gallery more than once
 *   - the gallery borrowed menu and shop product photography, so a drink's product
 *     shot turned up again as "editorial work"
 *   - the set was mapped more than once per page, so one photograph was rendered
 *     three times before the reader reached the lightbox
 *
 * Exits 1 on any failure.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const gallery = read("src/data/gallery.ts");
const page = read("src/app/gallery/page.tsx");

// Pull `/images/<name>` out of a source file.
const imagesIn = (src) =>
  [...src.matchAll(/\/images\/([a-z0-9-]+\.(?:jpg|jpeg|png|webp|avif))/g)].map(
    (m) => m[1],
  );

const productImages = new Set([
  ...imagesIn(read("src/data/menu.ts")),
  ...imagesIn(read("src/data/products.ts")),
]);

const srcs = imagesIn(gallery);
const seen = new Map();
let failures = 0;

for (const name of srcs) {
  seen.set(name, (seen.get(name) ?? 0) + 1);
}

// 1. Every frame must resolve to a real file on disk.
let missing = 0;
for (const name of seen.keys()) {
  if (!fs.existsSync(path.join(ROOT, "public", "images", name))) {
    console.log(`FAIL missing file on disk: ${name}`);
    missing++;
    failures++;
  }
}

// 2. No duplicate files within the set.
let dupes = 0;
for (const [name, count] of seen) {
  if (count > 1) {
    console.log(`FAIL repeated in the gallery set (${count}x): ${name}`);
    dupes++;
    failures++;
  }
}

// 3. The gallery must not reuse product photography.
let borrowed = 0;
for (const name of seen.keys()) {
  if (productImages.has(name)) {
    console.log(`FAIL gallery borrows a product image: ${name}`);
    borrowed++;
    failures++;
  }
}

// 4. The set must be rendered once per page. The page used to map it three times
//    (hero thumbnails, contact-sheet band, spreads); each extra `.map` over the
//    set is a repeat a reader sees before the lightbox. Destructuring the set
//    into named roles and reading `.length` are legitimate, so count renders, not
//    textual references.
const components = [
  "src/components/gallery/gallery-grid.tsx",
  "src/components/hero/gallery-hero.tsx",
];
const renders = components.reduce((total, file) => {
  const src = read(file);
  // A render is a `.map(` whose callback draws a gallery frame — i.e. a map over
  // something derived from the set. Count maps in the gallery components at all;
  // the curated grid maps its inset remainder only, which is one render.
  return total + (src.match(/\.map\(/g) ?? []).length;
}, 0);
if (renders > 1) {
  console.log(
    `FAIL the gallery set is rendered ${renders} times across gallery components`,
  );
  failures++;
}

// 5. The set must stay curated. An eighteen-frame feed was ~22 viewport heights
//    for nine distinct subjects; past a dozen it is a stock library again.
const frameCount = (gallery.match(/^\s{4}id: "/gm) ?? []).length;
if (frameCount > 12) {
  console.log(`FAIL gallery set has grown to ${frameCount} frames`);
  failures++;
}

// 6. Interior shots are the specific thing that made this page read as one room
//    photographed repeatedly. Flag them so growth is a deliberate decision.
const interiors = srcs.filter((n) => /^space-/.test(n));
if (interiors.length > Math.ceil(seen.size / 3)) {
  console.log(
    `WARN ${interiors.length}/${seen.size} frames are interiors — they read alike`,
  );
}

// 7. Every frame must actually render. The grid destructures the set by position
//    into named roles; a frame left out of that destructure disappears from the
//    page while the lightbox still steps onto its index and finds nothing. Both
//    counts must agree.
const destructured = [
  "feature",
  "tallA",
  "wideA",
  "insetA",
  "insetB",
  "insetC",
  "tallB",
  "wideB",
];
const gridSrc = read("src/components/gallery/gallery-grid.tsx");
const declared = destructured.filter((role) =>
  new RegExp(`const\\s+\\[[^\\]]*\\b${role}\\b[^\\]]*\\]\\s*=`).test(gridSrc),
).length;
if (declared !== destructured.length) {
  console.log(
    `FAIL grid declares ${declared}/${destructured.length} layout roles; a frame is dropped`,
  );
  failures++;
}
const rendered = (gridSrc.match(/frame=\{[a-zA-Z]+\}/g) ?? []).length;
if (rendered !== frameCount) {
  console.log(
    `FAIL grid renders ${rendered} frames but the set has ${frameCount}`,
  );
  failures++;
}

// 8. The order the grid destructures against must be the order the data supplies.
const spans = [...gallery.matchAll(/span: "([a-z]+)"/g)].map((m) => m[1]);
const expected = ["feature", "tall", "wide", "inset", "inset", "inset", "tall", "wide"];
if (spans.length === expected.length && spans.join() !== expected.join()) {
  console.log(
    `FAIL layout order drifted: data is ${spans.join(",")}, grid expects ${expected.join(",")}`,
  );
  failures++;
}

console.log(`\nframes: ${frameCount}`);
console.log(`distinct files: ${seen.size}`);
console.log(`missing: ${missing}  repeated: ${dupes}  borrowed: ${borrowed}`);
console.log(`interior frames: ${interiors.length}`);
console.log(failures ? `\n${failures} failure(s)` : "\nno problems found");
process.exitCode = failures ? 1 : 0;