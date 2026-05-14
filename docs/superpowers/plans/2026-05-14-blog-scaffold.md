# Blog Scaffold Implementation Plan (Phase 1 + 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize Astro blog project with Tailwind CSS, BaseLayout (dark theme, responsive nav), and placeholder homepage.

**Architecture:** Astro v5 static site with `@astrojs/tailwind` integration. BaseLayout wraps all pages providing sticky nav, SEO meta, and footer. Mobile nav uses pure CSS peer-checked hamburger toggle.

**Tech Stack:** Astro v5, Tailwind CSS v4, TypeScript (strict)

---

### Task 1: Scaffold Astro project

**Files:**
- Create: `package.json`, `tsconfig.json`, `astro.config.mjs`, `src/pages/index.astro`, `src/styles/global.css` (via CLI)

- [ ] **Step 1: Run Astro create command**

```bash
npm create astro@latest . -- --template minimal --typescript strict
```

This creates the project skeleton: `package.json`, `tsconfig.json`, `astro.config.mjs`, `src/pages/index.astro`.

- [ ] **Step 2: Verify scaffold succeeded**

```bash
ls package.json astro.config.mjs tsconfig.json src/pages/index.astro
```

Expected: All four files exist.

- [ ] **Step 3: Commit scaffold**

```bash
git init
git add -A
git commit -m "init: scaffold Astro project with TypeScript strict mode"
```

---

### Task 2: Add Tailwind CSS integration

**Files:**
- Modify: `astro.config.mjs`, `package.json`, `src/styles/global.css` (via CLI)

- [ ] **Step 1: Run astro add tailwind**

```bash
npx astro add tailwind
```

This installs `@astrojs/tailwind` and `tailwindcss`, updates `astro.config.mjs` with the integration, and writes `@import "tailwindcss"` to `src/styles/global.css`.

- [ ] **Step 2: Verify Tailwind was installed**

```bash
node -e "const p = require('./package.json'); console.log(p.dependencies.tailwindcss ? 'OK' : 'MISSING')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: add Tailwind CSS integration"
```

---

### Task 3: Create directory structure

**Files:**
- Create: `src/content/posts/` (empty dir, placeholder file), `src/layouts/` (empty dir, placeholder file), `src/components/` (empty dir, placeholder file), `public/images/` (empty dir, placeholder file)

- [ ] **Step 1: Create directories with .gitkeep**

```bash
mkdir -p src/content/posts src/layouts src/components public/images
touch src/content/posts/.gitkeep src/layouts/.gitkeep src/components/.gitkeep public/images/.gitkeep
```

- [ ] **Step 2: Verify structure**

```bash
ls -d src/content/posts src/layouts src/components public/images
```

Expected: All four directories listed.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: create project directory structure"
```

---

### Task 4: Configure Tailwind theme

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Replace global.css with Tailwind v4 config**

Write `src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  --font-serif: Georgia, "Noto Serif SC", serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
}
```

This sets the serif font stack (English + Chinese) and monospace font stack for code blocks. Dark theme colors (slate-950 background, slate-200 text, cyan-400 links) will be applied directly in components via Tailwind utility classes.

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: configure Tailwind theme with serif and mono font stacks"
```

---

### Task 5: Configure astro.config.mjs

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Read current config and add site URL**

Read `astro.config.mjs` to confirm the current content, then edit to add `site`:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://katrina-blog.example.com',
  integrations: [tailwindcss()],
});
```

Note: the `site` URL is a placeholder — update it when you have a real domain.

- [ ] **Step 2: Verify config is valid**

```bash
npx astro check --root .
```

Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "chore: set site URL in astro config"
```

---

### Task 6: Write BaseLayout.astro

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create the layout component**

Write `src/layouts/BaseLayout.astro`:

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
const fullTitle = `${title} | Katrina's blog`;
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{fullTitle}</title>
    <meta name="description" content={description || "Katrina's personal blog"} />
  </head>
  <body class="bg-slate-950 text-slate-200 font-serif min-h-screen flex flex-col">
    <header class="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <nav class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" class="text-lg font-semibold text-white hover:text-cyan-400 transition-colors no-underline">
          Katrina's blog
        </a>

        <!-- Desktop nav -->
        <div class="hidden md:flex gap-6 text-sm">
          <a href="/" class="text-slate-300 hover:text-cyan-400 transition-colors no-underline">Home</a>
          <a href="/archive" class="text-slate-300 hover:text-cyan-400 transition-colors no-underline">Archive</a>
          <a href="/about" class="text-slate-300 hover:text-cyan-400 transition-colors no-underline">About</a>
          <a href="/rss.xml" class="text-slate-300 hover:text-cyan-400 transition-colors no-underline">RSS</a>
        </div>

        <!-- Mobile hamburger -->
        <div class="md:hidden">
          <input type="checkbox" id="menu-toggle" class="peer hidden" />
          <label for="menu-toggle" class="cursor-pointer p-2 block" aria-label="Toggle menu">
            <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path class="block peer-checked:hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path class="hidden peer-checked:block" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </label>
          <div class="hidden peer-checked:block absolute top-14 right-0 left-0 bg-slate-900 border-b border-slate-800 shadow-lg">
            <a href="/" class="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 no-underline">Home</a>
            <a href="/archive" class="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 no-underline">Archive</a>
            <a href="/about" class="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 no-underline">About</a>
            <a href="/rss.xml" class="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 no-underline">RSS</a>
          </div>
        </div>
      </nav>
    </header>

    <main class="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
      <slot />
    </main>

    <footer class="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
      &copy; {new Date().getFullYear()} Katrina's blog
    </footer>
  </body>
</html>
```

Key design points:
- Dark theme: `bg-slate-950` body, `text-slate-200` body text, `slate-800` borders
- Accent color: `cyan-400` for hover states, `white` for site logo
- Sticky header with `backdrop-blur` for frosted glass effect
- Mobile hamburger: pure CSS via `peer-checked` — the hidden checkbox toggles the dropdown. The SVG shows the hamburger (3 lines) or close (X) icon via `peer-checked:hidden`/`block`
- Footer uses dynamic year via `new Date().getFullYear()`

- [ ] **Step 2: Verify layout renders with dev server**

```bash
npx astro dev &
sleep 5
curl -s http://localhost:4321 | head -20
kill %1 2>/dev/null
```

Expected: HTML output with "Katrina's blog" in the output.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add BaseLayout with dark theme and responsive nav"
```

---

### Task 7: Rewrite index.astro with BaseLayout

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace index.astro content**

Write `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Katrina's blog" description="Welcome to Katrina's personal blog">
  <section class="py-20 text-center">
    <h1 class="text-4xl font-bold text-white mb-4">Hi, I'm Katrina</h1>
    <p class="text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
      Welcome to my blog. 写代码、读读书、记录生活。
    </p>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify homepage works**

```bash
npx astro dev --host 0.0.0.0 &
sleep 5
curl -s http://localhost:4321 | grep -o "Hi, I'm Katrina"
kill %1 2>/dev/null
```

Expected: `Hi, I'm Katrina` found in the HTML.

- [ ] **Step 3: Verify TypeScript check passes**

```bash
npx astro check
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: use BaseLayout on homepage with welcome message"
```

---

### Task 8: Final verification and clean up

**Files:**
- Delete: `src/content/posts/.gitkeep`, `src/layouts/.gitkeep`, `src/components/.gitkeep`, `public/images/.gitkeep`

- [ ] **Step 1: Remove .gitkeep files (directories tracked via .gitkeep commit)**

```bash
rm src/content/posts/.gitkeep src/layouts/.gitkeep src/components/.gitkeep public/images/.gitkeep
```

- [ ] **Step 2: Run production build**

```bash
npx astro build
```

Expected: Build succeeds with no errors, output in `dist/`.

- [ ] **Step 3: Run preview server**

```bash
npx astro preview &
sleep 3
curl -s http://localhost:4321 | grep -o "Hi, I'm Katrina"
kill %1 2>/dev/null
```

Expected: `Hi, I'm Katrina` found in production HTML.

- [ ] **Step 4: Verify git log has all commits**

```bash
git log --oneline
```

Expected: ~7 commits from scaffold through layout and homepage.

- [ ] **Step 5: Final commit**

```bash
git rm --cached src/content/posts/.gitkeep src/layouts/.gitkeep src/components/.gitkeep public/images/.gitkeep
git add -A
git commit -m "chore: remove .gitkeep placeholder files"
```
