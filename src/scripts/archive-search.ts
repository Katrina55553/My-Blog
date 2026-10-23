import { POSTS_PER_PAGE } from '../lib/pagination';

interface SearchPost {
  title: string;
  slug: string;
  tags: string[];
  description: string;
  date: string;
}

function isSearchPost(value: unknown): value is SearchPost {
  if (!value || typeof value !== 'object') return false;
  const post = value as Record<string, unknown>;
  return typeof post.title === 'string' && typeof post.slug === 'string'
    && typeof post.description === 'string' && typeof post.date === 'string'
    && Number.isFinite(Date.parse(post.date))
    && Array.isArray(post.tags) && post.tags.every((tag) => typeof tag === 'string');
}

async function initializeSearch() {
  const input = document.getElementById('archive-search') as HTMLInputElement;
  const list = document.getElementById('archive-list')!;
  const count = document.getElementById('result-count')!;
  const empty = document.getElementById('search-empty')!;
  const pagination = document.getElementById('search-pagination')!;
  const cardTemplate = document.getElementById('search-card-template') as HTMLTemplateElement | null;

  const response = await fetch('/search.json');
  if (!response.ok) throw new Error('Unable to load search index');
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isSearchPost)) throw new Error('Invalid search index');
  const posts = data.map((post) => ({
    ...post,
    fields: [post.title, ...post.tags, post.description].map((field) => field.toLowerCase()),
    year: post.date.slice(0, 4),
  }));

  // Reuse the server-rendered group shell and shared PostCard template.
  // Cloned article metadata is assigned as text, never parsed as HTML.
  const groupTemplate = list.querySelector<HTMLElement>('[data-year]')?.cloneNode(true) as HTMLElement | undefined;
  groupTemplate?.querySelector('.grid')!.replaceChildren();
  const initialCards = new Map(Array.from(list.querySelectorAll<HTMLElement>('article[data-slug]'))
    .map((article) => [article.dataset.slug!, article]));
  let currentPage = 1;

  function createCard(post: SearchPost, number: number, index: number) {
    const card = cardTemplate!.content.firstElementChild!.cloneNode(true) as HTMLElement;
    card.dataset.slug = post.slug;
    card.style.animationDelay = `${index * 90}ms`;
    card.querySelector('[data-entry-number]')!.textContent = String(number).padStart(2, '0');
    const title = card.querySelector<HTMLAnchorElement>('[data-post-title]')!;
    title.textContent = post.title;
    title.href = `/posts/${post.slug}/`;
    card.querySelector('[data-post-description]')!.textContent = post.description;
    const time = card.querySelector('time')!;
    time.dateTime = post.date;
    time.textContent = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    });
    card.querySelector<HTMLElement>('blog-view-counter')!.dataset.slug = post.slug;
    const tags = card.querySelector<HTMLElement>('[data-post-tags]')!;
    const tagTemplate = tags.querySelector('a')!;
    tags.replaceChildren(...post.tags.map((tag) => {
      const link = tagTemplate.cloneNode(true) as HTMLAnchorElement;
      link.href = `/tags/${encodeURIComponent(tag)}/`;
      link.replaceChildren(link.firstElementChild!, document.createTextNode(tag));
      return link;
    }));
    return card;
  }

  function readLocation() {
    const params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';
    const page = Number(params.get('page') || '1');
    currentPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  }

  function updateLocation(mode: 'push' | 'replace') {
    const url = new URL(window.location.href);
    const query = input.value.trim();
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    if (currentPage > 1) url.searchParams.set('page', String(currentPage));
    else url.searchParams.delete('page');
    if (url.href !== window.location.href) {
      if (mode === 'push') history.pushState(null, '', url);
      else history.replaceState(null, '', url);
    }
  }

  function render(mode: 'push' | 'replace' = 'replace') {
    const query = input.value.trim().toLowerCase();
    const matches = query ? posts.filter((post) => post.fields.some((field) => field.includes(query))) : posts;
    const totalPages = Math.ceil(matches.length / POSTS_PER_PAGE);
    currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const pagePosts = matches.slice(start, start + POSTS_PER_PAGE);
    const yearCounts = new Map<string, number>();
    matches.forEach((post) => yearCounts.set(post.year, (yearCounts.get(post.year) ?? 0) + 1));

    const groups = new Map<string, HTMLElement>();
    const fragment = document.createDocumentFragment();
    pagePosts.forEach((post, index) => {
      let group = groups.get(post.year);
      if (!group) {
        group = groupTemplate!.cloneNode(true) as HTMLElement;
        group.dataset.year = post.year;
        group.querySelector('h2')!.textContent = post.year;
        group.querySelector('[data-year-count]')!.textContent = `${yearCounts.get(post.year)} 篇文章`;
        groups.set(post.year, group);
        fragment.append(group);
      }
      const card = initialCards.get(post.slug) ?? createCard(post, start + index + 1, index);
      card.querySelector('[data-entry-number]')!.textContent = String(start + index + 1).padStart(2, '0');
      group.querySelector('.grid')!.append(card);
    });
    list.replaceChildren(fragment);
    count.textContent = query ? `找到 ${matches.length} 篇` : '';
    empty.hidden = matches.length > 0;
    updateLocation(mode);
    pagination.dispatchEvent(new CustomEvent('pagination:update', { detail: { current: currentPage, total: totalPages } }));
  }

  await customElements.whenDefined('blog-pagination');
  input.addEventListener('input', () => {
    currentPage = 1;
    render();
  });
  pagination.addEventListener('pagination:change', (event) => {
    const page = (event as CustomEvent<{ page: number }>).detail.page;
    if (page === currentPage) return;
    currentPage = page;
    render('push');
    pagination.querySelector<HTMLAnchorElement>('a[aria-current="page"]')?.focus({ preventScroll: true });
    list.scrollIntoView({ block: 'start' });
  });
  window.addEventListener('popstate', () => {
    readLocation();
    render();
  });
  readLocation();
  render();
  input.disabled = false;
  input.setAttribute('aria-busy', 'false');
}

void initializeSearch().catch(() => {
  document.getElementById('search-load-error')!.hidden = false;
  document.getElementById('archive-search')!.setAttribute('aria-busy', 'false');
});
