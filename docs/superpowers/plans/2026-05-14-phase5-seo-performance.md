# SEO & Performance Optimization Implementation Plan (Phase 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SEO meta tags, JSON-LD structured data, sitemap, robots.txt, Image component, and 404 page.

**Architecture:** BaseLayout gains OG/Twitter meta + pageType prop. Homepage and detail page add JSON-LD scripts. @astrojs/sitemap generates sitemap.xml. Image.astro wraps astro:assets for lazy-loaded optimized images.

**Tech Stack:** Astro built-in `astro:assets`, `@astrojs/sitemap`

---

### Task 1: Add OG/Twitter meta to BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Read current file and add pageType prop + OG/Twitter meta**

Read the file first. Add `pageType` prop to the Props interface. Add OG and Twitter meta tags after the existing description meta tag. Also add a canonical link.

Edit the frontmatter:

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
  pageType?: 'website' | 'article';
}

const { title, description, pageType = 'website' } = Astro.props;
const fullTitle = `${title} | Katrina's blog`;
---
```

Add these lines in `<head>`, after the existing `<meta name="description">`:

```html
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description || "Katrina's personal blog"} />
<meta property="og:type" content={pageType} />
<meta property="og:url" content={Astro.url} />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content={fullTitle} />
<link rel="canonical" href={Astro.url} />
```

NOTE: The `Astro.url` requires `site` to be set in `astro.config.mjs` (already done).

- [ ] **Step 2: Update article detail page to pass pageType**

Read `src/pages/posts/[...slug].astro`. Change the BaseLayout invocation to add `pageType="article"`:

```astro
<BaseLayout title={title} description={description} pageType="article">
```

- [ ] **Step 3: Build and verify**

```bash
npx astro build
grep -o 'og:title' dist/index.html | head -1
grep -o 'og:type.*article' dist/posts/hello-world/index.html
```

Expected: `og:title` found on homepage, `og:type` with "article" on detail page.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/posts/[...slug].astro
git commit -m "feat: add Open Graph and Twitter Card meta tags"
```

---

### Task 2: Add JSON-LD structured data

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/posts/[...slug].astro`

- [ ] **Step 1: Add JSON-LD to homepage**

Read `src/pages/index.astro`. Add a `<script type="application/ld+json">` in the BaseLayout body (after the welcome section, before the article list). Use a `<Fragment>` to wrap content:

At the top of the JSX inside BaseLayout, add:

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: "Katrina's blog",
  description: "Katrina's personal blog",
  url: Astro.url,
})} />
```

- [ ] **Step 2: Add JSON-LD to article detail page**

Read `src/pages/posts/[...slug].astro`. Add Article schema script in the `<article>` section:

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description: description,
  datePublished: new Date(date).toISOString(),
  author: {
    '@type': 'Person',
    name: 'Katrina',
  },
})} />
```

- [ ] **Step 3: Build and verify**

```bash
npx astro build
grep -o 'ld+json' dist/index.html | wc -l
grep -o 'ld+json' dist/posts/hello-world/index.html | wc -l
```

Expected: JSON-LD scripts found on both pages.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/posts/[...slug].astro
git commit -m "feat: add JSON-LD structured data"
```

---

### Task 3: Add sitemap and robots.txt

**Files:**
- Install: `@astrojs/sitemap`
- Modify: `astro.config.mjs`
- Create: `src/pages/robots.txt.ts`

- [ ] **Step 1: Install and configure sitemap**

```bash
npm install @astrojs/sitemap
```

Read `astro.config.mjs`, edit to add sitemap integration:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://katrina-blog.example.com',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 2: Create robots.txt**

Write `src/pages/robots.txt.ts`:

```ts
import type { APIRoute } from 'astro';

const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', import.meta.env.SITE || 'https://katrina-blog.example.com').href}
`.trim();

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

- [ ] **Step 3: Build and verify**

```bash
npx astro build
ls dist/sitemap-index.xml dist/robots.txt
grep -c '<url>' dist/sitemap-index.xml
```

Expected: Both files exist, sitemap contains URL entries.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs package.json package-lock.json src/pages/robots.txt.ts
git commit -m "feat: add sitemap and robots.txt"
```

---

### Task 4: Create Image component

**Files:**
- Create: `src/components/Image.astro`

- [ ] **Step 1: Write Image.astro**

```astro
---
import { Image as AstroImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

interface Props {
  src: ImageMetadata;
  alt: string;
  class?: string;
}

const { src, alt, class: className } = Astro.props;
---

<AstroImage
  {src}
  {alt}
  class={className}
  loading="lazy"
  decoding="async"
/>
```

Note: This component uses `astro:assets` which requires images to be imported in frontmatter. Usage example in a post would be:
```astro
---
import myImage from '../images/photo.jpg';
import Image from '../components/Image.astro';
---
<Image src={myImage} alt="A photo" />
```

- [ ] **Step 2: Verify astro check passes**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Image.astro
git commit -m "feat: add Image component with lazy loading"
```

---

### Task 5: Create 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Write 404.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Page Not Found" description="The page you're looking for doesn't exist">
  <section class="py-20 text-center">
    <h1 class="text-6xl font-bold text-slate-600 mb-4">404</h1>
    <p class="text-xl text-slate-400 mb-8">Page not found</p>
    <a
      href="/"
      class="inline-block bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium px-6 py-2 rounded-lg transition-colors no-underline"
    >
      Back to Home
    </a>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Build and verify 404 is generated**

```bash
npx astro build
ls dist/404.html
```

Expected: `dist/404.html` exists.

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: add 404 page"
```

---

### Task 6: Final verification and push

- [ ] **Step 1: Full production build**

```bash
npx astro build
```

Expected: ~10 pages (all existing + sitemap + robots.txt + 404).

- [ ] **Step 2: Verify all new outputs**

```bash
echo "=== Sitemap ===" && ls dist/sitemap-index.xml
echo "=== Robots ===" && cat dist/robots.txt
echo "=== 404 ===" && ls dist/404.html
echo "=== OG tags on homepage ===" && grep -c 'og:' dist/index.html
echo "=== JSON-LD on homepage ===" && grep -c 'ld+json' dist/index.html
echo "=== JSON-LD on article ===" && grep -c 'ld+json' dist/posts/hello-world/index.html
```

- [ ] **Step 3: astro check**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 4: Push**

```bash
git add -A
git commit -m "chore: final verification for Phase 5" --allow-empty
git push origin main
```
