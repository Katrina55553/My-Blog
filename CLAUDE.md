# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Astro 的个人博客，使用 TypeScript + Tailwind CSS。Markdown 文章通过 Content Collections 管理，支持标签系统、代码高亮、RSS 订阅。

## 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览构建结果
npx astro check      # TypeScript 类型检查
npx astro add <pkg>  # 添加 Astro 集成
```

## 项目架构

```
src/
├── content/
│   ├── config.ts          # Content Collections Schema 定义
│   └── posts/             # Markdown 文章（.md/.mdx）
├── layouts/
│   └── BaseLayout.astro   # 全局布局（导航栏、SEO meta、页脚）
├── components/
│   └── Image.astro        # 图片优化组件
├── pages/
│   ├── index.astro        # 首页（文章卡片列表，按日期降序）
│   ├── posts/
│   │   └── [...slug].astro  # 文章详情页（动态路由）
│   ├── tags/
│   │   ├── index.astro    # 标签总览（所有标签及文章数）
│   │   └── [tag].astro    # 标签筛选页
│   ├── rss.xml.js         # RSS feed 生成
│   ├── 404.astro          # 404 页面
│   └── robots.txt.ts      # robots.txt 生成
└── styles/
    └── global.css         # Tailwind 指令 + 全局样式
public/
└── images/                # 静态图片资源
astro.config.mjs           # Astro 配置（集成、插件）
tailwind.config.js         # Tailwind 配置（字体、主题）
```

## 关键技术依赖

- **Astro** v5+ — 静态站点框架，`.astro` 文件默认零 JS 输出
- **Tailwind CSS** v4 — 通过 `@astrojs/tailwind` 集成
- **Content Collections** — `src/content/config.ts` 定义 schema，`getCollection()` / `getEntry()` 查询
- **rehype-pretty-code** — Markdown 代码块语法高亮（行号 + 暗色主题）
- **@astrojs/rss** — RSS feed 生成
- **@astrojs/sitemap** — sitemap.xml 生成
- **fontsource** — 本地字体加载，避免外部请求

## 文章 Frontmatter 格式

```yaml
---
title: 文章标题
date: 2024-05-20
tags: [标签1, 标签2]
description: 文章摘要
---
```

## 核心模式

- 所有页面使用 `BaseLayout.astro` 包裹，传入 `title` 和 `description` props 作为页面 meta
- 文章列表按 `date` 降序排列，通过 `getCollection("posts")` 获取
- 标签页使用 `getStaticPaths()` 预生成所有静态路径
- 图片组件对 `public/images/` 下的本地图片使用 Astro 内置优化
- 移动端导航使用汉堡菜单，状态通过纯 CSS/少量 JS 控制
