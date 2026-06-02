/**
 * Reformat seed.sql so every top-level VALUES item sits on its own short
 * line. SQL ignores whitespace, so this is equivalent — but it makes the
 * file safe to copy from a chat code block (no two long UUIDs share a line,
 * which is what caused the earlier corruption).
 *
 *   npx tsx scripts/wrap-seed.ts
 *   → scripts/output/seed_wrapped.sql
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const src = readFileSync(resolve("scripts/output/seed.sql"), "utf8");
let out = "";
let inStr = false;
let depth = 0;

for (let i = 0; i < src.length; i++) {
  const ch = src[i];
  const next = src[i + 1];

  if (inStr) {
    out += ch;
    if (ch === "'") {
      if (next === "'") { out += next; i++; }   // escaped '' stays in string
      else inStr = false;
    }
    continue;
  }

  // pass through `-- …` line comments verbatim (only outside strings)
  if (ch === "-" && next === "-" && depth === 0) {
    const eol = src.indexOf("\n", i);
    const end = eol === -1 ? src.length : eol;
    out += src.slice(i, end);
    i = end - 1;
    continue;
  }

  if (ch === "'") { inStr = true; out += ch; continue; }

  if (ch === "(") {
    depth++;
    out += ch;
    if (depth === 1) out += "\n  ";             // first item on its own line
    continue;
  }
  if (ch === ")") {
    if (depth === 1) out += "\n";
    depth--;
    out += ch;
    continue;
  }
  if (ch === "," && depth === 1) {              // break only top-level commas
    out += ",\n  ";
    continue;
  }
  out += ch;
}

writeFileSync(resolve("scripts/output/seed_wrapped.sql"), out, "utf8");
const lines = out.split("\n");
const longest = Math.max(...lines.map((l) => l.length));
console.log(`✅ seed_wrapped.sql — ${lines.length} lines, longest line = ${longest} chars`);
