const fs = require('fs');
const path = require('path');

const source = process.argv[2];
if (!source) {
  console.log('Usage: node scripts/import-post.js "path/to/article.md"');
  process.exit(1);
}

const content = fs.readFileSync(source, 'utf-8');

// Generate slug from filename
const basename = path.basename(source, '.md');
const slug = basename
  .replace(/[^\w一-鿿-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase();

const dest = path.join('src', 'content', 'posts', `${slug}.md`);
fs.mkdirSync(path.dirname(dest), { recursive: true });

// Fix date format: 2026-5-14 -> 2026-05-14
const fixed = content.replace(
  /^date:\s*(\d{4})-(\d{1,2})-(\d{1,2})$/m,
  (_, y, m, d) => `date: ${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
);

fs.writeFileSync(dest, fixed);
console.log(`Imported: ${dest}`);
