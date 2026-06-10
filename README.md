# Katrina's Blog

[![GitHub](https://img.shields.io/badge/GitHub-Katrina55553/My--Blog-181717?logo=github)](https://github.com/Katrina55553/My-Blog)
[![Blog](https://img.shields.io/badge/Blog-121.43.63.231-00adb5?logo=google-chrome)](http://121.43.63.231)

基于 [Astro](https://astro.build) 的个人博客，使用 TypeScript + Tailwind CSS v4。

## 技术栈

- **框架**: Astro v5 (静态站点)
- **样式**: Tailwind CSS v4 + @tailwindcss/typography
- **内容**: Markdown + Content Collections + LaTeX (KaTeX)
- **语法高亮**: Shiki (github-dark) + 代码复制
- **图表**: Mermaid（客户端渲染）
- **搜索**: 客户端实时搜索
- **统计**: Umami Analytics (自托管)
- **部署**: Docker + Nginx + GitHub Actions

## 项目结构

```
src/
├── content/posts/              # Markdown 文章
├── components/
│   ├── Image.astro             # 图片优化
│   ├── Pagination.astro        # 分页导航
│   ├── PrevNext.astro          # 上一篇/下一篇
│   └── Search.astro            # 搜索栏
├── layouts/BaseLayout.astro    # 全局布局
├── pages/
│   ├── index.astro             # 首页（分页，5 篇/页）
│   ├── page/[page].astro       # 分页页
│   ├── posts/[…slug].astro     # 文章详情
│   ├── tags/index.astro        # 标签总览
│   ├── tags/[tag].astro        # 标签筛选
│   ├── archive.astro           # 归档
│   ├── about.astro             # 关于
│   └── 404.astro               # 404
└── styles/global.css           # Tailwind + KaTeX
```

## 本地开发

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # 生产构建
npx astro check      # TypeScript 类型检查
```

## 添加文章

```bash
# 从 Obsidian 导入（自动转换图片、修正日期）
npm run import "path/to/article.md"

# 提交 → GitHub Actions 自动部署
git add -A && git commit -m "new post" && git push
```

手动创建：在 `src/content/posts/` 下新建 `.md`，frontmatter：

```yaml
---
title: 文章标题
date: 2026-05-15
tags: [标签1, 标签2]
description: 文章摘要
---
```

支持 LaTeX 公式（`$...$` / `$$...$$`），代码块自动高亮并带复制按钮。

## Docker 部署

```bash
docker compose up -d --build    # http://localhost
```

Umami 自托管于同一 VPS（端口 3001），通过 nginx 代理 `/api/views/` 和 `/umami/`。GitHub Actions 在 push main 时自动部署。

## 特性

- 暗色主题，响应式设计
- Shiki 代码高亮 + 一键复制
- Mermaid 图表渲染
- LaTeX 数学公式（KaTeX）
- 客户端搜索
- 标签系统 + 归档 + 分页
- 阅读时间 + 上一篇/下一篇导航
- SEO（Open Graph / Twitter Card / JSON-LD / Sitemap / og:image）
- Umami 访问统计
- 纯 CSS 移动端汉堡菜单
