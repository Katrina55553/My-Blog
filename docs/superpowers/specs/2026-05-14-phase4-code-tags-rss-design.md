# Code Highlighting, Tag System & RSS (Phase 4)

**Date:** 2026-05-14
**Topic:** 代码高亮（Shiki）、标签系统、RSS 订阅

## Overview

三个独立子系统：使用 Astro 内置 Shiki 实现代码高亮、创建标签总览和筛选页、通过 @astrojs/rss 生成 RSS feed。

## 1. 代码高亮（Shiki）

**方案：** Astro 内置 Shiki，零额外依赖。

**astro.config.mjs 变更：**
```js
markdown: {
  shikiConfig: {
    theme: 'github-dark',
    wrap: true,
  },
},
```

- `github-dark` 主题与博客暗色风格一致
- `wrap: true` 防止长代码行溢出
- 所有 `.md` 文章中的代码块自动高亮

## 2. 标签系统

### tags/index.astro — 标签总览
- 从 `getCollection('posts')` 获取所有文章
- 统计每个标签出现次数：`Map<string, number>`
- 渲染标签列表，格式：`#标签名 (N篇)`
- 链接到 `/tags/[tag]`
- 按文章数量降序排列

### tags/[tag].astro — 标签筛选
- `getStaticPaths()` 提取所有唯一标签，生成静态路径
- 筛选 `post.data.tags.includes(tag)` 的文章
- 按日期降序排列
- 复用首页的卡片样式（`bg-slate-900` 等）
- 标题显示 `标签: #XXX`

## 3. RSS

**安装：** `npm install @astrojs/rss`

**rss.xml.js：**
- 使用 `rss()` 函数生成 XML
- 从 `getCollection('posts')` 获取文章
- 按日期降序排列
- 包含：title、description、pubDate、link

## File Changes

| Action | File |
|--------|------|
| Modify | `astro.config.mjs` |
| Create | `src/pages/tags/index.astro` |
| Create | `src/pages/tags/[tag].astro` |
| Install | `@astrojs/rss` (npm) |
| Create | `src/pages/rss.xml.js` |
