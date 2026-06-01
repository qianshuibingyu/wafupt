const fs = require("fs");
const path = require("path");

const siteRoot = path.resolve(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", "scripts", "functions"]);

function getAllHtmlFiles(dir, list = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) getAllHtmlFiles(full, list);
    else if (entry.name.endsWith(".html")) list.push(full);
  }
  return list;
}

function assetPrefix(filePath) {
  const rel = path.relative(siteRoot, path.dirname(filePath));
  if (!rel || rel === ".") return "./";
  const depth = rel.split(path.sep).length;
  return "../".repeat(depth);
}

function restoreRelativePaths(content, prefix) {
  const attrs = ["href", "src", "srcset", "data-src"];
  for (const attr of attrs) {
    const re = new RegExp(`(${attr}=["'])/`, "g");
    content = content.replace(re, `$1${prefix}`);
  }
  return content;
}

let fixed = 0;
for (const filePath of getAllHtmlFiles(siteRoot)) {
  const prefix = assetPrefix(filePath);
  const original = fs.readFileSync(filePath, "utf8");
  const updated = restoreRelativePaths(original, prefix);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
    fixed++;
    console.log(`${path.relative(siteRoot, filePath)} -> prefix "${prefix}"`);
  }
}

console.log(`Restored relative asset paths in ${fixed} files.`);
