// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';

/** @type {import('vite').Plugin} */
const katexWoff2Only = {
  name: 'katex-woff2-only',
  enforce: 'pre',
  transform(code, id) {
    if (!id.replaceAll('\\', '/').includes('/katex/dist/katex.min.css')) return null;
    return code.replace(
      /,url\(fonts\/[^)]+\.woff\) format\("woff"\),url\(fonts\/[^)]+\.ttf\) format\("truetype"\)/g,
      '',
    );
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.cogod.cn',
  trailingSlash: 'always',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      // 将 Shiki 处理后的 mermaid 代码块替换为 <pre class="mermaid">
      () => (tree) => {
        /**
         * @param {import('hast').Element | import('hast').Root} node
         */
        function walk(node) {
          if (!('children' in node)) return;
          for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (child.type === 'element' && child.tagName === 'pre') {
              const props = child.properties || {};
              const lang = props.dataLanguage || props['data-language'] || '';
              if (lang === 'mermaid') {
                /** @type {(n: import('hast').Element | import('hast').Text) => string} */
                const getText = (n) => {
                  if (n.type === 'text') return n.value;
                  if ('children' in n) return n.children.map(c => getText(/** @type {import('hast').Element | import('hast').Text} */ (c))).join('');
                  return '';
                };
                const text = getText(child);
                node.children[i] = {
                  type: 'element',
                  tagName: 'pre',
                  properties: { className: ['mermaid'] },
                  children: [{ type: 'text', value: text }],
                };
              }
            }
            if ('children' in node.children[i]) {
              walk(/** @type {import('hast').Element} */ (node.children[i]));
            }
          }
        }
        walk(/** @type {import('hast').Root} */ (tree));
      },
    ],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  vite: {
    plugins: [katexWoff2Only, tailwindcss()],
  },
});
