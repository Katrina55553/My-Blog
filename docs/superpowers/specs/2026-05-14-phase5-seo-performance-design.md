# SEO & Performance Optimization (Phase 5)

**Date:** 2026-05-14
**Topic:** SEO meta tags, structured data, sitemap, robots.txt, image component, 404 page

## Overview

为博客添加完整的 SEO 元数据、结构化数据、sitemap/robots.txt、图片优化组件和 404 页面。字体优化跳过（系统字体已满足需求）。

## 1. SEO Meta Tags (BaseLayout)

新增 Props:
```ts
interface Props {
  title: string;
  description?: string;
  pageType?: 'website' | 'article';
}
```

新增 `<head>` 子元素：
- `og:title`, `og:description`, `og:type`, `og:url`
- `twitter:card`, `twitter:title`

## 2. JSON-LD Structured Data

- **首页 (index.astro):** `WebSite` + `Person` schema
- **文章详情页 ([...slug].astro):** `Article` schema（含 headline, datePublished, author）
- 通过 `<script type="application/ld+json">` 内联

## 3. Sitemap + Robots.txt

- 安装 `@astrojs/sitemap`，集成到 `astro.config.mjs`
- 创建 `src/pages/robots.txt.ts`，允许所有 crawler，指向 sitemap

## 4. Image Component

`src/components/Image.astro` — 使用 Astro 内置 `astro:assets` Image：
- 自动优化（WebP 转换、压缩）
- `loading="lazy"` + `decoding="async"`
- Props: `src: ImageMetadata; alt: string; class?: string`

## 5. 404 Page

`src/pages/404.astro` — 友好的 "Page Not Found" 消息 + 返回首页链接。

## File Changes

| Action | File |
|--------|------|
| Modify | `src/layouts/BaseLayout.astro` |
| Modify | `src/pages/index.astro` |
| Modify | `src/pages/posts/[...slug].astro` |
| Install | `@astrojs/sitemap` |
| Modify | `astro.config.mjs` |
| Create | `src/pages/robots.txt.ts` |
| Create | `src/components/Image.astro` |
| Create | `src/pages/404.astro` |
