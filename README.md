# Katrina's Blog

基于 [Astro](https://astro.build) 的个人博客，使用 TypeScript + Tailwind CSS v4。

## 技术栈

- **框架**: Astro v5 (静态站点)
- **样式**: Tailwind CSS v4 + @tailwindcss/typography
- **内容**: Markdown + Content Collections
- **语法高亮**: Shiki (github-dark 主题)
- **部署**: Docker + Nginx + GitHub Actions 自动部署

## 项目结构

```
src/
├── content/posts/          # Markdown 文章
├── components/Image.astro  # 图片优化组件
├── layouts/BaseLayout.astro # 全局布局
├── pages/
│   ├── index.astro         # 首页（文章卡片列表）
│   ├── posts/[…slug].astro # 文章详情页
│   ├── tags/index.astro    # 标签总览
│   ├── tags/[tag].astro    # 标签筛选页
│   ├── rss.xml.js          # RSS 订阅
│   ├── robots.txt.ts       # robots.txt
│   └── 404.astro           # 404 页面
└── styles/global.css       # Tailwind 主题配置
```

## 本地开发

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # 生产构建
```

## 添加文章

```bash
# 从 Obsidian 导入（自动修日期格式）
npm run import "path/to/article.md"

# 提交（GitHub Actions 自动部署）
git add -A && git commit -m "new post" && git push
```

## Docker 部署

```bash
docker compose up -d --build
```

访问 `http://localhost:8080`。

## 特性

- 暗色主题，响应式设计
- 代码语法高亮（Shiki）
- 标签系统 + 标签筛选
- RSS 订阅
- SEO（Open Graph / Twitter Card / JSON-LD / Sitemap）
- 纯 CSS 移动端汉堡菜单（零 JS）
