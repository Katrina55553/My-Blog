# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Astro v5 的个人博客，TypeScript + Tailwind CSS v4。Markdown 文章通过 Content Collections 管理，支持标签系统、Shiki 代码高亮、Mermaid 图表、LaTeX 公式、客户端搜索、Umami 统计。

## 常用命令

```bash
npm run dev          # 开发服务器 http://localhost:4321
npm run build        # 生产构建
npm run verify       # 导入/阅读量行为校验 + 类型检查 + 构建 + 产物校验
npm run verify:deploy # Bash 部署及回滚模拟测试（不连接服务器）
npm run preview      # 预览构建结果
npm run import       # 导入文章: npm run import "path/to/article.md"
npx astro check      # TypeScript 类型检查
```

### 验证流程

本项目无额外单元测试框架。提交前运行 `npm run verify`，包含：

1. 导入 CLI 的隔离测试与共享阅读量模块行为校验
2. `npx astro check` — TypeScript 类型检查
3. `npm run build` — 保证站点可成功构建
4. `node scripts/verify-build.cjs` — 路由、图片、字体分片、搜索首屏与资源预算

修改部署逻辑时另运行 `npm run verify:deploy`，使用真实 Bash 脚本和模拟 Docker/HTTP 命令验证成功和失败回滚。Windows 可用 `BASH_PATH` 指定 Git Bash。CI 会执行以上校验。

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
│   └── ViewCounter.astro      # 阅读量自定义元素（逻辑在 scripts/view-counter.ts）
├── scripts/                  # 共享阅读量与按页创建卡片的搜索客户端
├── layouts/
│   └── BaseLayout.astro       # 全局布局（暗色主题、响应式导航、SEO meta）
├── pages/
│   ├── index.astro            # 首页（文章卡片，6 篇/页，按日期降序）
│   ├── page/[page].astro      # 分页（getStaticPaths 自动生成）
│   ├── posts/
│   │   └── [...slug].astro    # 文章详情（LaTeX、代码复制、阅读时间、PrevNext）
│   ├── tags/
│   │   ├── index.astro        # 标签总览（计数，按频次降序）
│   │   └── [tag].astro        # 标签筛选（getStaticPaths 预生成）
│   ├── search.astro           # 首屏 6 篇 + 元数据索引搜索与按页渲染
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

`BaseLayout.astro` 导入 Noto Serif SC 的 400/600 字重分片 CSS，以 `unicode-range` 按需下载字符文件；Vite 插件移除旧 WOFF 引用，仅输出 WOFF2。构建校验限制单个中文字体分片小于 64 KiB、CSS 原始总量小于 320 KiB/gzip 后小于 112 KiB、搜索 HTML 小于 48 KiB。

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

上述 `Dockerfile` 用于本地源码构建。生产 CI 使用 `Dockerfile.runtime` 将已经验证的同一份 `dist/` 和 `nginx.conf` 打包成镜像，服务器只加载镜像。

### Nginx 路由规则

| 路径 | 缓存策略 |
|------|----------|
| `/_astro/*` | 1 年，immutable（打包哈希文件名） |
| `/sitemap*` `/robots*` `/rss*` | 1 小时，public |
| 固定的 `/api/views/websites/.../metrics` | 宿主机 nginx 限速后反代到本机只读统计代理 |
| 其他 HTML | 不缓存（内容更新即时生效） |

额外：gzip 压缩、安全头（X-Frame-Options / X-Content-Type-Options / Referrer-Policy）。

### GitHub Actions 部署流程

push main → 行为校验、类型检查、构建与产物校验 → 部署回滚模拟测试 → 将精确 dist 打包成镜像并生成 SHA-256 健康清单 → 镜像产物与完整 Git bundle 经 SCP 到服务器 → 核对 bundle/镜像提交号 → 临时端口预检 → 替换容器并验证内容 → 同步 Nginx 并验证本机 HTTPS

- 服务器路径：`~/My-Blog`，容器仅映射 `127.0.0.1:8080`
- Secrets：`SERVER_HOST`、`SERVER_USER`、`SERVER_SSH_KEY`
- 服务器部署时无需访问 GitHub、安装 npm 依赖或重新构建；部署结束清理临时传输文件
- workflow 使用 `deploy-production` concurrency 组，同组部署按顺序运行
- `scripts/deploy-release.sh` 保存旧镜像并验证关键页面及直接资源的实际内容；切换后失败会恢复旧镜像和 Nginx 配置，外层部署脚本恢复原工作区提交
- Compose 使用 `my-blog:current`，上一镜像保留为 `my-blog:previous`；服务器切换与回滚均禁止 build/pull

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
- 默认禁止覆盖已有文章，显式 `--force` 才覆盖；`--dry-run` 查看计划且不写入
- 所有图片和目标文件先预检，缺图、路径歧义或冲突时不写文章也不复制图片
