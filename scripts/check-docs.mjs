#!/usr/bin/env node
/**
 * Internal-link, navigation, and placeholder checks for the ReadMe docs tree.
 * Complements `npx @readme/cli lint`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
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

function parseOrder(file) {
  return readFileSync(file, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

function loadPages() {
  const pages = new Map();
  for (const file of walk(join(root, "docs")).concat(walk(join(root, "reference")))) {
    if (!file.endsWith(".md")) continue;
    const slug = file.split("/").pop().replace(/\.md$/, "");
    const rel = relative(root, file);
    const text = readFileSync(file, "utf8");
    const fm = text.startsWith("---")
      ? text.slice(3, text.indexOf("\n---", 3) + 1)
      : "";
    pages.set(slug, { file: rel, text, fm });
  }
  return pages;
}

const pages = loadPages();
const slugs = new Set(pages.keys());

function checkOrders(dir) {
  const orderFile = join(dir, "_order.yaml");
  try {
    statSync(orderFile);
  } catch {
    errors.push(`missing ${relative(root, orderFile)}`);
    return;
  }
  const entries = parseOrder(orderFile);
  if (entries.includes("index")) {
    errors.push(`${relative(root, orderFile)} must not list index`);
  }
  for (const entry of entries) {
    const md = join(dir, `${entry}.md`);
    const sub = join(dir, entry);
    let mdOk = false;
    let dirOk = false;
    try {
      mdOk = statSync(md).isFile();
    } catch {
      mdOk = false;
    }
    try {
      dirOk = statSync(sub).isDirectory();
    } catch {
      dirOk = false;
    }
    if (!mdOk && !dirOk) {
      errors.push(`${relative(root, orderFile)} lists "${entry}" but neither ${entry}.md nor a folder exists`);
    }
    if (dirOk) checkOrders(sub);
  }
  for (const name of readdirSync(dir)) {
    if (name === "_order.yaml" || name === "index.md") continue;
    if (name.endsWith(".md")) {
      const slug = name.replace(/\.md$/, "");
      if (!entries.includes(slug)) {
        errors.push(`${relative(root, join(dir, name))} is missing from ${relative(root, orderFile)}`);
      }
    } else {
      try {
        if (statSync(join(dir, name)).isDirectory() && !entries.includes(name)) {
          errors.push(`folder ${relative(root, join(dir, name))} is missing from ${relative(root, orderFile)}`);
        }
      } catch {
        /* ignore */
      }
    }
  }
}

checkOrders(join(root, "docs"));
checkOrders(join(root, "reference"));

const linkRe = /\]\((\/docs\/[a-z0-9-]+(?:#[a-z0-9-]+)?)\)/gi;
const secretRe =
  /\b(?:d7baec00|sk_live_|ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,})\b/;
const hexToken = /Authorization: Bearer [A-Za-z0-9+/=_-]{40,}/;

for (const [slug, page] of pages) {
  if (!page.fm.includes("title:")) {
    errors.push(`${page.file} is missing title front matter`);
  }
  let match;
  while ((match = linkRe.exec(page.text))) {
    const target = match[1].replace(/^\/docs\//, "").split("#")[0];
    if (!slugs.has(target)) {
      errors.push(`${page.file} links to /docs/${target} which has no page`);
    }
  }
  if (secretRe.test(page.text) || hexToken.test(page.text)) {
    errors.push(`${page.file} looks like it contains a real credential`);
  }
  if (/\bSEE-\d+\b/.test(page.text) && slug !== "source-mapping") {
    warnings.push(`${page.file} mentions a ticket id`);
  }
}

const required = [
  "getting-started",
  "how-it-works",
  "mcp-quickstart",
  "publish-your-first-feed",
  "source-mapping",
  "authentication",
  "my-requests",
];
for (const slug of required) {
  if (!slugs.has(slug)) errors.push(`required page slug missing: ${slug}`);
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
