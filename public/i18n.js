/* Site UI i18n runtime — covers chrome/UI text only, not article content.
 * Loaded synchronously in <head> so inline component scripts can use it.
 * Usage in markup: data-i18n="key" (textContent), data-i18n-html="key" (innerHTML),
 *   data-i18n-title / data-i18n-aria-label / data-i18n-placeholder="key" (attributes),
 *   data-i18n-params='{"n":3}' (template params), data-i18n-date="ISO" (+ data-i18n-date-fmt="month-day").
 * Usage in JS: window.__I18N__.t('key', { n: 3 }); listen for 'langchange' on document.
 */
(function () {
  var DICT = {
    en: {
      'nav.home': 'Home',
      'nav.popular': 'Popular',
      'nav.search': 'Search',
      'nav.tags': 'Tags',
      'theme.toggle': 'Toggle dark mode',
      'lang.toggle': 'Switch to Chinese',
      'footer.tagline': 'Set in Fraunces & Newsreader · Printed on vellum',
      'index.kicker': 'Vol. I · A Personal Journal of Computing',
      'index.greeting': 'Hi, I’m <span class="italic text-vermilion">Katrina</span>.',
      'index.star': 'Star me on GitHub — top right ~',
      'index.latest': 'Latest Dispatches',
      'index.entries': '{n} entries',
      'index.entriesOne': '{n} entry',
      'popular.kicker': '§ The Most-Read',
      'popular.title': 'Popular',
      'popular.subtitle': 'Ranked by readership, the laurels of the journal.',
      'popular.loading': 'Loading the ledger…',
      'popular.totalReads': '— {n} total reads',
      'popular.reads': '{n} reads',
      'popular.noPosts': 'No posts yet.',
      'popular.failed': 'Failed to load the ledger.',
      'search.kicker': '§ The Archive',
      'search.title': 'Search',
      'search.subtitle': 'Filter the journal by title, tag, or keyword.',
      'search.placeholder': 'Search the journal…',
      'search.entries': '{n} entries',
      'search.entriesOne': '{n} entry',
      'search.found': '{n} found',
      'tags.kicker': '§ Index of Subjects',
      'tags.title': 'Tags',
      'tags.summary': '{n} subjects catalogued across {m} entries.',
      'toc.contents': 'Contents',
      'toc.toggle': 'Toggle table of contents',
      'pg.prev': 'Prev',
      'pg.next': 'Next',
      'pn.previous': 'Previous',
      'pn.next': 'Next',
      'post.kicker': 'Essay',
      'post.minRead': '{n} min read',
      'post.star': 'If this post helped you, <a href="https://github.com/Katrina55553/My-Blog" target="_blank" rel="noopener noreferrer" class="not-italic text-vermilion hover:underline transition-colors">leave a Star</a> to keep the ink flowing.',
      'copy': 'Copy',
      'copied': 'Copied!',
      'vc.views': '{n} views',
      'vc.viewsOne': '1 view',
      'page.kicker': '§ Archive',
      'page.title': 'Page <span class="italic text-vermilion">{n}</span>',
      'page.range': 'Entries {a}–{b} of {c}',
      'tag.kicker': '§ Filed Under',
      'tag.count': '{n} entries in this subject.',
      'tag.countOne': '{n} entry in this subject.',
      'nf.kicker': '§ Erratum',
      'nf.line1': 'This leaf is missing from the journal.',
      'nf.line2': 'The page you seek was never bound, or has since been removed.',
      'nf.back': 'Return to the Masthead'
    },
    zh: {
      'nav.home': '首页',
      'nav.popular': '热门',
      'nav.search': '搜索',
      'nav.tags': '标签',
      'theme.toggle': '切换暗黑模式',
      'lang.toggle': '切换到英文',
      'footer.tagline': 'Fraunces 与 Newsreader 排印 · 如印于羊皮纸',
      'index.kicker': '卷一 · 一本关于计算的个人手记',
      'index.greeting': '你好，我是 <span class="italic text-vermilion">Katrina</span>',
      'index.star': '右上角 GitHub 求 star ~',
      'index.latest': '最新文章',
      'index.entries': '{n} 篇文章',
      'popular.kicker': '§ 最多阅读',
      'popular.title': '热门',
      'popular.subtitle': '按阅读量排序，手记中的桂冠之作。',
      'popular.loading': '正在加载……',
      'popular.totalReads': '— 共 {n} 次阅读',
      'popular.reads': '{n} 次阅读',
      'popular.noPosts': '还没有文章。',
      'popular.failed': '加载失败。',
      'search.kicker': '§ 归档',
      'search.title': '搜索',
      'search.subtitle': '按标题、标签或关键词筛选文章。',
      'search.placeholder': '搜索文章……',
      'search.entries': '{n} 篇文章',
      'search.found': '找到 {n} 篇',
      'tags.kicker': '§ 主题索引',
      'tags.title': '标签',
      'tags.summary': '共 {m} 篇文章，涵盖 {n} 个主题。',
      'toc.contents': '目录',
      'toc.toggle': '切换目录',
      'pg.prev': '上一页',
      'pg.next': '下一页',
      'pn.previous': '上一篇',
      'pn.next': '下一篇',
      'post.kicker': '文章',
      'post.minRead': '约 {n} 分钟读完',
      'post.star': '如果这篇对你有帮助，<a href="https://github.com/Katrina55553/My-Blog" target="_blank" rel="noopener noreferrer" class="not-italic text-vermilion hover:underline transition-colors">点个 Star 鼓励一下</a>',
      'copy': '复制',
      'copied': '已复制！',
      'vc.views': '{n} 次阅读',
      'page.kicker': '§ 归档',
      'page.title': '第 <span class="italic text-vermilion">{n}</span> 页',
      'page.range': '第 {a}–{b} 篇，共 {c} 篇',
      'tag.kicker': '§ 归档于',
      'tag.count': '本主题共 {n} 篇。',
      'nf.kicker': '§ 勘误',
      'nf.line1': '这一页从手记中散佚了。',
      'nf.line2': '您访问的页面不存在，或已被移除。',
      'nf.back': '返回首页'
    }
  };

  var lang = 'en';
  try {
    var saved = localStorage.getItem('lang');
    if (saved === 'zh' || saved === 'en') lang = saved;
  } catch (e) { /* localStorage blocked */ }

  function dict() { return DICT[lang] || DICT.en; }

  function t(key, params) {
    var d = dict();
    var v = d[key] != null ? d[key] : DICT.en[key];
    if (v == null) return key;
    if (params) {
      if (params.n === 1 && d[key + 'One'] != null) v = d[key + 'One'];
      v = String(v).replace(/\{(\w+)\}/g, function (_, k) {
        return params[k] != null ? params[k] : '';
      });
    }
    return v;
  }

  function locale() { return lang === 'zh' ? 'zh-CN' : 'en-US'; }

  function formatDate(d, style) {
    var opts = style === 'month-day'
      ? { month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString(locale(), opts);
  }

  function parseParams(el) {
    var raw = el.getAttribute('data-i18n-params');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function apply() {
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'), parseParams(el));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'), parseParams(el));
    });
    ['title', 'aria-label', 'placeholder'].forEach(function (attr) {
      document.querySelectorAll('[data-i18n-' + attr + ']').forEach(function (el) {
        el.setAttribute(attr, t(el.getAttribute('data-i18n-' + attr), parseParams(el)));
      });
    });
    document.querySelectorAll('[data-i18n-date]').forEach(function (el) {
      var d = new Date(el.getAttribute('data-i18n-date'));
      if (!isNaN(d)) el.textContent = formatDate(d, el.getAttribute('data-i18n-date-fmt'));
    });

    // Language toggle buttons show the language you'd switch to
    var label = lang === 'en' ? 'CN' : 'EN';
    document.querySelectorAll('#lang-toggle, #lang-toggle-mobile').forEach(function (b) {
      var span = b.querySelector('span');
      if (span) span.textContent = label;
      else b.textContent = label;
    });
  }

  function setLang(l, persist) {
    if (l !== 'zh' && l !== 'en') return;
    if (l === lang) { apply(); return; }
    lang = l;
    if (persist) { try { localStorage.setItem('lang', l); } catch (e) { /* ignore */ } }
    apply();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: l } }));
  }

  window.__I18N__ = {
    t: t,
    setLang: setLang,
    getLang: function () { return lang; },
    formatDate: formatDate
  };

  document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');

  function init() {
    apply();
    document.querySelectorAll('#lang-toggle, #lang-toggle-mobile').forEach(function (b) {
      b.addEventListener('click', function () {
        setLang(lang === 'en' ? 'zh' : 'en', true);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Sync across tabs / windows
  window.addEventListener('storage', function (e) {
    if (e.key === 'lang' && (e.newValue === 'zh' || e.newValue === 'en')) {
      setLang(e.newValue, false);
    }
  });
})();
