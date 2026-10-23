const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const projectDir = path.resolve(__dirname, '..');
const testRoot = fs.mkdtempSync(path.join(projectDir, '.import-post-test-'));
let passed = 0;

function write(root, name, bytes) {
  const target = path.join(root, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  return target;
}

function snapshot(root) {
  const entries = [];
  function visit(dir) {
    for (const name of fs.readdirSync(dir).sort()) {
      const target = path.join(dir, name);
      const relative = path.relative(root, target);
      if (fs.statSync(target).isDirectory()) {
        entries.push([relative, 'directory']);
        visit(target);
      } else {
        entries.push([relative, fs.readFileSync(target).toString('base64')]);
      }
    }
  }
  visit(root);
  return entries;
}

function fixture(name, test) {
  const root = path.join(testRoot, name);
  const script = write(root, 'scripts/import-post.cjs', fs.readFileSync(path.join(__dirname, 'import-post.cjs')));
  fs.mkdirSync(path.join(root, 'elsewhere'));
  function run(...args) {
    const result = spawnSync(process.execPath, [script, ...args], {
      cwd: path.join(root, 'elsewhere'),
      encoding: 'utf8',
    });
    if (result.error) throw result.error;
    return { ...result, output: result.stdout + result.stderr };
  }
  test({ root, run });
  passed += 1;
  console.log('PASS ' + name);
}

function expectFailureWithoutWrites(root, run, args, message) {
  const before = snapshot(root);
  const result = run(...args);
  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, message);
  assert.deepEqual(snapshot(root), before, 'Failed preflight must not create or modify any file/directory.');
}

try {
  fixture('normal-date-hash-and-project-root', ({ root, run }) => {
    const bytes = Buffer.from('one image content');
    const note = write(root, 'notes/My Note.MD', '---\ndate: 2026-5-4\n---\n![[shot.PNG]]\n![[shot.PNG|640]]');
    write(root, 'notes/shot.PNG', bytes);
    const result = run(path.relative(path.join(root, 'elsewhere'), note));
    assert.equal(result.status, 0, result.output);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 10);
    const asset = 'shot-' + hash + '.png';
    const article = fs.readFileSync(path.join(root, 'src/content/posts/my-note.md'), 'utf8');
    assert.match(article, /date: 2026-05-04/);
    assert.equal(article.split('../../assets/images/' + asset).length - 1, 2);
    assert.deepEqual(fs.readdirSync(path.join(root, 'src/assets/images')), [asset]);
    assert.deepEqual(fs.readFileSync(path.join(root, 'src/assets/images', asset)), bytes);
    assert.equal(fs.existsSync(path.join(root, 'elsewhere/src')), false);
  });

  fixture('default-conflict-is-read-only', ({ root, run }) => {
    const note = write(root, 'notes/post.md', '![[image.png]]');
    write(root, 'notes/image.png', 'new image');
    write(root, 'src/content/posts/post.md', 'original article');
    expectFailureWithoutWrites(root, run, [note], /already exists[\s\S]*--force/);
  });

  fixture('force-overwrites-and-reuses-assets', ({ root, run }) => {
    const note = write(root, 'notes/post.md', '![[image.png]]');
    write(root, 'notes/image.png', 'image');
    write(root, 'src/content/posts/post.md', 'original article');
    assert.equal(run(note, '--force').status, 0);
    const before = snapshot(root);
    const result = run('--force', note);
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /Reuse image:/);
    assert.deepEqual(snapshot(root), before);
    assert.match(fs.readFileSync(path.join(root, 'src/content/posts/post.md'), 'utf8'), /assets\/images\/image-[a-f0-9]{10}\.png/);
  });

  fixture('missing-image-rejects-entire-plan', ({ root, run }) => {
    const note = write(root, 'notes/post.md', '![[valid.png]]\n![[missing.png]]');
    write(root, 'notes/valid.png', 'valid image');
    expectFailureWithoutWrites(root, run, [note], /Image not found: missing\.png/);
  });

  fixture('force-missing-image-preserves-original', ({ root, run }) => {
    const note = write(root, 'notes/post.md', '![[valid.png]]\n![[missing.png]]');
    write(root, 'notes/valid.png', 'valid image');
    write(root, 'src/content/posts/post.md', 'keep original');
    expectFailureWithoutWrites(root, run, [note, '--force'], /Image not found/);
  });

  fixture('ambiguous-basename-rejects-entire-plan', ({ root, run }) => {
    const note = write(root, 'notes/post.md', '![[valid.png]]\n![[duplicate.png]]');
    write(root, 'notes/valid.png', 'valid image');
    write(root, 'notes/a/duplicate.png', 'a');
    write(root, 'notes/b/duplicate.png', 'b');
    expectFailureWithoutWrites(root, run, [note], /Ambiguous image: duplicate\.png/);
  });

  fixture('explicit-image-path-resolves-ambiguity', ({ root, run }) => {
    const note = write(root, 'notes/post.md', '![[a/duplicate.png]]');
    write(root, 'notes/a/duplicate.png', 'a');
    write(root, 'notes/b/duplicate.png', 'b');
    const result = run(note);
    assert.equal(result.status, 0, result.output);
    const images = path.join(root, 'src/assets/images');
    assert.deepEqual(fs.readFileSync(path.join(images, fs.readdirSync(images)[0])), Buffer.from('a'));
  });

  fixture('empty-slug-is-read-only', ({ root, run }) => {
    const note = write(root, 'notes/!!!.md', '![[image.png]]');
    write(root, 'notes/image.png', 'image');
    expectFailureWithoutWrites(root, run, [note], /usable slug/);
  });

  fixture('dry-run-reports-plan-with-zero-writes', ({ root, run }) => {
    const note = write(root, 'notes/post.md', '![[image.png]]');
    write(root, 'notes/image.png', 'image');
    const before = snapshot(root);
    const result = run(note, '--dry-run');
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /\[dry-run\] Create article:/);
    assert.match(result.output, /Copy image:/);
    assert.ok(result.output.includes(path.join(root, 'src/content/posts/post.md')));
    assert.deepEqual(snapshot(root), before);
  });

  fixture('force-dry-run-preserves-existing-article', ({ root, run }) => {
    const note = write(root, 'notes/post.md', 'replacement');
    write(root, 'src/content/posts/post.md', 'original');
    const before = snapshot(root);
    const result = run('--dry-run', note, '--force');
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /\[dry-run\] Overwrite article:/);
    assert.deepEqual(snapshot(root), before);
  });

  fixture('asset-content-conflict-is-read-only', ({ root, run }) => {
    const note = write(root, 'notes/post.md', '![[image.png]]');
    const bytes = Buffer.from('image');
    write(root, 'notes/image.png', bytes);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 10);
    write(root, 'src/assets/images/image-' + hash + '.png', 'conflicting bytes');
    expectFailureWithoutWrites(root, run, [note], /conflicts with different content/);
  });

  fixture('unknown-option-is-read-only', ({ root, run }) => {
    const note = write(root, 'notes/post.md', 'article');
    expectFailureWithoutWrites(root, run, [note, '--wrong'], /Unknown option/);
  });

  console.log('Import CLI checks passed: ' + passed);
} finally {
  // The only recursive removal is the mkdtemp fixture directory inside this project.
  const relative = path.relative(projectDir, path.resolve(testRoot));
  if (!relative.startsWith('.import-post-test-') || relative.includes(path.sep) || path.isAbsolute(relative)) {
    throw new Error('Refusing cleanup outside the project fixture directory: ' + testRoot);
  }
  fs.rmSync(testRoot, { recursive: true, force: true });
}
