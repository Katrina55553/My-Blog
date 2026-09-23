# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Astro v5 的个人博客，TypeScript + Tailwind CSS v4。Markdown 文章通过 Content Collections 管理，支持标签系统、Shiki 代码高亮、Mermaid 图表、LaTeX 公式、客户端搜索、Umami 统计。

## 常用命令

```bash
npm run dev          # 开发服务器 http://localhost:4321
npm run build        # 生产构建
npm run preview      # 预览构建结果
npm run import       # 导入文章: npm run import "path/to/article.md"
npx astro check      # TypeScript 类型检查
```

### 验证流程

本项目无单元测试框架。验证依赖两步：

1. `npx astro check` — TypeScript 类型检查
2. `npm run build` — 保证站点可成功构建

## 技术栈要点

### Tailwind CSS v4（非标准方式)

Tailwind v4 通过 Vite 插件而非 PostCSS 接入：

- `astro.config.mjs` → `vite.plugins: [tailwindcss()]`
- CSS 使用 `@import "tailwindcss"` + `@plugin "@tailwindcss/typography"`
- 自定义主题通过 `@theme {}` 块（非 `tailwind.config.js`）

### Markdown 增强功能

- **Shiki**：代码高亮，主题 `github-dark`，`wrap: true`
- **remark-math** + **rehype-katex**：LaTeX 公式（`$...$` 内联 / `$$...$$` 块级）
- **rehype-slug**：自动为标题添加 `id` 锚点，用于目录跳转
- **Mermaid**：自定义 rehype 插件将 ` ```mermaid ` 代码块转换为 `<pre class="mermaid">`，客户端按需加载本地锁定版本并随明暗主题重绘

### Content Collections Schema（`src/content/config.ts`）

```ts
schema: z.object({
  title: z.string(),           // 必填
  date: z.coerce.date(),      // 必填，支持多种日期字符串格式
  tags: z.array(z.string()).default([]),  // 可选，默认空数组
  description: z.string(),    // 必填
})
```

`z.coerce.date` 会尝试将字符串强转为 Date，因此 `2026-5-14` 和 `2026-05-14` 均有效。

## 项目架构

```
src/
├── content/
│   ├── config.ts              # Content Collections Schema
│   └── posts/                 # Markdown 文章（*.md）
├── components/
│   ├── Pagination.astro       # 分页导航（首页 + 分页页共用）
│   ├── PrevNext.astro         # 文章底部上一篇/下一篇
│   ├── TableOfContents.astro  # 文章目录
│   └── ViewCounter.astro      # 阅读量（兼容历史有/无尾斜杠 URL）
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
│   ├── search.astro           # 归档 + 客户端搜索
│   ├── popular.astro          # 阅读量排行
│   ├── 404.astro              # 404 页面
│   ├── robots.txt.ts          # robots.txt
│   ├── search.json.ts         # 搜索索引 API
│   └── og-image.png.ts        # 构建期生成社交分享 PNG
├── assets/images/             # Markdown 本地图片（Astro 优化、尺寸、srcset）
└── styles/
    └── global.css             # Tailwind v4 + typography + KaTeX + Mermaid
astro.config.mjs               # Shiki + remark-math + rehype-katex-slug + Mermaid 插件
```

### 关键样式文件

`src/styles/global.css` 承担了所有自定义样式，包括：
- 代码块 macOS 风格顶部圆点装饰（`::before` 伪元素）
- 代码块渐变背景 + 自定义滚动条
- Mermaid 代码块样式
- 内联代码样式（蓝色高亮）
- 字体栈：衬线 `Georgia, "Noto Serif SC", serif`；等宽 `"JetBrains Mono", "Fira Code", "Cascadia Code", monospace`

## 文章 Frontmatter

```yaml
---
title: 文章标题
date: 2026-05-15
tags: [标签1, 标签2]
description: 文章摘要
---
```

## 部署

### Docker 多阶段构建

- **阶段 1**：`node:22-alpine` → `npm ci` → `npm run build`，产出 `/app/dist`
- **阶段 2**：`nginx:alpine` → 复制 `dist` 与静态 `nginx.conf`

### Nginx 路由规则

| 路径 | 缓存策略 |
|------|----------|
| `/_astro/*` | 1 年，immutable（打包哈希文件名） |
| `/sitemap*` `/robots*` `/rss*` | 1 小时，public |
| 固定的 `/api/views/websites/.../metrics` | 宿主机 nginx 限速后反代到本机只读统计代理 |
| 其他 HTML | 不缓存（内容更新即时生效） |

额外：gzip 压缩、安全头（X-Frame-Options / X-Content-Type-Options / Referrer-Policy）。

### GitHub Actions 部署流程

push main → 校验与构建 → SSH 到服务器 → `git reset --hard origin/main` → 保留旧容器完成 `docker compose build --no-cache` → `up -d` 替换

- 服务器路径：`~/My-Blog`，容器仅映射 `127.0.0.1:8080`
- Secrets：`SERVER_HOST`、`SERVER_USER`、`SERVER_SSH_KEY`
- workflow 使用 `deploy-production` concurrency 组，连续推送会取消旧部署

## 工作流

### 导入文章步骤

1. 运行 `npm run import "<Obsidian笔记路径>"`
2. 检查导入结果：为文章添加 frontmatter（title / date / tags / description），将 slug 中的中文替换为英文
3. 运行 `npx astro check && npm run build` 验证
4. **等待用户确认**（用户需检查 tag 和时间是否正确）
5. 用户确认后，再 commit + push
6. commit 时使用 `<<'EOF'` heredoc 语法，**不要**使用 `@'...'@`（后者会让 `@` 成为 commit message 的一部分）

`scripts/import-post.cjs` 自动处理 Obsidian 笔记：
- 从文件名自动生成 slug
- 修正日期格式：`2026-5-14` → `2026-05-14`
- 转换 `![[image.png]]` 为 `src/assets/images/` 相对引用；文件名包含内容哈希，避免不同目录的同名图片互相覆盖
