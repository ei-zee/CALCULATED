import { readdir, readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { catalog } from "../js/i18n/catalog.js";

const ROOT = new URL("../", import.meta.url).pathname;
const IGNORED_DIRS = new Set(["node_modules", ".git", "output"]);

const usedKeys = new Set();

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      await walk(path);
      continue;
    }

    const extension = extname(entry.name);

    if (![".html", ".js", ".mjs"].includes(extension)) continue;

    const content = await readFile(path, "utf8");

    for (const match of content.matchAll(/data-i18n="([^"]+)"/g)) {
      usedKeys.add(match[1]);
    }

    for (const match of content.matchAll(/\bt\(\s*["'`]([^"'`]+)["'`]/g)) {
      usedKeys.add(match[1]);
    }
  }
}

await walk(ROOT);

const catalogKeys = new Set(Object.keys(catalog));
const missing = [...usedKeys].filter(key => !catalogKeys.has(key));
const unused = [...catalogKeys].filter(key => !usedKeys.has(key));

console.log("=== i18n scan ===");
console.log(`Used keys: ${usedKeys.size}`);
console.log(`Catalog keys: ${catalogKeys.size}`);

if (missing.length) {
  console.warn("\nMissing in catalog:");
  missing.forEach(key => console.warn(`- ${key}`));
}

if (unused.length) {
  console.warn("\nUnused catalog keys:");
  unused.forEach(key => console.warn(`- ${key}`));
}

if (!missing.length && !unused.length) {
  console.log("\nOK: catalog is consistent.");
}