const fs = require("fs");
const path = require("path");

const siteRoot = path.resolve(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", "scripts", "functions"]);

const replacements = [
  ['src="././images/', 'src="./images/'],
  ['srcset="././images/', 'srcset="./images/'],
  ['data-src="././images/', 'data-src="./images/'],
];

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

let fixed = 0;
for (const filePath of getAllHtmlFiles(siteRoot)) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  const prefix = assetPrefix(filePath);

  for (const [from, to] of replacements) {
    content = content.split(from.replace("./", prefix)).join(to.replace("./", prefix));
  }

  content = content.replace(/(src|href|data-src)=("([^"]*?) +")/g, '$1="$3"');

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    fixed++;
  }
}

console.log(`Fixed image path typos in ${fixed} files (CSS/JS paths unchanged).`);
