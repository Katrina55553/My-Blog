const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(fullPath) : [fullPath];
  });
}

const files = filesUnder(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const allHtml = htmlFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const assetFiles = filesUnder(path.join(dist, '_astro'));

assert(fs.existsSync(path.join(dist, '404.html')), 'custom 404 page was not built');

const canonicalRedirectSource = '^/[^.]*[^/]$';
const canonicalRedirect = new RegExp(canonicalRedirectSource);
const nginx = fs.readFileSync(path.join(root, 'nginx.conf'), 'utf8');
const hostNginx = fs.readFileSync(path.join(root, 'host-nginx.conf'), 'utf8');
assert(nginx.includes(`location ~ ${canonicalRedirectSource}`), 'container nginx has an unsafe canonical redirect');
assert(hostNginx.includes(`$uri ~ ${canonicalRedirectSource}`), 'host nginx has an unsafe canonical redirect');

for (const url of ['/404.html', '/robots.txt', '/sitemap-0.xml', '/search.json', '/og-image.png', '/']) {
  assert(!canonicalRedirect.test(url), `static URL would be redirected: ${url}`);
}
for (const url of ['/posts/docker-guide', '/posts/not-found', '/page/2', '/tags/ACM']) {
  assert(canonicalRedirect.test(url), `extensionless page would not be canonicalized: ${url}`);
}

for (const file of files) {
  const relative = path.relative(dist, file).replaceAll(path.sep, '/');
  const url = relative === 'index.html'
    ? '/'
    : relative.endsWith('/index.html')
      ? `/${relative.slice(0, -'index.html'.length)}`
      : `/${relative}`;
  assert(!canonicalRedirect.test(url), `built URL would be redirected: ${url}`);
}

const og = fs.readFileSync(path.join(dist, 'og-image.png'));
assert.equal(og.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'OG image is not a PNG');
assert(allHtml.includes('/og-image.png'), 'pages do not reference the PNG OG image');
assert(!allHtml.includes('cdn.jsdelivr.net/npm/mermaid'), 'Mermaid still uses jsDelivr');

const legacyWoff = assetFiles.filter((file) => path.extname(file) === '.woff');
assert.deepEqual(legacyWoff, [], 'legacy .woff assets were emitted');

const cssBytes = assetFiles
  .filter((file) => file.endsWith('.css'))
  .reduce((sum, file) => sum + fs.statSync(file).size, 0);
assert(cssBytes < 120 * 1024, `CSS budget exceeded: ${cssBytes} bytes`);

const imageArticle = fs.readFileSync(
  path.join(dist, 'posts', 'os-core-concepts-notes', 'index.html'),
  'utf8',
);
const optimizedImage = imageArticle.match(/<img[^>]+process-states[^>]+>/i)?.[0] || '';
assert(optimizedImage.includes('.webp'), 'article image was not converted to WebP');
assert(optimizedImage.includes('srcset='), 'article image has no responsive srcset');
assert(optimizedImage.includes('width=') && optimizedImage.includes('height='), 'article image has no intrinsic dimensions');

const plainArticle = fs.readFileSync(path.join(dist, 'posts', 'avoid-ai-code-chaos', 'index.html'), 'utf8');
assert(!plainArticle.includes('katex.min.'), 'KaTeX CSS loaded on a non-math article');

for (const match of allHtml.matchAll(/href="(\/posts\/[^"#?]+)"/g)) {
  assert(match[1].endsWith('/'), `non-canonical post URL found: ${match[1]}`);
}
for (const match of allHtml.matchAll(/href="(\/page\/\d+[^"#?]*)"/g)) {
  assert(match[1].endsWith('/'), `non-canonical pagination URL found: ${match[1]}`);
}

assert(fs.existsSync(path.join(dist, 'sitemap-index.xml')), 'sitemap index was not built');
assert(
  files.some((file) => /^sitemap-\d+\.xml$/.test(path.basename(file))),
  'numbered sitemap was not built',
);

console.log(`Build verification passed: ${htmlFiles.length} HTML files, ${cssBytes} CSS bytes.`);
