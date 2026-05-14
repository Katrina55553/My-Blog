# Code Highlighting, Tag System & RSS Implementation Plan (Phase 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Shiki code highlighting, tag overview/filter pages, and RSS feed to the blog.

**Architecture:** Three independent subsystems. Shiki is built into Astro (zero deps). Tag pages use `getCollection('posts')` for data + `getStaticPaths()` for SSG. RSS uses `@astrojs/rss` package with content collection.

**Tech Stack:** Astro built-in Shiki, `@astrojs/rss`

---

### Task 1: Configure Shiki code highlighting

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Read current astro.config.mjs and add shikiConfig**

Read the file first, then edit to add the `markdown` block:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://katrina-blog.example.com',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  integrations: [],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 2: Run astro build to verify**

```bash
npx astro build
```

Expected: Build succeeds. Code blocks in sample posts (e.g., the TypeScript/JavaScript blocks in `astro-blog.md`) now have Shiki-generated HTML with syntax highlighting.

- [ ] **Step 3: Verify syntax highlighting in output**

```bash
grep -o 'shiki' dist/posts/astro-blog/index.html | head -1
```

Expected: `shiki` class found in HTML (Shiki adds its own CSS classes).

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs
git commit -m "feat: add Shiki code highlighting with github-dark theme"
```

---

### Task 2: Create tag overview page

**Files:**
- Create: `src/pages/tags/index.astro`

- [ ] **Step 1: Create the tags directory and write the page**

```bash
mkdir -p src/pages/tags
```

Write `src/pages/tags/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

const posts = await getCollection('posts');

const tagCount = new Map<string, number>();
for (const post of posts) {
  for (const tag of post.data.tags) {
    tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
  }
}

const sortedTags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]);
---

<BaseLayout title="Tags" description="All tags on Katrina's blog">
  <section class="py-12">
    <h1 class="text-4xl font-bold text-white mb-2">Tags</h1>
    <p class="text-lg text-slate-400 mb-8">{sortedTags.length} tags in total</p>

    <div class="flex flex-wrap gap-3">
      {sortedTags.map(([tag, count]) => (
        <a
          href={`/tags/${tag}`}
          class="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3
                 hover:border-cyan-400/50 hover:bg-slate-800 transition-colors no-underline group"
        >
          <span class="text-cyan-400 group-hover:text-cyan-300 font-medium">#{tag}</span>
          <span class="text-sm text-slate-500">{count} 篇</span>
        </a>
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Build and verify**

```bash
npx astro build
```

Expected: Build succeeds, `/tags/index.html` generated.

- [ ] **Step 3: Verify tag list in output**

```bash
grep -o '#Astro\|#TypeScript\|#教程\|#随笔' dist/tags/index.html
```

Expected: All four tags found.

- [ ] **Step 4: Commit**

```bash
git add src/pages/tags/index.astro
git commit -m "feat: add tag overview page"
```

---

### Task 3: Create tag filter page

**Files:**
- Create: `src/pages/tags/[tag].astro`

- [ ] **Step 1: Write the tag filter page**

Write `src/pages/tags/[tag].astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].map((tag) => ({
    params: { tag },
  }));
}

const { tag } = Astro.params;
const posts = await getCollection('posts');
const filtered = posts
  .filter((post) => post.data.tags.includes(tag!))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---

<BaseLayout title={`标签: #${tag}`} description={`Articles tagged with ${tag}`}>
  <section class="py-12">
    <h1 class="text-4xl font-bold text-white mb-2">
      标签: <span class="text-cyan-400">#{tag}</span>
    </h1>
    <p class="text-lg text-slate-400 mb-8">{filtered.length} 篇文章</p>

    <div class="space-y-6">
      {filtered.map((post) => {
        const { title, date, tags, description } = post.data;
        const formattedDate = new Date(date).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        return (
          <article class="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors">
            <time class="text-sm text-slate-500 block mb-2">{formattedDate}</time>
            <h2 class="text-xl font-bold text-white mb-2">
              <a href={`/posts/${post.slug}`} class="text-white hover:text-cyan-400 transition-colors no-underline">
                {title}
              </a>
            </h2>
            <p class="text-slate-400 mb-3 leading-relaxed">{description}</p>
            <div class="flex flex-wrap gap-2">
              {tags.map((t: string) => (
                <a
                  href={`/tags/${t}`}
                  class={`text-sm no-underline ${t === tag ? 'text-white font-medium' : 'text-cyan-400 hover:text-cyan-300'}`}
                >
                  #{t}
                </a>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  </section>
</BaseLayout>
```

Key: the current tag is highlighted differently (`text-white font-medium`) from the others (`text-cyan-400`).

- [ ] **Step 2: Build and verify**

```bash
npx astro build
```

Expected: Build succeeds, tag pages generated (e.g., `/tags/Astro/index.html`).

- [ ] **Step 3: Verify tag filter pages**

```bash
ls dist/tags/*/index.html
grep -o '标签:.*#Astro' dist/tags/Astro/index.html
```

Expected: Tag pages exist. "标签: #Astro" found on the Astro tag page.

- [ ] **Step 4: Run astro check**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/tags/[tag].astro
git commit -m "feat: add tag filter page"
```

---

### Task 4: Add RSS feed

**Files:**
- Install: `@astrojs/rss`
- Create: `src/pages/rss.xml.js`

- [ ] **Step 1: Install @astrojs/rss**

```bash
npm install @astrojs/rss
```

- [ ] **Step 2: Create rss.xml.js**

Write `src/pages/rss.xml.js`:

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');
  const sorted = posts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  return rss({
    title: "Katrina's blog",
    description: "Katrina's personal blog",
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.slug}`,
    })),
  });
}
```

- [ ] **Step 3: Build and verify**

```bash
npx astro build
```

Expected: Build succeeds, `dist/rss.xml` generated.

- [ ] **Step 4: Verify RSS XML content**

```bash
grep -o '<title>Katrina.*</title>' dist/rss.xml
grep -c '<item>' dist/rss.xml
```

Expected: Channel title found, 2 `<item>` elements (one per post).

- [ ] **Step 5: Commit**

```bash
git add src/pages/rss.xml.js package.json package-lock.json
git commit -m "feat: add RSS feed"
```

---

### Task 5: Final verification and push

- [ ] **Step 1: Full production build**

```bash
npx astro build
```

Expected: ~7 pages built (/, /posts/×2, /tags/index, /tags/×4, /rss.xml). No errors.

- [ ] **Step 2: Verify all page types and cross-links**

```bash
echo "=== All pages ===" && find dist -name '*.html' | sort
echo "=== RSS ===" && ls dist/rss.xml
echo "=== Tag links on homepage ===" && grep -o '/tags/[^"]*' dist/index.html | sort -u
echo "=== Tag links on detail page ===" && grep -o '/tags/[^"]*' dist/posts/astro-blog/index.html | sort -u
```

- [ ] **Step 3: Push to GitHub**

```bash
git add -A
git commit -m "chore: final verification for Phase 4" --allow-empty
git push origin main
```
