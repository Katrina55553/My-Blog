const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = path.resolve(__dirname, '../src/scripts/view-counter.ts');
const source = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

// A small host for the real custom element. Mounting invokes its registered
// connectedCallback, while storage and HTTP remain under the test's control.
function createHost({ cache = null, data = [], storageDenied = false, responseOk = true } = {}) {
  const registry = new Map();
  const calls = { cacheReads: 0, fetches: 0 };

  class Element {
    constructor() {
      this.dataset = {};
      this.isConnected = false;
      this.textContent = '\u2014';
    }

    remove() {
      this.isConnected = false;
    }
  }

  vm.runInNewContext(source, {
    exports: {},
    HTMLElement: Element,
    customElements: {
      get: (name) => registry.get(name),
      define: (name, element) => {
        assert.ok(!registry.has(name), 'A custom element must only be registered once');
        registry.set(name, element);
      },
    },
    localStorage: {
      getItem() {
        calls.cacheReads++;
        if (storageDenied) throw new Error('Storage access denied');
        return cache;
      },
      setItem() {
        if (storageDenied) throw new Error('Storage access denied');
      },
    },
    fetch: async (request) => {
      calls.fetches++;
      const url = new URL(request, 'https://blog.example');
      assert.equal(url.searchParams.get('type'), 'url');
      assert.equal(url.searchParams.get('startAt'), '0');
      return { ok: responseOk, json: async () => data };
    },
  }, { filename: sourcePath });

  function connect(element) {
    element.isConnected = true;
    element.connectedCallback();
    return element;
  }

  return {
    calls,
    connect,
    mount(slug) {
      const Counter = registry.get('blog-view-counter');
      assert.ok(Counter, 'The browser module must register its custom element');
      const counter = new Counter();
      counter.dataset.slug = slug;
      return connect(counter);
    },
  };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));
const validMetrics = [
  { x: '/posts/example', y: 3 },
  { x: '/posts/example/', y: 4 },
  { x: '/posts/zero/', y: 0 },
  null,
  { x: '/posts/example/', y: -2 },
  { x: '/posts/example', y: '5' },
  { x: 123, y: 9 },
];

async function verifyCounts(label, options, expectedFetches) {
  const host = createHost(options);
  const first = host.mount('example');
  const second = host.mount('example');
  const zero = host.mount('zero');
  const missing = host.mount('missing');
  await settle();

  assert.equal(first.textContent, '7 次阅读', `${label}: legacy URL variants must add together`);
  assert.equal(second.textContent, '7 次阅读', `${label}: all mounted counters must update`);
  assert.equal(zero.isConnected, false, `${label}: zero counts must be removed`);
  assert.equal(missing.isConnected, false, `${label}: absent counts must be removed`);
  assert.equal(host.calls.cacheReads, 1, `${label}: read the cache only once per page`);
  assert.equal(host.calls.fetches, expectedFetches, `${label}: share one HTTP request`);

  // This follows the same lifecycle as cards created by archive pagination.
  const dynamic = host.mount('example');
  first.remove();
  host.connect(first);
  await settle();
  assert.equal(dynamic.textContent, '7 次阅读', `${label}: newly inserted counters must update`);
  assert.equal(first.textContent, '7 次阅读', `${label}: reconnected cards must retain their count`);
  assert.equal(host.calls.cacheReads, 1, `${label}: dynamic cards must reuse the loaded cache`);
  assert.equal(host.calls.fetches, expectedFetches, `${label}: dynamic cards must reuse the loaded request`);
}

async function main() {
  const freshCache = JSON.stringify({ data: validMetrics, ts: Date.now() });
  await verifyCounts('Fresh cache', { cache: freshCache }, 0);
  await verifyCounts('No cache', { data: validMetrics }, 1);
  await verifyCounts('Corrupted cache', { cache: '{invalid JSON', data: validMetrics }, 1);
  await verifyCounts('Expired cache', {
    cache: JSON.stringify({ data: validMetrics, ts: Date.now() - 31 * 60 * 1000 }),
    data: validMetrics,
  }, 1);
  await verifyCounts('Malformed cached data', {
    cache: JSON.stringify({ data: { unexpected: true }, ts: Date.now() }),
    data: validMetrics,
  }, 1);
  await verifyCounts('Unavailable storage', { data: validMetrics, storageDenied: true }, 1);

  for (const options of [{ data: { unexpected: true } }, { responseOk: false }]) {
    const host = createHost(options);
    const first = host.mount('example');
    const second = host.mount('other');
    await settle();
    assert.equal(first.isConnected, false, 'Failed or malformed HTTP results must hide the counter');
    assert.equal(second.isConnected, false, 'Failures must settle all counters');
    assert.equal(host.calls.fetches, 1, 'Failures must still share a single request');
  }

  console.log('View counter checks passed: shared cache/request, legacy URLs, malformed data, and dynamic insertion.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
