# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Astro v5 的个人博客，TypeScript + Tailwind CSS v4。Markdown 文章通过 Content Collections 管理，支持标签系统、Shiki 代码高亮、LaTeX 公式、客户端搜索、Umami 统计。

## 常用命令

```bash
npm run dev          # 开发服务器 http://localhost:4321
npm run build        # 生产构建
npm run preview      # 预览构建结果
npm run import       # 导入文章: npm run import "path/to/article.md"
npx astro check      # TypeScript 类型检查
```

## 项目架构

```
src/
├── content/
│   ├── config.ts              # Content Collections Schema (z.coerce.date)
│   └── posts/                 # Markdown 文章
├── components/
│   ├── Image.astro            # 图片优化 (astro:assets, lazy loading)
│   ├── Pagination.astro       # 分页导航（首页 + 分页页共用）
│   ├── PrevNext.astro         # 文章底部上一篇/下一篇
│   └── Search.astro           # 客户端搜索 (fetch /search.json → 前端过滤)
├── layouts/
│   └── BaseLayout.astro       # 全局布局（暗色主题、响应式导航、SEO meta）
├── pages/
│   ├── index.astro            # 首页（文章卡片，5 篇/页，按日期降序）
│   ├── page/[page].astro      # 分页（getStaticPaths 自动生成）
│   ├── posts/
│   │   └── [...slug].astro    # 文章详情（LaTeX、代码复制、阅读时间、PrevNext）
│   ├── tags/
│   │   ├── index.astro        # 标签总览（计数，按频次降序）
│   │   └── [tag].astro        # 标签筛选（getStaticPaths 预生成）
│   ├── archive.astro          # 归档（按年份分组）
│   ├── about.astro            # 关于页
│   ├── 404.astro              # 404 页面
│   ├── robots.txt.ts          # robots.txt
│   ├── search.json.ts         # 搜索索引 API
│   └── og-image.svg.ts        # 社交分享默认封面
└── styles/
    └── global.css             # Tailwind + typography + KaTeX
astro.config.mjs               # Shiki + remark-math + rehype-katex + sitemap
```

## 文章 Frontmatter

```yaml
---
title: 文章标题
date: 2026-05-15
tags: [标签1, 标签2]
description: 文章摘要
---
```

支持 LaTeX（`$...$` / `$$...$$`）、代码块 Shiki 高亮 + 复制按钮。

## 部署

- Docker + Nginx（多阶段构建）
- GitHub Actions：push main → SSH 到服务器 → `git reset --hard` → `docker compose build --no-cache && up -d`
- 服务器路径：`~/my-blog`，暴露端口 8080
- Secrets：`SERVER_HOST`、`SERVER_USER`、`SERVER_PASSWORD`

## 工作流

- 用户提供文章路径 → `npm run import` 导入到 `src/content/posts/` → `astro build` 验证 → commit + push
- `scripts/import-post.js` 处理 Obsidian 笔记：自动生成 slug、修正日期格式、转换 `![[image]]` 并复制图片到 `public/images/`
