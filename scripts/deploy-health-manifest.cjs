const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// Hash the actual CI output. HTTP checks then catch stale HTML, missing assets,
// and a reverse proxy returning its HTML fallback with a misleading 200 status.
function createManifest(distDirectory) {
  const dist = path.resolve(distDirectory);
  const posts = fs.readdirSync(path.join(dist, 'posts'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert(posts.length > 0, 'No article available for deployment health checks');
  const routes = ['/', '/search/', '/tags/', `/posts/${posts[0]}/`];
  const resources = new Map();

  function add(urlPath) {
    const pathname = new URL(urlPath, 'https://health.invalid').pathname;
    const relative = decodeURIComponent(pathname).replace(/^\//, '');
    const file = path.resolve(dist, relative || 'index.html', pathname.endsWith('/') && relative ? 'index.html' : '');
    assert(file.startsWith(`${dist}${path.sep}`), `Resource escapes dist: ${urlPath}`);
    assert(fs.statSync(file).isFile(), `Missing deployment resource: ${urlPath}`);
    resources.set(pathname, file);
  }

  for (const route of routes) {
    add(route);
    const html = fs.readFileSync(resources.get(route), 'utf8');
    // Check assets directly used by these pages, including responsive images.
    // Document/navigation links and third-party analytics are not health checks.
    for (const element of html.matchAll(/<(?:script|link|img|source)\b[^>]*>/gi)) {
      for (const attribute of element[0].matchAll(/\b(?:src|href|srcset)\s*=\s*["']([^"']*)["']/gi)) {
        const values = /^srcset/i.test(attribute[0])
          ? attribute[1].split(',').map((candidate) => candidate.trim().split(/\s+/)[0])
          : [attribute[1]];
        for (const value of values) {
          if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) continue;
          const url = new URL(value.replaceAll('&amp;', '&'), `https://health.invalid${route}`);
          if (/^\/(?:umami|api)\//.test(url.pathname)) continue;
          if (/\.(?:css|m?js|png|svg|webp|avif|jpe?g|gif|ico|woff2)$/i.test(url.pathname)) add(url.pathname);
        }
      }
    }
  }
  // Include the social image and the public search/feed endpoints as well.
  for (const resource of ['/og-image.png', '/search.json', '/robots.txt', '/sitemap-index.xml', '/sitemap-0.xml']) add(resource);
  return [...resources].map(([url, file]) => {
    const checksum = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    return `${checksum}\t${url}`;
  }).join('\n') + '\n';
}

if (require.main === module) {
  assert(process.argv[2] && process.argv[3], 'Usage: node scripts/deploy-health-manifest.cjs <dist> <manifest.tsv>');
  fs.writeFileSync(process.argv[3], createManifest(process.argv[2]));
}

module.exports = { createManifest };
