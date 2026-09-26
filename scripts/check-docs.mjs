#!/usr/bin/env node
/**
 * Front matter, slug, and placeholder checks for the Docusaurus docs tree.
 * Complements `npm run build`, which fails on broken links and anchors.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = join(root, "docs");
const errors = [];
const warnings = [];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function frontMatter(text) {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  const fields = {};
  for (const line of text.slice(4, end).split("\n")) {
    const m = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (m) fields[m[1]] = m[2].trim();
  }
  return fields;
}

const pages = new Map();

for (const file of walk(docsDir)) {
  if (!/\.mdx?$/.test(file)) continue;
  const rel = relative(root, file);
  const stem = file.split("/").pop().replace(/\.mdx?$/, "");
  const text = readFileSync(file, "utf8");
  const fm = frontMatter(text);
  if (!fm) {
    errors.push(`${rel} has no front matter`);
    continue;
  }
  if (!fm.title) errors.push(`${rel} is missing title`);
  if (!fm.description) errors.push(`${rel} is missing description`);
  if (fm.slug !== `/${stem}`) {
    errors.push(`${rel} must set slug: /${stem} (URLs are /docs/<file-stem>)`);
  }
  if (!/^\d+$/.test(fm.sidebar_position ?? "")) {
    errors.push(`${rel} is missing a numeric sidebar_position`);
  }
  if (pages.has(stem)) {
    errors.push(`${rel} reuses the file name of ${pages.get(stem).rel}; stems must be unique`);
  }
  pages.set(stem, { rel, text, dir: dirname(file), position: fm.sidebar_position });
}

// Every docs folder needs a _category_.json, and page positions must not collide.
for (const dir of new Set([...pages.values()].map((p) => p.dir))) {
  if (dir === docsDir) continue;
  try {
    JSON.parse(readFileSync(join(dir, "_category_.json"), "utf8"));
  } catch (e) {
    errors.push(`${relative(root, dir)}/_category_.json is missing or invalid (${e.message})`);
  }
  const seen = new Map();
  for (const [stem, p] of pages) {
    if (p.dir !== dir) continue;
    if (seen.has(p.position)) {
      errors.push(`${p.rel} shares sidebar_position ${p.position} with ${seen.get(p.position)}`);
    }
    seen.set(p.position, stem);
  }
}

const secretRe =
  /\b(?:d7baec00|sk_live_|ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,})\b/;
const hexToken = /Authorization: Bearer [A-Za-z0-9+/=_-]{40,}/;

for (const [stem, page] of pages) {
  if (secretRe.test(page.text) || hexToken.test(page.text)) {
    errors.push(`${page.rel} looks like it contains a real credential`);
  }
  if (/\bSEE-\d+\b/.test(page.text) && stem !== "source-mapping") {
    warnings.push(`${page.rel} mentions a ticket id`);
  }
}

const required = [
  "getting-started",
  "how-it-works",
  "mcp-quickstart",
  "publish-your-first-feed",
  "source-mapping",
];
for (const slug of required) {
  if (!pages.has(slug)) errors.push(`required page slug missing: ${slug}`);
}

if (warnings.length) {
  console.log("Warnings:");
  for (const w of warnings) console.log(`  - ${w}`);
}
if (errors.length) {
  console.error("Docs check failed:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Docs check passed (${pages.size} pages).`);
