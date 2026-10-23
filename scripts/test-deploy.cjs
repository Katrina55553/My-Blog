const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const yaml = require('js-yaml');
const { createManifest } = require('./deploy-health-manifest.cjs');

const commit = 'a'.repeat(40);
const image = `my-blog:${commit}-123-1`;
const previousImage = `sha256:${'b'.repeat(64)}`;
const bash = process.env.BASH_PATH || (process.platform === 'win32' ? 'D:/Git/bin/bash.exe' : 'bash');
const script = path.join(__dirname, 'deploy-release.sh');
const shellPath = (value) => value.replaceAll('\\', '/');

// These mocks run the real shell deployment script. Only Docker, HTTP, sudo's
// privileged nginx commands are simulated; backup/restore uses real file tools.
const mockCode = '#!/usr/bin/env node\n(' + function deploymentMock() {
  const fs = require('node:fs');
  const path = require('node:path');
  const { spawnSync } = require('node:child_process');
  const command = path.basename(process.argv[1]);
  const args = process.argv.slice(2);
  const stateFile = process.env.MOCK_STATE;
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  state.commands.push([command, ...args]);
  const save = () => fs.writeFileSync(stateFile, JSON.stringify(state));
  const exit = (status = 0) => { save(); process.exit(status); };
  if (command === 'docker') {
    if (args[0] === 'compose') {
      const override = args[args.lastIndexOf('-f') + 1];
      const image = fs.readFileSync(override, 'utf8').match(/image: "([^"]+)"/)[1];
      if (args.includes('ps') && args.includes('-q')) {
        if (state.previous) process.stdout.write('old-container\n');
      } else if (args.includes('up')) {
        assertNoBuildOrPull(args);
        state.currentImage = image;
        if (image.startsWith('sha256:')) state.rollbacks++;
        if (state.mode === 'container-start' && !image.startsWith('sha256:')) exit(17);
      } else if (args.includes('rm')) state.currentImage = '';
      exit();
    }
    if (args[0] === 'inspect') process.stdout.write(`sha256:${'b'.repeat(64)}\n`);
    else if (args[0] === 'image' && args[1] === 'inspect') process.stdout.write(`${state.mode === 'wrong-commit' ? 'c'.repeat(40) : 'a'.repeat(40)}\n`);
    else if (args[0] === 'image' && args[1] === 'rm') exit();
    else if (args[0] === 'port') process.stdout.write('127.0.0.1:49152\n');
    else if (args[0] === 'run') {
      if (args[args.indexOf('--pull') + 1] !== 'never') exit(90);
      process.stdout.write('preview-container\n');
    } else if (!['load', 'tag', 'rm'].includes(args[0])) exit(91);
    exit();
  }
  if (command === 'curl') {
    const url = new URL(args.find((arg) => /^https?:/.test(arg)));
    const preview = url.port === '49152';
    const host = url.protocol === 'https:';
    if (state.mode === 'preview-http' && preview) exit(22);
    if (state.mode === 'host-http' && host) exit(22);
    const output = args[args.indexOf('--output') + 1];
    const body = state.mode === 'stale-html' && !preview && !host && !state.currentImage.startsWith('sha256:')
      ? 'stale-content-with-200-status'
      : state.bodies[url.pathname];
    if (body === undefined) exit(22);
    if (!/(?:^|[\\/])(?:null|nul)$/i.test(output)) fs.writeFileSync(output, body);
    exit();
  }
  if (command === 'sudo') {
    if (args[0] === '-n') args.shift();
    if (args[0] === 'nginx') {
      state.nginxTests++;
      if (state.mode === 'nginx-validation' && state.nginxTests === 1) exit(1);
      exit();
    }
    if (args[0] === 'systemctl') {
      state.reloads++;
      if (state.mode === 'nginx-reload' && state.reloads === 1) exit(1);
      exit();
    }
    save();
    const result = spawnSync(args[0], args.slice(1), { stdio: 'inherit' });
    if (result.error) process.stderr.write(String(result.error));
    process.exit(result.status ?? 99);
  }
  exit(92);
  function assertNoBuildOrPull(values) {
    if (!values.includes('--no-build') || values[values.indexOf('--pull') + 1] !== 'never') exit(93);
  }
}.toString() + ')();\n';

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'my-blog-deploy-test-'));
  const bin = path.join(directory, 'bin');
  fs.mkdirSync(bin);
  for (const command of ['docker', 'sudo', 'curl']) fs.writeFileSync(path.join(bin, command), mockCode, { mode: 0o755 });
  const repo = path.join(directory, 'repo');
  fs.mkdirSync(repo);
  fs.writeFileSync(path.join(repo, 'docker-compose.yml'), 'services:\n  blog:\n    build: .\n');
  fs.writeFileSync(path.join(repo, 'host-nginx.conf'), 'new nginx configuration\n');
  const site = path.join(directory, 'nginx-site');
  const enabled = path.join(directory, 'nginx-enabled');
  const legacy = path.join(directory, 'legacy-site');
  fs.writeFileSync(site, 'old nginx configuration\n');
  fs.writeFileSync(legacy, 'legacy target\n');
  // Windows symlink creation requires developer-mode privileges. A regular file
  // here still verifies the backup restores its original type and content.
  if (process.platform === 'win32') fs.writeFileSync(enabled, 'old enabled configuration\n');
  else fs.symlinkSync(legacy, enabled);
  const bodies = { '/': '<html>new homepage</html>', '/_astro/main.hash.js': 'new javascript' };
  const manifest = path.join(directory, 'health.tsv');
  fs.writeFileSync(manifest, Object.entries(bodies).map(([url, body]) => `${crypto.createHash('sha256').update(body).digest('hex')}\t${url}\n`).join(''));
  const archive = path.join(directory, 'image.tar.gz');
  fs.writeFileSync(archive, 'mock image archive');
  return { directory, bin, repo, site, enabled, legacy, bodies, manifest, archive };
}

for (const mode of ['success', 'wrong-commit', 'preview-http', 'container-start', 'stale-html', 'nginx-validation', 'nginx-reload', 'host-http', 'first-install-failure']) {
  test(`deployment ${mode}`, () => {
    const f = fixture();
    try {
      const stateFile = path.join(f.directory, 'state.json');
      const previous = mode !== 'first-install-failure';
      fs.writeFileSync(stateFile, JSON.stringify({ mode: mode === 'first-install-failure' ? 'host-http' : mode, previous,
        currentImage: previous ? previousImage : '', bodies: f.bodies, commands: [], rollbacks: 0, nginxTests: 0, reloads: 0 }));
      // Git Bash prepends its own system tools at startup, so set PATH inside
      // the shell to ensure its bundled curl cannot shadow the HTTP mock.
      const binPath = shellPath(f.bin).replace(/^([a-z]):/i, (_, drive) => `/${drive.toLowerCase()}`);
      const result = spawnSync(bash, ['-c', 'export PATH="$1:$PATH"; shift; exec bash "$@"', 'deployment-test',
        binPath, shellPath(script), shellPath(f.archive), image, shellPath(f.manifest), commit], {
        encoding: 'utf8', timeout: 60000,
        env: { ...process.env,
          MOCK_STATE: stateFile, DEPLOY_REPOSITORY_DIR: shellPath(f.repo), DEPLOY_NGINX_SITE: shellPath(f.site), DEPLOY_NGINX_ENABLED: shellPath(f.enabled) },
      });
      const diagnostic = `${result.error || ''}\n${result.stdout}\n${result.stderr}`;
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      assert.equal(result.status, mode === 'success' ? 0 : mode === 'container-start' ? 17 : 1, diagnostic);
      const wasReplaced = !['wrong-commit', 'preview-http'].includes(mode);
      assert.equal(state.currentImage, mode === 'success' ? 'my-blog:current' : previous ? previousImage : '', diagnostic);
      assert.equal(state.rollbacks, mode !== 'success' && wasReplaced && previous ? 1 : 0, diagnostic);
      if (mode === 'success') {
        assert.equal(fs.readFileSync(f.site, 'utf8'), 'new nginx configuration\n');
        const requests = state.commands.filter(([command]) => command === 'curl');
        assert.equal(requests.length, 6, diagnostic);
        assert(requests.some((args) => args.includes('blog.cogod.cn:443:127.0.0.1')));
      } else {
        assert.equal(fs.readFileSync(f.site, 'utf8'), 'old nginx configuration\n', diagnostic);
        if (process.platform === 'win32') assert.equal(fs.readFileSync(f.enabled, 'utf8'), 'old enabled configuration\n');
        else assert.equal(fs.readlinkSync(f.enabled), f.legacy);
        if (wasReplaced && previous) assert(state.commands.some((args) => args[0] === 'curl' && args.includes('http://127.0.0.1:8080/') && args.some((arg) => /(?:^|[\\/])(?:null|nul)$/i.test(arg))), diagnostic);
      }
      assert(!state.commands.some((args) => args[0] === 'docker' && (args.includes('build') || args.includes('pull'))), diagnostic);
      assert(state.commands.some((args) => args[0] === 'docker' && args[1] === 'image' && args[2] === 'rm' && args[3] === image), diagnostic);
      if (wasReplaced && previous && mode !== 'success') {
        assert(state.commands.some((args) => args[0] === 'docker' && args[1] === 'tag' && args[2] === previousImage && args[3] === 'my-blog:current'), diagnostic);
      }
    } finally {
      fs.rmSync(f.directory, { recursive: true, force: true });
    }
  });
}

test('health manifest hashes local referenced assets and skips proxied analytics', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'my-blog-health-test-'));
  try {
    const files = { 'index.html': '<script src="/umami/script.js"></script><script src="/_astro/main.hash.js"></script><img srcset="/_astro/pic.webp 400w, /_astro/pic-large.webp 800w">',
      'search/index.html': '<link href="/_astro/main.hash.css" rel="stylesheet">', 'tags/index.html': '<html>tags</html>',
      'posts/example/index.html': '<script src="/api/status.js"></script>', '_astro/main.hash.js': 'javascript',
      '_astro/main.hash.css': 'styles', '_astro/pic.webp': 'image', '_astro/pic-large.webp': 'large image' };
    for (const name of ['og-image.png', 'search.json', 'robots.txt', 'sitemap-index.xml', 'sitemap-0.xml']) files[name] = name;
    for (const [name, content] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(directory, name)), { recursive: true });
      fs.writeFileSync(path.join(directory, name), content);
    }
    const manifest = createManifest(directory);
    assert(manifest.includes(`${crypto.createHash('sha256').update('javascript').digest('hex')}\t/_astro/main.hash.js`));
    assert(manifest.includes('/_astro/pic-large.webp'));
    assert(!manifest.includes('/umami/') && !manifest.includes('/api/'));
    fs.unlinkSync(path.join(directory, '_astro/main.hash.js'));
    assert.throws(() => createManifest(directory), /ENOENT|Missing deployment resource/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('failed deploy reruns consume the artifact and image from the successful build attempt', () => {
  const workflow = yaml.load(fs.readFileSync(path.join(__dirname, '../.github/workflows/deploy.yml'), 'utf8'));
  const buildAttempt = { artifact_name: 'release-123-1', image: `my-blog:${commit}-123-1` };
  function resolve(value, context) {
    return value.replace(/\$\{\{\s*([^}]+?)\s*\}\}/g, (_, expression) => {
      const result = expression.split('.').reduce((object, key) => object?.[key.trim()], context);
      assert.notEqual(result, undefined, `Unknown workflow expression: ${expression}`);
      return result;
    });
  }
  const buildContext = { steps: { package: { outputs: buildAttempt } }, github: { run_id: '123', run_attempt: '1' } };
  const outputs = Object.fromEntries(Object.entries(workflow.jobs.build.outputs).map(([key, value]) => [key, resolve(value, buildContext)]));
  // A rerun of only deploy increments run_attempt without rerunning build.
  const deployContext = { needs: { build: { outputs } }, github: { run_id: '123', run_attempt: '2' } };
  const upload = workflow.jobs.build.steps.find((step) => step.uses?.startsWith('actions/upload-artifact@'));
  const download = workflow.jobs.deploy.steps.find((step) => step.uses?.startsWith('actions/download-artifact@'));
  const deployment = workflow.jobs.deploy.steps.find((step) => step.name === 'Deploy to server');
  assert.equal(resolve(upload.with.name, buildContext), buildAttempt.artifact_name);
  assert.equal(resolve(download.with.name, deployContext), buildAttempt.artifact_name);
  assert.equal(resolve(deployment.env.EXPECTED_IMAGE, deployContext), buildAttempt.image);
  assert(deployment.run.includes('test "$image" = "$EXPECTED_IMAGE"'));
});
