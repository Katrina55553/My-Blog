const WEBSITE_ID = 'ceead9d3-35d9-4590-8678-d153328378a6';
const CACHE_KEY = '__vc_data';
const TTL = 30 * 60 * 1000;

// Astro includes this module once, and dynamically inserted counters share it too.
let viewCounts: Promise<Map<string, number>> | undefined;

function aggregateCounts(data: unknown): Map<string, number> {
  const counts = new Map<string, number>();
  if (!Array.isArray(data)) return counts;

  for (const entry of data) {
    if (!entry || typeof entry.x !== 'string' || typeof entry.y !== 'number'
      || !Number.isFinite(entry.y) || entry.y < 0) continue;
    const path = entry.x.replace(/\/$/, '');
    const total = (counts.get(path) ?? 0) + entry.y;
    if (Number.isFinite(total)) counts.set(path, total);
  }
  return counts;
}

function loadCache(): unknown[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: unknown = JSON.parse(raw);
    if (!cached || typeof cached !== 'object' || !('data' in cached) || !('ts' in cached)) return null;
    const age = Date.now() - Number(cached.ts);
    if (Array.isArray(cached.data) && Number.isFinite(age) && age >= 0 && age < TTL) return cached.data;
  } catch { /* Storage can be unavailable or contain an older, corrupted entry. */ }
  return null;
}

async function loadCounts(): Promise<Map<string, number>> {
  const cached = loadCache();
  if (cached) return aggregateCounts(cached);

  const now = Date.now();
  const response = await fetch(`/api/views/websites/${WEBSITE_ID}/metrics?startAt=0&endAt=${now}&type=url`);
  if (!response.ok) throw new Error('Unable to load view counts');
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Invalid view counts');
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: now }));
  } catch { /* Counts still work when storage is unavailable or full. */ }
  return aggregateCounts(data);
}

class BlogViewCounter extends HTMLElement {
  connectedCallback() {
    const slug = this.dataset.slug;
    if (!slug) return;
    viewCounts ??= loadCounts().catch(() => new Map());
    void viewCounts.then((counts) => {
      if (!this.isConnected || this.dataset.slug !== slug) return;
      const count = counts.get(`/posts/${slug}`) ?? 0;
      if (count > 0) this.textContent = `${count} 次阅读`;
      else this.remove();
    });
  }
}

if (!customElements.get('blog-view-counter')) customElements.define('blog-view-counter', BlogViewCounter);

export {};
