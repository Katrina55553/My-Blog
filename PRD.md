一
请帮我用 Astro 初始化一个个人博客项目。要求：
1. 使用 npm create astro@latest 命令，选择 Empty 模板、TypeScript 支持
2. 安装 Tailwind CSS，并在配置中启用它
3. 创建以下目录结构：
   - src/content/posts/ （存放 Markdown 文章）
   - src/layouts/ （存放布局组件）
   - src/components/ （存放通用组件）
   - public/images/ （存放图片）
4. 配置 astro.config.mjs，添加 @astrojs/tailwind 集成
5. 初始化 Git 仓库并做第一次提交



二
基于我已经初始化好的 Astro 项目，请帮我完成以下工作：

1. 在 src/layouts/BaseLayout.astro 创建一个全局布局，包含：
   - 顶部导航栏（首页、归档、关于、RSS 的链接）
   - 响应式设计（移动端有汉堡菜单）
   - 底部版权信息
   - 支持传入 title 和 description 作为页面元数据
   - 使用 Tailwind CSS 写样式，风格简洁、现代

2. 在 tailwind.config.js 中添加：
   - 一个适合阅读的字体配置（如系统默认衬线或无衬线字体）
   - 代码块的样式

3. 把 src/pages/index.astro 改成使用 BaseLayout，先写一个占位的欢迎语


三
我的 Astro 博客项目里，Markdown 文章存放在 src/content/posts/ 目录下。
每篇文章的 frontmatter 格式如下：
---
title: 文章标题
date: 2024-05-20
tags: [标签1, 标签2]
description: 文章摘要
---

请帮我完成：

1. 使用 Astro 的 Content Collections 功能，在 src/content/config.ts 中定义 posts 集合的 Schema
2. 修改 src/pages/index.astro，从集合中读取所有文章，按日期降序排列，渲染成文章卡片列表。每个卡片显示：标题、日期、标签、摘要
3. 创建 src/pages/posts/[...slug].astro 作为文章详情页，使用 getStaticPaths 动态生成所有页面，渲染 Markdown 内容
4. 文章详情页需要包含：标题、日期、标签（可点击跳转到标签筛选页）、正文内容



四
在我的 Astro 博客项目基础上，请帮我添加以下功能：

1. 代码高亮：
   - 安装 rehype-pretty-code 插件
   - 在 astro.config.mjs 中配置，支持行号、暗色主题
   - 文章中的代码块自动应用高亮

2. 标签系统：
   - 创建 src/pages/tags/[tag].astro，显示所有包含该标签的文章列表
   - 在首页的文章卡片和文章详情页中，标签都可以点击跳转到对应标签页
   - 创建 src/pages/tags/index.astro，显示所有标签及其文章数量

3. RSS 订阅：
   - 安装 @astrojs/rss
   - 在 src/pages/rss.xml.js 中生成 RSS feed，包含所有文章




五
请为我的 Astro 博客项目做以下 SEO 和性能优化：

1. SEO：
   - 在 BaseLayout 中添加完整的 meta 标签（Open Graph、Twitter Card）
   - 在首页添加网站 JSON-LD 结构化数据
   - 在文章详情页添加文章结构化数据
   - 生成 sitemap.xml（使用 @astrojs/sitemap）
   - 生成 robots.txt

2. 性能：
   - 图片组件：创建一个 Image.astro 组件，对本地图片进行优化
   - 字体优化：使用 fontsource 加载字体，避免外部请求

3. 添加 404 页面（src/pages/404.astro）




六部署
- 需要检查哪些页面和功能
- 如何在 Google Search Console 和百度站长平台提交网站
