# Blog Scaffold Design (Phase 1 + 2)

**Date:** 2026-05-14
**Topic:** Astro 个人博客项目初始化 + 全局布局

## Overview

基于 Astro v5 + Tailwind CSS v4 + TypeScript 搭建博客骨架。完成项目初始化、BaseLayout 全局布局、移动端响应式导航、首页占位。

## Visual Design

- **Theme:** Dark — `slate-950` 背景，`slate-900` 卡片，`text-slate-200` 正文
- **Accent:** `cyan-400` / `cyan-300` 链接色
- **Font:** 正文衬线 `Georgia, "Noto Serif SC", serif`；代码等宽 `"JetBrains Mono", "Fira Code", monospace`
- **Layout:** `max-w-3xl` 居中单栏，两侧留白

## Project Structure

```
my-blog/
├── astro.config.mjs          # @astrojs/tailwind 集成
├── tailwind.config.mjs       # 暗色主题 + 字体配置
├── tsconfig.json
├── src/
│   ├── content/posts/        # 预留（Phase 3 使用）
│   ├── layouts/
│   │   └── BaseLayout.astro  # 全局布局
│   ├── components/           # 预留
│   ├── pages/
│   │   └── index.astro       # 首页占位
│   └── styles/
│       └── global.css        # @import "tailwindcss"
└── public/
    └── images/
```

## BaseLayout.astro

**Props:**
```ts
{ title: string; description?: string }
```

**Slots:** default（页面主体内容）

**Sections:**
1. **Header** — sticky, `bg-slate-950/80 backdrop-blur`
   - Logo/站点名链接到 `/`
   - 导航：Home `/`, Archive `/archive`, About `/about`, RSS `/rss.xml`
   - 移动端 (`< md`)：汉堡按钮 + 下拉菜单，纯 CSS `peer-checked` 实现
2. **Main** — `<slot />`，`max-w-3xl mx-auto`
3. **Footer** — `© 2026 Katrina's blog`

**SEO meta tags:** `<title>`, `<meta description>`, `<meta viewport>`

## index.astro

占位页面，使用 BaseLayout 包裹。显示欢迎语 "Hi, I'm Katrina" 和简短介绍文字。

## Implementation Steps

1. `npm create astro@latest . -- --template minimal --typescript strict`
2. `npx astro add tailwind`
3. 创建目录：`src/content/posts/`, `src/layouts/`, `src/components/`, `public/images/`
4. 配置 `tailwind.config.mjs`
5. 配置 `astro.config.mjs`（站点名 + 集成）
6. 编写 `src/styles/global.css`
7. 编写 `src/layouts/BaseLayout.astro`
8. 编写 `src/pages/index.astro`
9. `git init && git add -A && git commit -m "init: Astro blog scaffold with BaseLayout"`
