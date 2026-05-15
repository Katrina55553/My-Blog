# Katrina's Blog

基于 [Astro](https://astro.build) 的个人博客，使用 TypeScript + Tailwind CSS v4。

## 技术栈

- **框架**: Astro v5 (静态站点)
- **样式**: Tailwind CSS v4 + @tailwindcss/typography
- **内容**: Markdown + Content Collections + LaTeX (KaTeX)
- **语法高亮**: Shiki (github-dark) + 代码复制按钮
- **搜索**: 客户端实时搜索（JSON 索引 + 前端过滤）
- **部署**: Docker + Nginx + GitHub Actions

## 项目结构

```
src/
├── content/posts/              # Markdown 文章
├── components/
│   ├── Image.astro             # 图片优化组件
│   └── Search.astro            # 搜索栏
├── layouts/BaseLayout.astro    # 全局布局（导航、SEO、搜索）
├── pages/
│   ├── index.astro             # 首页（文章卡片，按日期降序）
│   ├── about.astro             # 关于页
│   ├── archive.astro           # 归档（按年分组）
│   ├── posts/[…slug].astro     # 文章详情（LaTeX + 代码复制）
│   ├── tags/index.astro        # 标签总览
│   ├── tags/[tag].astro        # 标签筛选
│   ├── 404.astro               # 404 页
│   ├── robots.txt.ts           # robots.txt
│   ├── search.json.ts          # 搜索索引
│   └── sitemap (自动生成)       # @astrojs/sitemap
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
# 从 Obsidian 导入
npm run import "path/to/article.md"

# 提交 → GitHub Actions 自动部署
git add -A && git commit -m "new post" && git push
```

手动创建：在 `src/content/posts/` 下新建 `.md` 文件，frontmatter 格式：

```yaml
---
title: 文章标题
date: 2026-05-15
tags: [标签1, 标签2]
description: 文章摘要
---
```

支持 LaTeX 公式（`$...$` 行内 / `$$...$$` 块级），代码块自动高亮并带复制按钮。

## Docker 部署

```bash
docker compose up -d --build    # http://localhost:8080
```

GitHub Actions 在每次 push 到 main 时自动部署到服务器。

## 特性

- 暗色主题，响应式设计
- Shiki 代码高亮 + 一键复制
- LaTeX 数学公式（KaTeX）
- 客户端搜索（关键词 / 标签）
- 标签系统 + 归档页
- SEO（Open Graph / Twitter Card / JSON-LD / Sitemap）
- 纯 CSS 移动端汉堡菜单
