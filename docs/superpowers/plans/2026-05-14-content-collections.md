# Content Collections & Article System Implementation Plan (Phase 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Astro Content Collections with posts schema, sample articles, article cards on homepage, and dynamic article detail pages.

**Architecture:** Astro Content Collections (`src/content/config.ts`) defines the posts schema with zod. Homepage uses `getCollection("posts")` to list cards sorted by date. Detail pages use `getStaticPaths()` + `[...slug].astro` for dynamic routing with the `<Content />` component for Markdown rendering.

**Tech Stack:** Astro v5 Content Collections API, zod for schema validation, Markdown for content

---

### Task 1: Create Content Collections schema

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Write the schema file**

Write `src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    description: z.string(),
  }),
});

export const collections = { posts };
```

- [ ] **Step 2: Verify schema compiles**

```bash
npx astro check
```

Expected: No TypeScript errors. Astro will auto-generate types from the schema.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: add posts content collection schema"
```

---

### Task 2: Create sample posts

**Files:**
- Create: `src/content/posts/hello-world.md`
- Create: `src/content/posts/astro-blog.md`

- [ ] **Step 1: Write first sample post**

Write `src/content/posts/hello-world.md`:

```markdown
---
title: Hello World
date: 2024-05-20
tags: [随笔]
description: 这是我的第一篇博客文章，记录开始写博客的初心。
---

## 为什么开始写博客

一直想有一个属于自己的空间来记录学习和思考。与其在社交媒体上发碎片化的内容，不如静下心来写点东西。

## 这个博客的技术选型

- **框架**: Astro v5
- **样式**: Tailwind CSS v4
- **部署**: GitHub Pages

选择 Astro 是因为它默认输出零 JavaScript，非常适合内容为主的博客。

## 接下来

会陆续写一些关于前端开发、工具使用和读书笔记的文章。Stay tuned!
```

- [ ] **Step 2: Write second sample post**

Write `src/content/posts/astro-blog.md`:

```markdown
---
title: 使用 Astro 搭建个人博客
date: 2024-05-22
tags: [Astro, TypeScript, 教程]
description: 记录从零开始使用 Astro v5 + Tailwind CSS v4 搭建博客的全过程。
---

## 为什么选 Astro

Astro 是一个现代化的静态站点生成器，核心理念是 **Zero JavaScript by default**。它支持：

- Markdown 和 MDX 作为内容源
- 多种 UI 框架（React、Vue、Svelte 等）
- Content Collections 进行类型安全的内容管理
- 优秀的性能表现

## 项目初始化

```bash
npm create astro@latest
```

选择 Empty 模板和 TypeScript 支持，几分钟就能跑起来。

## 添加 Tailwind CSS

```bash
npx astro add tailwind
```

Tailwind v4 使用 CSS-first 配置方式，通过 `@theme` 指令自定义设计令牌。

## Content Collections

这是 Astro 最强大的功能之一。在 `src/content/config.ts` 中定义 schema：

```ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    description: z.string(),
  }),
});

export const collections = { posts };
```

之后就可以在任何 `.astro` 文件中通过 `getCollection('posts')` 获取类型安全的文章数据。

## 总结

Astro 的学习曲线平缓，文档清晰，很适合搭建内容驱动的个人网站。下一步计划添加标签系统和 RSS 订阅。
```

- [ ] **Step 3: Run astro build to verify content collections resolve**

```bash
npx astro build
```

Expected: Build succeeds. Astro auto-discovers the collection.

- [ ] **Step 4: Commit**

```bash
git add src/content/posts/
git commit -m "feat: add sample blog posts"
```

---

### Task 3: Create article detail page

**Files:**
- Create: `src/pages/posts/[...slug].astro`

- [ ] **Step 1: Write the detail page**

Write `src/pages/posts/[...slug].astro`:

```astro
---
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: post,
  }));
}

const { slug } = Astro.params;
const post = await getEntry('posts', slug!);

if (!post) {
  return Astro.redirect('/404');
}

const { Content } = await post.render();
const { title, date, tags, description } = post.data;

const formattedDate = new Date(date).toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<BaseLayout title={title} description={description}>
  <article class="py-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-3">{title}</h1>
      <time class="text-sm text-slate-500 block mb-3">{formattedDate}</time>
      <div class="flex flex-wrap gap-2">
        {tags.map((tag: string) => (
          <a
            href={`/tags/${tag}`}
            class="text-sm text-cyan-400 hover:text-cyan-300 no-underline"
          >
            #{tag}
          </a>
        ))}
      </div>
    </header>

    <div class="prose prose-invert prose-slate max-w-none
      prose-headings:text-white prose-headings:font-serif
      prose-p:text-slate-300 prose-p:leading-relaxed
      prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:text-cyan-300
      prose-code:text-cyan-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
      prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800
      prose-img:rounded-lg
    ">
      <Content />
    </div>
  </article>
</BaseLayout>
```

Key points:
- `getStaticPaths()` generates all static paths at build time
- `getEntry()` fetches a single entry by slug
- `post.render()` returns the `<Content />` component for rendering Markdown as HTML
- Tags link to `/tags/[tag]` (implemented in Phase 4)
- `prose` classes override Tailwind Typography defaults for dark theme

- [ ] **Step 2: Run astro build to verify pages are generated**

```bash
npx astro build
```

Expected: Build succeeds, check that `/posts/hello-world/index.html` and `/posts/astro-blog/index.html` are in `dist/`.

- [ ] **Step 3: Verify built HTML contains article content**

```bash
grep -o 'Hello World' dist/posts/hello-world/index.html
grep -o '为什么选 Astro' dist/posts/astro-blog/index.html
```

Expected: Both strings found.

- [ ] **Step 4: Commit**

```bash
git add src/pages/posts/
git commit -m "feat: add article detail page with dynamic routing"
```

---

### Task 4: Rewrite homepage with article cards

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Rewrite index.astro**

Read current `src/pages/index.astro`, then write the new version:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';

const posts = await getCollection('posts');
const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---

<BaseLayout title="Home" description="Welcome to Katrina's personal blog">
  <section class="py-12">
    <h1 class="text-4xl font-bold text-white mb-2">Hi, I'm Katrina</h1>
    <p class="text-lg text-slate-400 mb-12">
      Welcome to my blog. 写代码、读读书、记录生活。
    </p>

    <div class="space-y-6">
      {sorted.map((post) => {
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
              <a
                href={`/posts/${post.slug}`}
                class="text-white hover:text-cyan-400 transition-colors no-underline"
              >
                {title}
              </a>
            </h2>
            <p class="text-slate-400 mb-3 leading-relaxed">{description}</p>
            <div class="flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <a
                  href={`/tags/${tag}`}
                  class="text-sm text-cyan-400 hover:text-cyan-300 no-underline"
                >
                  #{tag}
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

Card design (spacious style):
- `bg-slate-900 border border-slate-800 rounded-lg p-6` — card container with hover border transition
- Date in `text-slate-500` above title
- Title as link to `/posts/[slug]` in white, hover cyan
- Description in `text-slate-400`
- Tags in `text-cyan-400` linking to `/tags/[tag]`
- Cards separated by `space-y-6`

- [ ] **Step 2: Run astro build**

```bash
npx astro build
```

Expected: Build succeeds, 3 pages generated (/, /posts/hello-world, /posts/astro-blog).

- [ ] **Step 3: Verify homepage lists both articles**

```bash
grep -c 'astro-blog' dist/index.html
grep -o 'Hello World' dist/index.html
grep -o '使用 Astro 搭建个人博客' dist/index.html
```

Expected: Both article titles found on homepage, ordered by date (newest first: astro-blog on May 22 before hello-world on May 20).

- [ ] **Step 4: Verify date ordering (astro-blog appears before hello-world)**

```bash
grep -o '2024年5月22日.*2024年5月20日' dist/index.html && echo "WRONG ORDER" || echo "ORDER OK (22nd before 20th)"
```

- [ ] **Step 5: Run astro check**

```bash
npx astro check
```

Expected: 0 errors, 0 warnings, 0 hints.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: show article cards on homepage sorted by date"
```

---

### Task 5: Final verification and push

**Files:**
- Verify: `dist/` build output

- [ ] **Step 1: Full production build**

```bash
npx astro build
```

Expected: 3 pages built, no errors.

- [ ] **Step 2: Verify all page types**

```bash
echo "=== Homepage ===" && grep -c 'article' dist/index.html && echo "articles on homepage"
echo "=== Detail page 1 ===" && grep -c 'Hello World' dist/posts/hello-world/index.html && echo "hello-world content"
echo "=== Detail page 2 ===" && grep -c '为什么选 Astro' dist/posts/astro-blog/index.html && echo "astro-blog content"
```

- [ ] **Step 3: Commit any remaining changes and push**

```bash
git add -A
git commit -m "chore: final verification for Phase 3" --allow-empty
git push origin main
```
