const fs = require("fs");
const path = require("path");

/**
 * Prints the index behind each contact-sheet cell.
 *
 * Reading an index off a 20px label on a contact sheet is not reliable — 133
 * gets read as 330, 139 as 390 — and a misread index silently attaches the wrong
 * photograph to a menu item. Reviewing by cell position and resolving the index
 * here removes the transcription step entirely.
 */
const OUT = path.resolve(".staging");
const index = JSON.parse(fs.readFileSync(path.join(OUT, "index.json"), "utf8"));

const COLS = 6;
const PER_SHEET = 30;
const CH = 380;

const entries = Object.entries(index)
  .map(([n, meta]) => ({ n: Number(n), ...meta }))
  .sort((a, b) => a.n - b.n);

let sheet = 0;
for (let start = 0; start < entries.length; start += PER_SHEET) {
  sheet++;
  const slice = entries.slice(start, start + PER_SHEET);
  const lines = [`sheet ${String(sheet).padStart(2, "0")}`];
  for (let i = 0; i < slice.length; i++) {
    const row = Math.floor(i / COLS) + 1;
    const col = (i % COLS) + 1;
    lines.push(
      `  r${row}c${col}  #${String(slice[i].n).padStart(3, "0")}  ${slice[i].query}`,
    );
  }
  console.log(lines.join("\n"));
}