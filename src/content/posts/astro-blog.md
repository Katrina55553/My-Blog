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
