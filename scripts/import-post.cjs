const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const usage = 'Usage: node scripts/import-post.cjs "path/to/article.md" [--force] [--dry-run]';
const projectDir = path.resolve(__dirname, '..');

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(usage);
    return;
  }
  const flags = new Set(args.filter((arg) => arg.startsWith('--')));
  const unknownFlag = [...flags].find((flag) => flag !== '--force' && flag !== '--dry-run');
  const sources = args.filter((arg) => !arg.startsWith('--'));
  if (unknownFlag) throw new Error(`Unknown option: ${unknownFlag}\n${usage}`);
  if (sources.length !== 1) throw new Error(usage);

  const force = flags.has('--force');
  const dryRun = flags.has('--dry-run');
  const source = path.resolve(sources[0]);
  const sourceDir = path.dirname(source);
  if (path.extname(source).toLowerCase() !== '.md') {
    throw new Error('The source must be a Markdown (.md) file.');
  }
  if (!fs.statSync(source).isFile()) throw new Error(`Source is not a file: ${source}`);
  let content = fs.readFileSync(source, 'utf-8');

  const basename = path.basename(source, path.extname(source));
  const slug = basename
    .replace(/[^\w一-鿿-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  if (!slug) throw new Error('The filename does not produce a usable slug. Rename the source file.');

  const dest = path.join(projectDir, 'src', 'content', 'posts', `${slug}.md`);
  const imagesDir = path.join(projectDir, 'src', 'assets', 'images');
  const destinationExists = fs.existsSync(dest);
  if (destinationExists) {
    const target = fs.lstatSync(dest);
    if (!target.isFile() || target.isSymbolicLink()) {
      throw new Error(`Destination is not a regular file: ${dest}`);
    }
    if (!force) throw new Error(`Article already exists: ${dest}\nUse --force to overwrite it.`);
  }

  // Resolve every embed before creating directories or writing any files.
  // An explicit, existing path wins; a basename fallback must be unambiguous.
  function findFiles(dir, filename, matches = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) findFiles(fullPath, filename, matches);
      else if (entry.isFile() && entry.name === filename) matches.push(fullPath);
    }
    return matches;
  }

  const imagePlans = new Map();
  const imageRegex = /!\[\[([^\]\n]+?\.(?:png|jpg|jpeg|gif|svg|webp))(?:\|[^\]\n]*)?\]\]/gi;
  content = content.replace(imageRegex, (_fullMatch, imagePath) => {
    const normalizedPath = imagePath.replace(/[\\/]/g, path.sep);
    const imageName = path.basename(normalizedPath);
    const extension = path.extname(imageName).toLowerCase();
    const imageSlug = path.basename(imageName, path.extname(imageName))
      .replace(/[^\w.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'image';

    const directPath = path.resolve(sourceDir, normalizedPath);
    let foundPath;
    if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
      foundPath = directPath;
    } else {
      const matches = findFiles(sourceDir, imageName);
      if (matches.length === 0) throw new Error(`Image not found: ${imagePath}`);
      if (matches.length > 1) {
        throw new Error(`Ambiguous image: ${imagePath}\nUse a relative path to choose one:\n${matches.join('\n')}`);
      }
      foundPath = matches[0];
    }

    const bytes = fs.readFileSync(foundPath);
    const digest = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 10);
    const assetName = `${imageSlug}-${digest}${extension}`;
    const assetDest = path.join(imagesDir, assetName);
    const exists = fs.existsSync(assetDest);
    if (exists && (!fs.lstatSync(assetDest).isFile() || !fs.readFileSync(assetDest).equals(bytes))) {
      throw new Error(`Image destination conflicts with different content: ${assetDest}`);
    }
    const previousPlan = imagePlans.get(assetName);
    if (previousPlan && !previousPlan.bytes.equals(bytes)) {
      throw new Error(`Image hash collision: ${assetName}`);
    }
    imagePlans.set(assetName, { source: foundPath, dest: assetDest, bytes, exists });
    return `![${imageName}](../../assets/images/${assetName})`;
  });

  // Fix date format: 2026-5-14 -> 2026-05-14.
  content = content.replace(
    /^date:\s*(\d{4})-(\d{1,2})-(\d{1,2})$/m,
    (_, y, m, d) => `date: ${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  );

  console.log(`${dryRun ? '[dry-run] ' : ''}${destinationExists ? 'Overwrite' : 'Create'} article: ${dest}`);
  for (const plan of imagePlans.values()) {
    console.log(`  ${plan.exists ? 'Reuse' : 'Copy'} image: ${plan.source} -> ${plan.dest}`);
  }
  if (dryRun) return;

  if (imagePlans.size > 0) fs.mkdirSync(imagesDir, { recursive: true });
  for (const plan of imagePlans.values()) {
    if (!plan.exists) fs.writeFileSync(plan.dest, plan.bytes, { flag: 'wx' });
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // Keep the default overwrite protection even if a file appeared after preflight.
  fs.writeFileSync(dest, content, { flag: force ? 'w' : 'wx' });
  console.log(`Imported: ${dest}`);
}

try {
  main();
} catch (error) {
  console.error(`Import failed: ${error.message}`);
  process.exitCode = 1;
}
