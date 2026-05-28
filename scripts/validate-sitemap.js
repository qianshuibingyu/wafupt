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

const skip = new Set(['404.html', 'sitemap.html']);
const pages = walk(ROOT)
  .map(f => path.relative(ROOT, f).replace(/\\/g, '/'))
  .filter(f => !skip.has(f))
  .map(f => (f === 'index.html' ? 'https://wafulockpt.com/' : `https://wafulockpt.com/${f.replace(/\.html$/, '')}`))
  .sort();

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).sort();

const missingInSitemap = pages.filter(p => !locs.includes(p));
const extraInSitemap = locs.filter(p => !pages.includes(p));

console.log('Pages:', pages.length, 'Sitemap:', locs.length);
if (missingInSitemap.length) console.log('Missing in sitemap:', missingInSitemap);
if (extraInSitemap.length) console.log('Extra in sitemap:', extraInSitemap);
if (!missingInSitemap.length && !extraInSitemap.length) console.log('Sitemap matches all indexable pages');
