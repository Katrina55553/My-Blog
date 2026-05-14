# Content Collections & Article System (Phase 3)

**Date:** 2026-05-14
**Topic:** Content Collections schema, article cards on homepage, article detail pages

## Overview

使用 Astro Content Collections 管理 Markdown 文章。首页展示文章卡片列表（按日期降序），文章详情页通过动态路由 `[...slug]` 渲染。

## Visual Design

- **Card style:** Spacious — 日期在顶、标题大号、完整摘要、彩色标签在底
- **Card background:** `bg-slate-900` 卡片，`border border-slate-800`
- **Tags:** `text-cyan-400` 可点击，hover 时 `text-cyan-300`
- **Detail page:** 单栏阅读，`prose` 风格排版

## Content Collections Schema

`src/content/config.ts`:
```ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    description: z.string(),
  }),
});

export const collections = { posts };
```

## Sample Posts

2 篇示例文章，存放于 `src/content/posts/`：

1. `hello-world.md` — "Hello World" 入门文章
2. `astro-blog.md` — "使用 Astro 搭建个人博客" 教程风格

每篇 frontmatter 格式：
```yaml
---
title: 文章标题
date: 2024-05-20
tags: [标签1, 标签2]
description: 文章摘要
---
```

## Homepage (index.astro)

- 使用 `getCollection("posts")` 获取所有文章
- 按 `date` 降序排列
- 每篇文章渲染为卡片：日期 → 标题 → 摘要 → 标签
- 标题链接到 `/posts/[slug]`
- 标签链接到 `/tags/[tag]`
- 保留原有欢迎语在列表上方

## Article Detail Page (posts/[...slug].astro)

- `getStaticPaths()` 从 `getCollection("posts")` 生成所有静态路径
- 显示：标题、日期、标签（可点击到 `/tags/[tag]`）
- Markdown 正文通过 `<Content />` 组件渲染
- 使用 BaseLayout 包裹

## File Changes

| Action | File |
|--------|------|
| Create | `src/content/config.ts` |
| Create | `src/content/posts/hello-world.md` |
| Create | `src/content/posts/astro-blog.md` |
| Create | `src/pages/posts/[...slug].astro` |
| Modify | `src/pages/index.astro` |
