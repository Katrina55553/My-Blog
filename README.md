# Katrina's Blog

[![GitHub](https://img.shields.io/badge/GitHub-Katrina55553/My--Blog-181717?logo=github)](https://github.com/Katrina55553/My-Blog)
[![Blog](https://img.shields.io/badge/Blog-blog.cogod.cn-00adb5?logo=google-chrome)](https://blog.cogod.cn)

基于 [Astro](https://astro.build) 的个人博客，记录技术笔记与算法题解。使用 TypeScript + Tailwind CSS v4，Markdown 文章在构建时生成静态页面，通过 Docker + Nginx 部署。

## 特性

- **Ink & Vellum / Ink & Midnight 双主题**：暖羊皮纸亮色与暖午夜暗色，支持系统偏好、本地持久化和跨标签页同步。
- **阅读排版**：自托管 Fraunces、Newsreader、Noto Serif SC 等字体，搭配朱砂红点缀与细线分隔；列表在桌面端使用双栏布局。
- **内容导航**：文章按日期降序排列，首页每页 6 篇；支持标签总览、标签筛选和按年份归档的搜索页。
- **客户端搜索**：实时匹配标题、标签和摘要，搜索结果分页，关键词与页码保存在 URL 中。
- **Markdown 增强**：Shiki 代码高亮与一键复制、KaTeX 数学公式、按需加载并随主题切换重绘的 Mermaid 图表。
- **文章阅读**：可折叠目录侧栏与滚动高亮、预计阅读时间、上一篇/下一篇导航。
- **图片优化**：Markdown 本地图片由 Astro 生成优化资源、响应式 `srcset` 和尺寸信息。
- **统计与分享**：Umami 阅读量统计（30 分钟本地缓存）、构建时获取 GitHub Star/Fork 数量、Open Graph / Twitter Card / JSON-LD / Sitemap / 社交分享 PNG。
- **移动端适配**：响应式排版、纯 CSS 汉堡菜单与主题切换。

## 技术栈

![Astro 5.18.1](https://img.shields.io/badge/Astro-5.18.1-BC52EE?style=flat)
![TypeScript 5.9.3](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat)
![Tailwind CSS 4.3.0](https://img.shields.io/badge/Tailwind_CSS-4.3.0-06B6D4?style=flat)
![@tailwindcss/typography 0.5.19](https://img.shields.io/badge/Typography-0.5.19-06B6D4?style=flat)

![Markdown](https://img.shields.io/badge/Markdown-%E2%9C%93-000000?style=flat)
![Astro Content Collections](https://img.shields.io/badge/Content_Collections-%E2%9C%93-BC52EE?style=flat)
![Shiki 3.23.0](https://img.shields.io/badge/Shiki-3.23.0-24292E?style=flat)
![KaTeX 0.16.46](https://img.shields.io/badge/KaTeX-0.16.46-008080?style=flat)
![Mermaid 11.12.0](https://img.shields.io/badge/Mermaid-11.12.0-FF3670?style=flat)
![Sharp 0.35.3](https://img.shields.io/badge/Sharp-0.35.3-99CC00?style=flat)
![Umami Analytics 自托管](https://img.shields.io/badge/Umami-self--hosted-000000?style=flat)

![Docker](https://img.shields.io/badge/Docker-%E2%9C%93-2496ED?style=flat)
![Nginx](https://img.shields.io/badge/Nginx-%E2%9C%93-009639?style=flat)
![GitHub Actions CI/CD](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=flat)

## 项目结构

```text
.
├── .github/workflows/deploy.yml # main 分支校验与自动部署
├── scripts/
│   ├── import-post.cjs          # 导入 Obsidian 文章与图片
│   ├── compress-images.cjs      # PNG 图片压缩工具
│   └── verify-build.cjs         # 构建产物校验
├── astro.config.mjs            # 站点地址、Markdown 插件与图片配置
├── Dockerfile                  # Node.js 构建 → Nginx 静态服务
├── docker-compose.yml          # 容器编排（127.0.0.1:8080）
├── nginx.conf                  # 容器内路由、缓存与 gzip
├── host-nginx.conf             # 宿主机 HTTPS 与统计服务反向代理
└── src/
    ├── assets/images/          # Markdown 本地图片
    ├── content/
    │   ├── config.ts           # 文章 frontmatter 校验规则
    │   └── posts/              # Markdown 文章
    ├── components/
    │   ├── Pagination.astro    # 静态页面与搜索结果分页
    │   ├── PrevNext.astro      # 上一篇/下一篇
    │   ├── TableOfContents.astro # 可折叠文章目录与滚动高亮
    │   └── ViewCounter.astro   # 阅读量统计与缓存
    ├── layouts/BaseLayout.astro # 全局布局、导航、主题与 SEO
    ├── lib/
    │   ├── github.ts           # 构建时获取仓库统计，失败时使用默认值
    │   └── pagination.ts       # 每页篇数与分页规则
    ├── pages/
    │   ├── index.astro         # 首页
    │   ├── page/[page].astro   # 静态分页页
    │   ├── posts/[...slug].astro # 文章详情
    │   ├── tags/index.astro    # 标签总览
    │   ├── tags/[tag].astro    # 标签筛选
    │   ├── search.astro        # 按年份归档、实时搜索与分页
    │   ├── search.json.ts      # 构建时生成的文章元数据 JSON
    │   ├── robots.txt.ts       # 爬虫规则
    │   ├── og-image.png.ts     # 构建时生成社交分享图片
    │   └── 404.astro           # 自定义 404 页面
    └── styles/global.css      # 双主题令牌、字体与全局样式
```

## 本地开发

使用 Node.js 22（与 Docker 和 GitHub Actions 一致）及 npm，在项目根目录运行：

```bash
npm ci
npm run dev
```

开发地址：`http://localhost:4321`。

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npx astro check` | 检查 Astro / TypeScript 诊断与内容 schema |
| `npm run build` | 构建静态站点到 `dist/` |
| `npm run preview` | 本地预览已生成的 `dist/` |
| `npm run verify` | 类型检查、生产构建与构建产物校验 |
| `npm run import -- "path/to/article.md"` | 导入 Obsidian Markdown 文章 |

提交前运行 `npm run verify`，会检查生成路由、404 页面、社交分享图片、图片优化、字体资源与 CSS 体积等。

## 添加文章

### 手动创建

在 `src/content/posts/` 下新建 `.md` 文件，建议使用英文小写加连字符的文件名，例如 `my-new-post.md`，对应文章地址 `/posts/my-new-post/`。

文章开头填写 frontmatter：

```yaml
---
title: 文章标题
date: 2026-05-15
tags: [标签1, 标签2]
description: 文章摘要
---
```

`title`、`date`、`description` 必填；`tags` 可省略，默认为空数组。正文支持标准 Markdown、行内公式 `$...$`、块级公式 `$$...$$` 和 `mermaid` 代码块；代码块标注语言后会自动高亮并显示复制按钮。

本地图片放在 `src/assets/images/`，在文章中使用相对路径引用：

```markdown
![图片说明](../../assets/images/example.png)
```

### 从 Obsidian 导入

```bash
npm run import -- "path/to/article.md"
```

导入脚本会根据文件名生成 slug、补齐日期中的月日位数，并将 `![[image.png]]` 或 `![[subdir/image.png]]` 图片嵌入转换为 Markdown 引用。图片复制到 `src/assets/images/`，文件名带内容哈希以避免同名覆盖。

导入后检查或补齐 frontmatter，确认日期、标签与图片引用，并按需将文章文件名改为英文 slug。导入同名文章会覆盖已有文件。运行 `npm run verify` 并在本地预览确认后，再提交并推送到 `main` 分支触发部署。

## Docker 部署

```bash
docker compose up -d --build
```

访问 `http://127.0.0.1:8080`。镜像使用 `node:22-alpine` 构建，随后由 `nginx:alpine` 提供 `dist/` 静态文件；容器端口仅绑定宿主机回环地址。

线上通过 `host-nginx.conf` 配置宿主机 Nginx：

- HTTP 跳转 HTTPS，静态页面反向代理到 `127.0.0.1:8080`。
- `/umami/` 代理到 `127.0.0.1:3001` 的 Umami 服务。
- 固定的 `/api/views/websites/<website-id>/metrics` 只读查询代理到 `127.0.0.1:3002` 的统计代理，并限制请求频率。

Umami、统计代理与 HTTPS 证书需在宿主机另行配置。直接运行博客容器时，阅读量与访问统计依赖上述服务。

### GitHub Actions 自动部署

推送到 `main` 后，`.github/workflows/deploy.yml` 会先安装依赖，执行类型检查、构建和产物校验，通过后再 SSH 到服务器部署。

仓库需配置以下 Actions Secrets：

| Secret | 说明 |
| --- | --- |
| `SERVER_HOST` | 服务器地址 |
| `SERVER_USER` | SSH 登录用户 |
| `SERVER_SSH_KEY` | SSH 私钥 |

服务器需提前将仓库克隆到 `~/My-Blog`，安装 Docker Compose 和 Nginx，准备好域名、证书及统计服务。部署用户需具备 Docker 权限及安装 Nginx 配置、校验和重载服务所需的免密 sudo 权限。

部署时同步 `origin/main`，在旧容器继续服务期间构建新镜像，构建成功后替换容器；随后同步 `host-nginx.conf`，校验通过后重载宿主机 Nginx。同一部署组按顺序运行。

## 配置与定制

| 配置 | 文件 |
| --- | --- |
| 站点域名、尾斜杠、Markdown 与图片处理 | `astro.config.mjs` |
| 品牌、导航、SEO、Umami 脚本与备案信息 | `src/layouts/BaseLayout.astro` |
| 首页文案与文章页作者信息 | `src/pages/index.astro`、`src/pages/posts/[...slug].astro` |
| 字体、配色与双主题样式 | `src/styles/global.css` |
| 每页文章数（当前为 6） | `src/lib/pagination.ts` |
| GitHub 仓库统计地址与默认值 | `src/lib/github.ts` |
| 阅读量 website ID | `src/components/ViewCounter.astro` |
| 社交分享图片内容 | `src/pages/og-image.png.ts` |
| 域名、证书、统计代理地址与 website ID | `host-nginx.conf` |

迁移站点时同步更新域名、GitHub 链接、Umami website ID 和备案信息。GitHub Star/Fork 数量在构建时获取，接口不可用时使用默认值，重新构建后更新展示。
