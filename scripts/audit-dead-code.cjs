const fs = require("fs");
const path = require("path");

// Reports components that are never imported, and exported symbols that are
// never referenced outside their own file. Both are the usual residue of an
// incremental refactor: a component gets replaced but the old file stays.
const root = path.join(__dirname, "..", "src");

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(t|j)sx?$/.test(entry.name) ? [full] : [];
  });

const files = walk(root);
const rel = (f) => path.relative(root, f).replace(/\\/g, "/");
const contents = new Map(files.map((f) => [rel(f), fs.readFileSync(f, "utf8")]));

const orphanComponents = [];
const unusedExports = [];

for (const [name, source] of contents) {
  const base = path.basename(name).replace(/\.(t|j)sx?$/, "");

  // A component file is orphaned if nothing imports it by path.
  const importers = [...contents.entries()].filter(
    ([other, text]) =>
      other !== name && new RegExp(`from ["'][^"']*/${base}["']`).test(text),
  );
  if (name.startsWith("components/") && importers.length === 0) {
    orphanComponents.push(name);
  }

  // Exported symbols referenced nowhere else.
  for (const match of source.matchAll(
    /export\s+(?:async\s+)?(?:function|const|class|let)\s+([A-Za-z_$][\w$]*)/g,
  )) {
    const symbol = match[1];
    if (symbol === "metadata" || symbol === "default") continue;
    const users = [...contents.entries()].filter(
      ([other, text]) =>
        other !== name && new RegExp(`\\b${symbol}\\b`).test(text),
    );
    if (users.length === 0) unusedExports.push(`${name} -> ${symbol}`);
  }
}

const report = (title, items) => {
  console.log(`\n${title}: ${items.length}`);
  items.forEach((item) => console.log("  " + item));
};

// Next.js route segment conventions are read by the framework, not by
// application code, so they always look unreferenced from here.
const ROUTE_CONVENTIONS = new Set([
  "metadata",
  "generateMetadata",
  "generateStaticParams",
  "dynamic",
  "revalidate",
  "dynamicParams",
  "contentType",
  "alt",
  "size",
  "runtime",
  "preferredRegion",
  "viewport",
  "default",
]);

report("Orphaned component files", orphanComponents);
report(
  "Exported but never referenced",
  unusedExports.filter((entry) => !ROUTE_CONVENTIONS.has(entry.split("-> ")[1])),
);