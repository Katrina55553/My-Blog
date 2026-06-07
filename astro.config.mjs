// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';

// https://astro.build/config
export default defineConfig({
  site: 'http://121.43.63.231',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      // 将 Shiki 处理后的 mermaid 代码块替换为 <pre class="mermaid">
      () => (tree) => {
        (function walk(node) {
          if (!node.children) return;
          for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (child.type === 'element' && child.tagName === 'pre') {
              const props = child.properties || {};
              const lang = props.dataLanguage || props['data-language'] || '';
              if (lang === 'mermaid') {
                const text = (function getText(n) {
                  if (n.type === 'text') return n.value;
                  if (n.children) return n.children.map(getText).join('');
                  return '';
                })(child);
                node.children[i] = {
                  type: 'element',
                  tagName: 'pre',
                  properties: { className: ['mermaid'] },
                  children: [{ type: 'text', value: text }],
                };
              }
            }
            walk(node.children[i]);
          }
        })(tree);
      },
    ],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
