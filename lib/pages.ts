/**
 * lib/pages.ts —— 第 13 项「其余页面」的版面、文案与纯函数
 *
 * 与 lib/home.ts / lib/list.ts / lib/article.ts 是同一个取舍（约定第 10 条）：
 * **这几页的文案与阈值只有这一个文件**，页面组件只负责把数据渲染出来。
 * 放在这里的四样东西：
 *   1. 归档页的月份名与「这一年的全部文章」地址；
 *   2. 标签云的字号档（`facetWeight()`）—— 篇数多的大一号，纯函数、可测；
 *   3. 各页的文案（中英各一份，缺一边 TypeScript 直接报错）；
 *   4. 少量「这一页在做什么」的说明句（例如搜索页为什么要读构建期索引）。
 *
 * 为什么这几页共用一份而不是每页一个文件：它们都是「清单 + 跳转」型页面，
 * 文案结构几乎一样（标题 / 小字 / 导语 / 空状态 / 一句说明），分成七份只会让
 * 改一句话要开七个文件。**第 13 项之后的独立页面（比如真正的关于页有正文）不放在这里**。
 *
 * 零运行时依赖：只值导入 lib/list.ts 的地址函数（那个文件对服务端模块只 `import type`，
 * 客户端也能安全引入），其余一律 `import type`。
 */

import { facetHref } from "./list";
import type { Lang } from "./site";

/* ------------------------------ 纯函数 ------------------------------ */

/**
 * 标签 / 分类云的字号档：0（最少）~ 3（最多）。
 * `max` 传当前这一页里出现次数最多的那个篇数；只有一种标签时全部落到 0 档
 * （都一样多就没有「大一号」的意义）。
 */
export function facetWeight(count: number, max: number): 0 | 1 | 2 | 3 {
  if (max <= 1 || count <= 1) return 0;
  const ratio = count / max;
  if (ratio >= 0.75) return 3;
  if (ratio >= 0.5) return 2;
  if (ratio >= 0.25) return 1;
  return 0;
}

/** 归档页里那一类文章：进列表页并**带上年份筛选**（编解码只有 lib/list.ts 一处实现） */
export function archiveYearHref(lang: Lang, year: number): string {
  return `/${lang}/posts/?year=${year}`;
}

/** 某个月的地址：列表页只按年份筛，所以月份这一档**不跳转**，只是分组标题（见归档页注释） */
export function monthName(lang: Lang, month: number): string {
  if (lang === "zh") return `${month} 月`;
  const names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return names[month - 1] ?? `${month}`;
}

/** 标签页 / 分类页的地址（本身也是 `facetHref`，这里只为页面里读起来更清楚） */
export function tagHref(lang: Lang, name: string): string {
  return facetHref(lang, "tag", name);
}

export function categoryHref(lang: Lang, name: string): string {
  return facetHref(lang, "cat", name);
}

/* ------------------------------ 文案 ------------------------------ */

/** 「清单 + 跳转」这类页面共用的文案结构（标签页 / 分类页一模一样） */
export interface FacetText {
  /** 页头那一行小字（图纸编号之后那句） */
  kicker: string;
  title: string;
  lead: string;
  /** 页头那一行：共 N 个（标签 / 分类） */
  total: (n: number) => string;
  /** 一个标签 / 分类显示成什么样（标签带 #，分类不带）—— 文案跟着选项走，别在页面里拼 */
  chipLabel: (name: string) => string;
  /** 悬停提示：这个名字在几篇里出现过 */
  chipTitle: (name: string, count: number) => string;
  note: string;
  empty: string;
  emptyHint: string;
}

export interface ArchiveText {
  kicker: string;
  title: string;
  lead: string;
  yearTotal: (n: number) => string;
  viewYear: (year: number) => string;
  note: string;
  empty: string;
  emptyHint: string;
}

export interface SimplePageText {
  kicker: string;
  title: string;
  lead: string;
}

export interface PagesText {
  tags: FacetText;
  categories: FacetText;
  archives: ArchiveText;
  search: SimplePageText & { note: string; empty: string; emptyHint: string };
  about: SimplePageText & { empty: string; emptyHint: string };
  links: SimplePageText & { empty: string; emptyHint: string; note: string };
  settings: SimplePageText;
}

const ZH: PagesText = {
  tags: {
    kicker: "站点地图",
    title: "标签",
    lead: "这里是全部标签与各自的篇数（字号大一号的表示篇数多）。点一个就跳到列表页，并且已经筛好那一项 —— 筛选状态写在地址栏里，可以直接分享。",
    total: (n) => `共 ${n} 个标签`,
    chipLabel: (name) => `#${name}`,
    chipTitle: (name, count) => `#${name}：${count} 篇`,
    note: "标签来自每篇文章 frontmatter 的 tags 字段，大小写不敏感（Tag 与 tag 算同一个）。",
    empty: "还没有标签 —— 文章里写了 tags 就会出现在这里。",
    emptyHint:
      "在 content/zh/posts/ 下的文章 frontmatter 里写 tags: [随笔, 读书]（YAML）或 tags = [\"随笔\"]（TOML），这一页与列表页的筛选栏会一起出现它。",
  },
  categories: {
    kicker: "站点地图",
    title: "分类",
    lead: "分类是比标签更粗的一档，同样是全部列出、带上篇数。点一个跳到列表页，筛选已经选好。",
    total: (n) => `共 ${n} 个分类`,
    chipLabel: (name) => name,
    chipTitle: (name, count) => `${name}：${count} 篇`,
    note: "分类来自 frontmatter 的 categories 字段（别名 cats / topics / series）；与标签是两套并行的维度，可以同时用。",
    empty: "还没有分类 —— 文章里写了 categories 就会出现在这里。",
    emptyHint:
      "在文章 frontmatter 里写 categories: [技术]（YAML）或 categories = [\"技术\"]（TOML），这一页就会出现它。",
  },
  archives: {
    kicker: "站点地图",
    title: "归档",
    lead: "按年月排开的时间线：每一行是一篇，方向与列表页一致（新的在前）。点年份那一行右边的链接，可以到列表页看这一年的全部文章。",
    yearTotal: (n) => `共 ${n} 篇`,
    viewYear: (year) => `看 ${year} 年的全部 →`,
    note: "月份只是分组，不单独筛选 —— 列表页支持到「年」这一档（要精确到月的话说一声，加一个 ?month= 就能用）。",
    empty: "还没有文章 —— 第一篇写下去，这一页就有了时间线。",
    emptyHint:
      "文章放进 content/zh/posts/（.md，带 frontmatter 的 date），这一页会自动按年月排开；月份分组与日期口径见 content/README.md。",
  },
  search: {
    kicker: "站点地图",
    title: "搜索",
    lead: "搜索用的是构建期生成的索引（每篇正文的前一段也在里面），所以断网也能搜到 —— 第一次输入时才去读那份索引，首屏不为它付代价。",
    note: "搜索与筛选可以叠加：先搜出一个范围，再用下面的标签 / 分类 / 年份收窄。地址栏记着这两样，可以直接分享结果。",
    empty: "还没有可搜的内容 —— 站点上还没有文章。",
    emptyHint: "文章放进 content/zh/posts/ 后，搜索索引会在下一次构建时把它包进去。",
  },
  about: {
    kicker: "关于",
    title: "关于",
    lead: "这一页显示标记为「关于」的那篇文章（frontmatter 里写 about: true）。",
    empty: "编辑此处：还没有「关于」页。",
    emptyHint:
      "写一篇文章，frontmatter 里加 about: true（YAML）或 about = true（TOML），它就会显示在这一页 —— 每语言取最新的一篇。写什么由你定：你是谁、这里写什么、怎么联系。",
  },
  links: {
    kicker: "站点地图",
    title: "友链",
    lead: "这里放我常读的八个站点。头像与一句话介绍取自各位自己的主页（与 wunai-Blog 的友链页是同一份名单）。",
    empty: "编辑此处：友链还没有填。",
    emptyHint:
      "打开 lib/site.ts，把 LINKS 填成 [{ name: \"某某的博客\", url: \"https://example.com\", avatar: \"https://…\", note: { zh: \"一句话\", en: \"one line\" } }]，这一页就会列出它们（avatar 与 note 都可以不写：前者回退成名称首字，后者回退显示域名）；留空则只显示这段说明。",
    note: "友情链接是双向的：加别人之前，先确认对方也链了你 —— 这句话只是提醒，代码不管这件事。",
  },
  settings: {
    kicker: "站点地图",
    title: "设置中心",
    lead: "外观、正文宽度 / 字号 / 行距、语言切换都在这里 —— 与左下角那颗齿轮打开的是同一份设置，改完立刻生效。",
  },
};

const EN: PagesText = {
  tags: {
    kicker: "Site map",
    title: "Tags",
    lead: "Every tag with its post count (bigger type means more posts). Clicking one goes to the post list with that filter already applied — the filter lives in the address bar, so you can share it.",
    total: (n) => `${n} tag${n === 1 ? "" : "s"}`,
    chipLabel: (name) => `#${name}`,
    chipTitle: (name, count) => `#${name}: ${count} post${count === 1 ? "" : "s"}`,
    note: "Tags come from the tags field in each post's frontmatter and are case-insensitive (Tag and tag are the same).",
    empty: "No tags yet — they appear here as soon as a post declares one.",
    emptyHint:
      "Add tags: [notes, reading] (YAML) or tags = [\"notes\"] (TOML) to a post in content/en/posts/ and it shows up here and in the filter bar of the list page.",
  },
  categories: {
    kicker: "Site map",
    title: "Topics",
    lead: "Topics are the coarser dimension next to tags — also listed in full, with counts. Clicking one jumps to the list page with that filter set.",
    total: (n) => `${n} topic${n === 1 ? "" : "s"}`,
    chipLabel: (name) => name,
    chipTitle: (name, count) => `${name}: ${count} post${count === 1 ? "" : "s"}`,
    note: "Topics come from the categories field (aliases: cats / topics / series); they are an independent axis and can be used together with tags.",
    empty: "No topics yet — they appear as soon as a post declares one.",
    emptyHint:
      "Add categories: [tech] (YAML) or categories = [\"tech\"] (TOML) to a post and this page will list it.",
  },
  archives: {
    kicker: "Site map",
    title: "Archive",
    lead: "A timeline by year and month: one line per post, newest first, same direction as the list page. The link on each year row opens the list page filtered to that year.",
    yearTotal: (n) => `${n} post${n === 1 ? "" : "s"}`,
    viewYear: (year) => `All of ${year} →`,
    note: "Months are only a grouping, not a filter — the list page filters down to a year (say the word and a ?month= filter can be added).",
    empty: "No posts yet — write the first one and this timeline starts.",
    emptyHint:
      "Drop a .md with a date in its frontmatter into content/en/posts/ and it lands here; the date rules are in content/README.md.",
  },
  search: {
    kicker: "Site map",
    title: "Search",
    lead: "Search runs on an index built at build time (it includes the opening of each post), so it keeps working offline — the index is only fetched on your first keystroke, and the first screen pays nothing for it.",
    note: "Search and filters stack: search to narrow the set, then use tags / topics / year below. Both live in the address bar, so results are shareable.",
    empty: "Nothing to search yet — this site has no posts.",
    emptyHint: "Posts in content/en/posts/ get picked up by the search index on the next build.",
  },
  about: {
    kicker: "About",
    title: "About",
    lead: "This page shows the post marked as “about” (about: true in its frontmatter).",
    empty: "Edit here: there is no About page yet.",
    emptyHint:
      "Write a post with about: true (YAML) or about = true (TOML) in the frontmatter and it appears here — the newest one per language. What to write is up to you: who you are, what this site is, how to reach you.",
  },
  links: {
    kicker: "Site map",
    title: "Links",
    lead: "The sites I read: eight of them, each with the avatar and one-line note taken from their own page (the same list as wunai-Blog's links page).",
    empty: "Edit here: the links are not filled in yet.",
    emptyHint:
      "Open lib/site.ts and set LINKS to [{ name: \"Someone's blog\", url: \"https://example.com\", avatar: \"https://…\", note: { zh: \"one line\", en: \"one line\" } }]; this page lists them (avatar and note are both optional — the first letter and the host name stand in). Leaving it empty keeps this note.",
    note: "Links are a two-way street: ask before adding someone, and make sure they link back — code cannot check that.",
  },
  settings: {
    kicker: "Site map",
    title: "Settings",
    lead: "Appearance, body width / size / leading and the language switch all live here — the same settings the gear in the bottom-left corner opens, applied instantly.",
  },
};

export const PAGES_TEXT: Record<Lang, PagesText> = { zh: ZH, en: EN };
