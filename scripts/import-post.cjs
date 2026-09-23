const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const source = process.argv[2];
if (!source) {
  console.log('Usage: node scripts/import-post.cjs "path/to/article.md"');
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

// Recursively search for a file by name under a directory
function findFile(dir, filename) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const result = findFile(fullPath, filename);
        if (result) return result;
      } else if (entry.name === filename) {
        return fullPath;
      }
    }
  } catch (_) {
    // Permission error or missing dir — skip
  }
  return null;
}

// Process Obsidian image embeds: ![[image.png]] or ![[subdir/image.png]]
const imageRegex = /!\[\[([^\]]+?\.(?:png|jpg|jpeg|gif|svg|webp))\]\]/gi;
const imagesDir = path.join('src', 'assets', 'images');
fs.mkdirSync(imagesDir, { recursive: true });

content = content.replace(imageRegex, (fullMatch, imagePath) => {
  const imageName = path.basename(imagePath);
  const extension = path.extname(imageName).toLowerCase();
  const imageSlug = path.basename(imageName, extension)
    .replace(/[^\w.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'image';

  // Prefer the path written in the note; fall back to a recursive basename search.
  const directPath = path.resolve(sourceDir, imagePath);
  const foundPath = fs.existsSync(directPath) && fs.statSync(directPath).isFile()
    ? directPath
    : findFile(sourceDir, imageName);
  if (foundPath) {
    const bytes = fs.readFileSync(foundPath);
    const digest = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 10);
    const assetName = `${imageSlug}-${digest}${extension}`;
    const dest = path.join(imagesDir, assetName);
    if (!fs.existsSync(dest)) fs.copyFileSync(foundPath, dest, fs.constants.COPYFILE_EXCL);
    console.log(`  Copied image: ${assetName}`);
    return `![${imageName}](../../assets/images/${assetName})`;
  } else {
    console.log(`  Warning: image not found — ${imagePath}`);
    return fullMatch;
  }
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
