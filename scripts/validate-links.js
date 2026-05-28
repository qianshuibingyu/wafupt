const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function walk(dir, list = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', 'scripts', '.git'].includes(e.name)) walk(full, list);
    else if (e.isFile() && e.name.endsWith('.html')) list.push(full);
  }
  return list;
}

function resolveLocal(fromFile, href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return null;
  if (/^https?:\/\//i.test(href)) return null;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  const base = path.dirname(fromFile);
  let target = path.normalize(path.join(base, clean));
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (fs.existsSync(target)) return null;
  if (fs.existsSync(target + '.html')) return null;
  return path.relative(ROOT, target).replace(/\\/g, '/');
}

const broken = [];
for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const miss = resolveLocal(file, m[1]);
    if (miss) broken.push({ from: rel, href: m[1], miss });
  }
}

if (broken.length) {
  console.log('Broken local links:', broken.length);
  broken.slice(0, 30).forEach(b => console.log(`  ${b.from} -> ${b.href} (${b.miss})`));
  process.exit(1);
}
console.log('All local href/src links OK');
