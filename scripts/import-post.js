const fs = require('fs');
const path = require('path');

const source = process.argv[2];
if (!source) {
  console.log('Usage: node scripts/import-post.js "path/to/article.md"');
  process.exit(1);
}

const sourceDir = path.dirname(source);
let content = fs.readFileSync(source, 'utf-8');

// Generate slug from filename
const basename = path.basename(source, '.md');
const slug = basename
  .replace(/[^\w一-鿿-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase();

// Process Obsidian image embeds: ![[image.png]] or ![[subdir/image.png]]
const imageRegex = /!\[\[([^\]]+?\.(?:png|jpg|jpeg|gif|svg|webp))\]\]/gi;
const imagesDir = path.join('public', 'images');
fs.mkdirSync(imagesDir, { recursive: true });

content = content.replace(imageRegex, (fullMatch, imagePath) => {
  const imageName = path.basename(imagePath);
  const imageSlug = imageName
    .replace(/[^\w.-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  // Try to find the image relative to the source file
  const candidates = [
    path.join(sourceDir, imagePath),
    path.join(sourceDir, imageName),
  ];

  let found = false;
  for (const src of candidates) {
    if (fs.existsSync(src)) {
      const dest = path.join(imagesDir, imageSlug);
      fs.copyFileSync(src, dest);
      console.log(`  Copied image: ${imageSlug}`);
      found = true;
      break;
    }
  }

  if (!found) {
    console.log(`  Warning: image not found — ${imagePath}`);
  }

  return `![${imageName}](/images/${imageSlug})`;
});

// Fix date format: 2026-5-14 -> 2026-05-14
content = content.replace(
  /^date:\s*(\d{4})-(\d{1,2})-(\d{1,2})$/m,
  (_, y, m, d) => `date: ${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
);

const dest = path.join('src', 'content', 'posts', `${slug}.md`);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, content);
console.log(`Imported: ${dest}`);
