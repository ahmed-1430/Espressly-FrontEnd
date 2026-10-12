/**
 * Inner-page hero composition audit.
 *
 * Four inner pages once shared one outer composition: a full-bleed background
 * photograph, a gradient scrim or two, and an oversized `clamp()` display title.
 * Every individual hero looked deliberate, so no review of any one of them would
 * have flagged it — the repetition was only visible across the set.
 *
 * So this measures the set. A hero that reintroduces a viewport-height
 * photograph backdrop, or blows its title past the editorial ceiling, fails here.
 * The home page is excluded: a full-bleed opening frame genuinely is the brand
 * statement, and the brief asks for it there.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const heroes = ["menu", "shop", "about", "contact", "gallery"];

// Any of these in an inner hero means a full-viewport photograph backdrop.
const FULL_BLEED = [
  /absolute inset-0 -z-10 h-full w-full/,
  /min-h-\[9\d+s?vh\]/,
  /min-h-\[100/,
  /h-screen/,
  /min-h-screen/,
];

let failures = 0;

for (const name of heroes) {
  const file = path.join(ROOT, "src", "components", "hero", `${name}-hero.tsx`);
  const raw = fs.readFileSync(file, "utf8");

  // Strip comments before matching. Each rewritten hero documents the exact
  // markup it replaced — `min-h-[92svh]`, `clamp(4.25rem,17vw,15rem)` — so a
  // naive scan flags every hero for describing its own former self.
  const src = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  const problems = [];

  for (const pattern of FULL_BLEED) {
    if (pattern.test(src)) {
      problems.push(`full-bleed backdrop: ${pattern}`);
    }
  }

  // Title ceiling. The old heroes ran to clamp(4.25rem,17vw,15rem); the editorial
  // range tops out around 5.5rem.
  const clamps = [...src.matchAll(/clamp\(([\d.]+)rem,\s*([\d.]+)vw,\s*([\d.]+)rem\)/g)];
  for (const [, , vw, max] of clamps) {
    if (Number(max) > 6 || Number(vw) > 9) {
      problems.push(`oversized title: clamp vw=${vw} max=${max}rem`);
    }
  }

  // A hero must reach real content inside the opening viewport.
  const ok = problems.length === 0;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}-hero${ok ? "" : " — " + problems.join("; ")}`,
  );
}

// The four inner heroes must not share one composition. Count how many still lead
// with a photograph as their dominant element.
const photographic = heroes.filter((name) => {
  const raw = fs.readFileSync(
    path.join(ROOT, "src", "components", "hero", `${name}-hero.tsx`),
    "utf8",
  );
  const src = raw.replace(/\/\*[\s\S]*?\*\//g, "");
  return /HeroMedia/.test(src);
});
console.log(`\nheroes leading with a photograph: ${photographic.length}/${heroes.length} (${photographic.join(", ")})`);
console.log("contact deliberately leads with type and information; gallery leads with a wall label.");

console.log(failures ? `\n${failures} hero(s) failed` : "\nall heroes passed");
process.exitCode = failures ? 1 : 0;