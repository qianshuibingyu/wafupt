const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", "scripts", "functions"]);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith(".html") || e.name.endsWith(".css")) out.push(full);
  }
  return out;
}

function resolveLocal(fromFile, href) {
  if (!href || href.startsWith("#") || href.startsWith("data:") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return null;
  if (/^https?:\/\//i.test(href)) return null;
  const clean = href.split(",")[0].trim().split(" ")[0].split("#")[0].split("?")[0];
  if (!clean || clean.startsWith("/")) {
    if (clean && clean.startsWith("/") && !clean.startsWith("//")) {
      const abs = path.join(ROOT, clean.replace(/^\//, ""));
      if (fs.existsSync(abs)) return null;
      return clean;
    }
    return null;
  }
  const base = path.dirname(fromFile);
  let target = path.normalize(path.join(base, clean));
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
  if (fs.existsSync(target)) return null;
  return path.relative(ROOT, target).replace(/\\/g, "/");
}

const missing = new Map();
for (const file of walk(ROOT)) {
  const content = fs.readFileSync(file, "utf8");
  for (const m of content.matchAll(/(?:src|srcset|data-src|href)=["']([^"']+)["']/g)) {
    const miss = resolveLocal(file, m[1]);
    if (miss) missing.set(miss, (missing.get(miss) || 0) + 1);
  }
}

const imageMissing = [...missing.entries()].filter(([p]) =>
  /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(p) || p.startsWith("images/") || p.startsWith("icons/")
);

console.log("Missing image/icon assets:", imageMissing.length);
imageMissing
  .sort((a, b) => b[1] - a[1])
  .forEach(([p, c]) => console.log(`${c}\t${p}`));

const htmlMissing = [...missing.entries()].filter(([p]) => p.endsWith(".html") || !/\.(jpg|jpeg|png|gif|webp|svg|ico|css|js)$/i.test(p));
console.log("\nMissing HTML/extensionless (middleware handles on CF):", htmlMissing.length);
