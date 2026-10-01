/**
 * lib/list.ts —— 列表页的版面、筛选与文案（第 10 项）+ 文章卡片的三档密度（第 11 项）
 *
 * 与 lib/home.ts 是同一个取舍：**这一页的事实来源只有这一个文件**。
 * 放在这里的四样东西：
 *   1. 筛选状态（`ListFilters`）与默认值：搜索词 / 标签 / 分类 / 时间 / AI / 排序 / 密度；
 *   2. 选项表：三档密度、两种排序、时间（年份由数据推出来）—— 中英文案跟着选项走，
 *      与 lib/theme.ts 的 `THEME_LABELS`、lib/prefs.ts 的 `READING_*` 一致；
 *   3. 纯函数：过滤 / 排序 / 生效筛选计数 / URL 查询串的读写 / 密度的本机记忆；
 *   4. 文案（中英各一份，缺一边 TypeScript 直接报错）。
 *
 * **为什么类型上引了 lib/content.ts 与 lib/search-index.ts，却还能被客户端组件 import**：
 * 这两处都只用 `import type` —— 编译后整条 import 被擦掉，运行时不会把它们（以及背后的
 * node:fs）拉进浏览器包。**别改成值导入**（`import { … } from "./content"`），那样客户端会报错。
 * 需要索引结构版本号的地方，由服务端页面当普通 props 传下来（见 app/[lang]/posts/page.tsx）。
 *
 * 零运行时依赖：fuse.js 只在列表页里按需动态 import（components/list/PostList.tsx）。
 */

import type { CardGroupMeta, PostMeta } from "./content";
import type { SearchDoc } from "./search-index";
import type { Lang } from "./site";

/* ------------------------------ 数据结构 ------------------------------ */

/**
 * 列表页 / 卡片用的一篇文章。
 * 是 PostMeta 与 SearchDoc 的**公共投影**：两种来路都归到这里，
 * 于是卡片组件只认一种形状（搜索命中与直接渲染走同一条路）。
 */
export interface ListPost {
  slug: string;
  /** 站内路径，形如 /zh/posts/hello/ */
  href: string;
  lang: Lang;
  title: string;
  /** ISO 8601 */
  date: string;
  updated: string | null;
  description: string;
  excerpt: string;
  tags: string[];
  categories: string[];
  /** 所属卡组目录（"" 表示顶层） */
  group: string;
  pinned: boolean;
  isAI: boolean;
  /** 草稿：生产构建里不会出现；dev 下带上标记，方便一眼看出「这篇还没发布」 */
  draft: boolean;
  words: number;
  readingMinutes: number;
}

/** 直接来自内容管线的一篇（服务端页面用） */
export function toListPost(meta: PostMeta): ListPost {
  return {
    slug: meta.slug,
    href: meta.href,
    lang: meta.lang,
    title: meta.title,
    date: meta.date,
    updated: meta.updated,
    description: meta.description,
    excerpt: meta.excerpt,
    tags: meta.tags,
    categories: meta.categories,
    group: meta.group,
    pinned: meta.pinned,
    isAI: meta.isAI,
    draft: meta.draft,
    words: meta.wordCount,
    readingMinutes: meta.readingMinutes,
  };
}

/**
 * 搜索命中的一篇。索引里没有 `draft` 字段（生产构建本来就不含草稿），
 * 所以这里恒为 false —— dev 下搜索命中的草稿不带标记，是已知的小差异。
 */
export function fromSearchDoc(doc: SearchDoc): ListPost {
  return {
    slug: doc.slug,
    href: doc.href,
    lang: doc.lang,
    title: doc.title,
    date: doc.date,
    updated: doc.updated,
    description: doc.description,
    excerpt: doc.excerpt,
    tags: doc.tags,
    categories: doc.categories,
    group: doc.group,
    pinned: doc.pinned,
    isAI: doc.isAI,
    draft: false,
    words: doc.words,
    readingMinutes: doc.readingMinutes,
  };
}

/* ------------------------------ 卡组 ------------------------------ */

/**
 * 列表页要用的卡组（`content/README.md` 第 5 节）。
 *
 * 这是 `lib/content.ts` 的 `CardGroupMeta` 的**投影**：那边带着整组文章、封面与文件路径，
 * 客户端组件只要「有哪些组、叫什么、什么顺序」。投影放在这里，页面上一行 `toListGroup()`
 * 就够 —— 与 `toListPost` 同一个做法（两个语言的页面不各写一遍）。
 */
export interface ListGroup {
  /** 目录相对路径；"" 表示 posts 顶层（顶层不算卡组，见 groupPosts） */
  slug: string;
  /** `_index.md` 的 title；空串 = 没写，UI 用目录名兜底（见 groupTitle） */
  title: string;
  description: string;
  /** 是否由 `_index.md` 显式定义 */
  explicit: boolean;
  /** 排序权重，小的在前 */
  order: number;
}

/** `CardGroupMeta` → `ListGroup`（只挑列表页要用的字段） */
export function toListGroup(group: CardGroupMeta): ListGroup {
  return {
    slug: group.slug,
    title: group.title,
    description: group.description,
    explicit: group.explicit,
    order: group.order,
  };
}

/** 卡组名：`_index.md` 没写 title 时用目录名兜底（规范如此，别在页面里各写一份） */
export function groupTitle(group: ListGroup): string {
  if (group.title.trim() !== "") return group.title;
  return group.slug.split("/").pop() ?? group.slug;
}

export interface GroupedPosts {
  /** 没放进任何目录（或不在已知卡组里）的文章 */
  ungrouped: ListPost[];
  /** 卡组与组内的文章；只包含「筛完之后还有文章」的组 */
  groups: { group: ListGroup; posts: ListPost[] }[];
}

/**
 * 把一列（已经筛过、排过的）文章按卡组切开 —— 列表页显示的「卡组」就靠这一个函数。
 *
 * 三个决定：
 *   1. 顺序沿用 `lib/content.ts` 的 `sortGroups`（`order` 小的在前，再按 slug），
 *      组内保持传进来的顺序（也就是当前排序的结果）；
 *   2. **顶层（slug ""）永远算「未分组」**：它是「没放进任何目录的文章」，不是一个卡组，
 *      给它一个「卡组」的组头是错的；组里只有一篇文章也照样按组显示 ——
 *      卡组是作者的目录结构，不是「文章多到一定程度才出现」的东西；
 *   3. 一篇文章的目录不在 `groups` 里（例如传进来的卡组列表被过滤过）时，退回「未分组」——
 *      宁可多显示一篇文章，也不要因为数据不同步把它弄丢。
 */
export function groupPosts(posts: ListPost[], groups: ListGroup[]): GroupedPosts {
  const known = groups
    .filter((group) => group.slug !== "")
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  const knownSlugs = new Set(known.map((group) => group.slug));

  const buckets = new Map<string, ListPost[]>();
  const ungrouped: ListPost[] = [];
  for (const post of posts) {
    if (post.group === "" || !knownSlugs.has(post.group)) {
      ungrouped.push(post);
      continue;
    }
    const bucket = buckets.get(post.group);
    if (bucket) bucket.push(post);
    else buckets.set(post.group, [post]);
  }

  return {
    ungrouped,
    groups: known
      .map((group) => ({ group, posts: buckets.get(group.slug) ?? [] }))
      .filter((entry) => entry.posts.length > 0),
  };
}

/* ------------------------------ 选项表 ------------------------------ */

/** 卡片密度三档（第 11 项）。id 存进 localStorage，改排版不动它 */
export type Density = "compact" | "cozy" | "full";

export interface DensityOption {
  id: Density;
  zh: string;
  en: string;
  /** 一句话说明这一档显示到什么程度（给悬停提示用） */
  hintZh: string;
  hintEn: string;
}

export const DENSITIES: DensityOption[] = [
  {
    id: "compact",
    zh: "紧凑",
    en: "Compact",
    hintZh: "一行一篇：标题 + 日期与时长，扫得最快",
    hintEn: "One line per post: title plus date and reading time",
  },
  {
    id: "cozy",
    zh: "适中",
    en: "Cozy",
    hintZh: "标题 + 日期 + 摘要 + 标签（首页第 2 栏用的就是这一档）",
    hintEn: "Title, date, summary and tags (the home page uses this one)",
  },
  {
    id: "full",
    zh: "内容",
    en: "Full",
    hintZh: "把这篇的元信息全展开：摘要、字数、修改时间、标签与分类",
    hintEn: "Everything: summary, word count, last update, tags and topics",
  },
];

export function isDensity(value: unknown): value is Density {
  return typeof value === "string" && DENSITIES.some((option) => option.id === value);
}

export type ListSort = "newest" | "oldest";

export interface SortOption {
  id: ListSort;
  zh: string;
  en: string;
}

export const SORTS: SortOption[] = [
  { id: "newest", zh: "最新优先", en: "Newest first" },
  { id: "oldest", zh: "最早优先", en: "Oldest first" },
];

export function isListSort(value: unknown): value is ListSort {
  return value === "newest" || value === "oldest";
}

/* ------------------------------ 筛选状态 ------------------------------ */

export interface ListFilters {
  /** 搜索词（空串 = 不搜索，此时列表完全来自构建期的 props，没有 JS 也能读） */
  q: string;
  /** 选中的标签：**组内是「或」**（命中任意一个即可） */
  tags: string[];
  /** 选中的分类：同上 */
  categories: string[];
  /** 年份筛选；null = 全部 */
  year: number | null;
  /** 隐藏 AI 生成的文章（`isAI: true`）—— **默认开启** */
  hideAI: boolean;
  sort: ListSort;
  density: Density;
}

/** 默认状态。`hideAI: true` 就是「AI 筛选默认开启」那条需求 */
export const DEFAULT_FILTERS: ListFilters = {
  q: "",
  tags: [],
  categories: [],
  year: null,
  hideAI: true,
  sort: "newest",
  density: "cozy",
};

/** 密度存在本机（与阅读偏好同一套路数：只在读者自己的浏览器里，不上传） */
export const DENSITY_STORAGE_KEY = "tob:list-density";

/** 搜索索引的公开地址（第 5 项的构建产物，见 app/search-index.json/route.ts） */
export const SEARCH_INDEX_URL = "/search-index.json";

/**
 * 索引读不到时的兜底检索字段：只用**这一页已经拿到的**字段（没有正文）。
 * 索引正常时用索引自带的那份 `fields`（唯一事实来源在 lib/search-index.ts）。
 */
export const INLINE_SEARCH_FIELDS = ["title", "tags", "categories", "description", "excerpt"];

/** 检索字段权重（没列到的字段按 1 算）。标题最重，正文最轻 */
export const SEARCH_FIELD_WEIGHTS: Record<string, number> = {
  title: 3,
  tags: 2,
  categories: 2,
  description: 1.5,
  excerpt: 1,
  body: 0.7,
};

/* ------------------------------ 纯函数 ------------------------------ */

function sameKey(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * 一篇文章过不过当前筛选。组与组之间是「且」，组内是「或」
 * （选中两个标签 = 命中任意一个；再选一个年份 = 还要在这一年里）。
 * 搜索词不在这里判断 —— 那一步交给 Fuse.js（它做的是模糊匹配，不是相等比较）。
 */
export function matchesFilters(post: ListPost, filters: ListFilters): boolean {
  if (filters.hideAI && post.isAI) return false;
  if (filters.year !== null && !post.date.startsWith(`${filters.year}-`)) return false;
  if (
    filters.tags.length > 0 &&
    !filters.tags.some((picked) => post.tags.some((tag) => sameKey(tag, picked)))
  ) {
    return false;
  }
  if (
    filters.categories.length > 0 &&
    !filters.categories.some((picked) =>
      post.categories.some((category) => sameKey(category, picked)),
    )
  ) {
    return false;
  }
  return true;
}

/** 排序：置顶只在「最新优先」里排在最前（最早优先就是纯粹按时间，别把置顶插到最旧那一头） */
export function sortPosts(posts: ListPost[], sort: ListSort): ListPost[] {
  const list = [...posts];
  if (sort === "oldest") {
    return list.sort((a, b) =>
      a.date < b.date ? -1 : a.date > b.date ? 1 : a.slug.localeCompare(b.slug),
    );
  }
  return list.sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)),
  );
}

/** 过滤 + 排序（不含搜索）。搜索命中的结果也要过这一遍，两条路才是同一套规则 */
export function applyFilters(posts: ListPost[], filters: ListFilters): ListPost[] {
  return sortPosts(
    posts.filter((post) => matchesFilters(post, filters)),
    filters.sort,
  );
}

/** 生效的筛选有几处（用来显示「已筛选」与决定是否给出「清除筛选」） */
export function activeFilterCount(filters: ListFilters): number {
  let count = 0;
  if (filters.q.trim() !== "") count += 1;
  if (filters.tags.length > 0) count += 1;
  if (filters.categories.length > 0) count += 1;
  if (filters.year !== null) count += 1;
  if (filters.hideAI !== DEFAULT_FILTERS.hideAI) count += 1;
  if (filters.sort !== DEFAULT_FILTERS.sort) count += 1;
  return count;
}

/** 从一列文章推出出现过的年份，新的在前（时间筛选的选项表） */
export function yearsOf(posts: ListPost[]): number[] {
  const years = new Set<number>();
  for (const post of posts) {
    const year = Number(post.date.slice(0, 4));
    if (Number.isInteger(year) && year > 0) years.add(year);
  }
  return [...years].sort((a, b) => b - a);
}

/* --------------------------- URL 查询串 --------------------------- */

/** 只写**非默认**的项：默认状态的地址就是干净的 /zh/posts/ */
export function listQueryString(filters: ListFilters): string {
  const params = new URLSearchParams();
  const query = filters.q.trim();
  if (query) params.set("q", query);
  for (const tag of filters.tags) params.append("tag", tag);
  for (const category of filters.categories) params.append("cat", category);
  if (filters.year !== null) params.set("year", String(filters.year));
  if (!filters.hideAI) params.set("ai", "show");
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  if (filters.density !== DEFAULT_FILTERS.density) params.set("density", filters.density);
  const query2 = params.toString();
  return query2 ? `?${query2}` : "";
}

/**
 * 「跳到某一类文章」的地址 —— 就是这一页的筛选状态（`/zh/posts/?tag=…`、`/en/posts/?cat=…`）。
 *
 * 编解码只有上面 `listQueryString` 一处实现，所以文章页的标签片（第 12 项）、
 * 标签页与分类页（第 13 项）都调这一个函数，**不要各自拼查询串**（约定第 9 条）。
 */
export function facetHref(lang: Lang, key: "tag" | "cat", name: string): string {
  const query = listQueryString({
    ...DEFAULT_FILTERS,
    ...(key === "tag" ? { tags: [name] } : { categories: [name] }),
  });
  return `/${lang}/posts/${query}`;
}

/**
 * 卡组页的地址（`/zh/posts/notes/`）—— 「这个目录/卡组自己」的页面。
 *
 * 与 `groupPosts()` 用的是**同一份 slug**（`CardGroupMeta.slug` / `ListGroup.slug`），
 * 所以列表页的组头、卡组页本身、sitemap 三处永远指向同一个地址，不会各拼一份。
 * 页面本体在 app/[lang]/posts/[...slug]/page.tsx 里（与文章页同一个 catch-all：
 * 先按文章 slug 找，找不到再看是不是一个卡组 —— 路由因此不会与 `notes/index.md` 那种
 * 「目录首页」写法打架）。
 */
export function groupHref(lang: Lang, slug: string): string {
  const path = slug.replace(/^\/+|\/+$/g, "");
  return `/${lang}/posts/${path}/`;
}

/**
 * 读 `window.location.search`。**只在浏览器里挂载之后调**（静态导出时服务端读不到查询串，
 * 首帧必须与 SSR 一致，否则 React 会报水合不一致 —— 与第 7 项读 localStorage 同一个道理）。
 */
export function parseListQuery(search: string): Partial<ListFilters> {
  const params = new URLSearchParams(search);
  const patch: Partial<ListFilters> = {};

  const q = params.get("q");
  if (q) patch.q = q;

  const tags = params.getAll("tag").filter(Boolean);
  if (tags.length > 0) patch.tags = tags;

  const categories = params.getAll("cat").filter(Boolean);
  if (categories.length > 0) patch.categories = categories;

  if (params.has("year")) {
    const year = Number(params.get("year"));
    if (Number.isInteger(year) && year > 0) patch.year = year;
  }

  if (params.get("ai") === "show") patch.hideAI = false;

  const sort = params.get("sort");
  if (isListSort(sort)) patch.sort = sort;

  const density = params.get("density");
  if (isDensity(density)) patch.density = density;

  return patch;
}

/* --------------------------- 本机记忆（密度） --------------------------- */

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null; // 隐私模式下访问 localStorage 会抛
  }
}

/** 读者上次选的密度；没存过 / 存坏了都返回 null（由默认值说了算） */
export function readSavedDensity(): Density | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(DENSITY_STORAGE_KEY);
    return isDensity(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function saveDensity(density: Density): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(DENSITY_STORAGE_KEY, density);
  } catch {
    /* 写盘失败（隐私模式）：这次会话内仍然生效 */
  }
}

/* ------------------------------ 文案 ------------------------------ */

export interface ListFacets {
  tags: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  years: number[];
}

export interface ListText {
  title: string;
  /** 页头上面那行小字（图签编号之后那句） */
  kicker: string;
  lead: string;
  total: (n: number) => string;
  rss: string;
  empty: string;
  emptyHint: string;

  /* 搜索 */
  searchLabel: string;
  searchPlaceholder: string;
  searchClear: string;
  searchHint: string;
  searchLoading: string;
  searchIndexNote: string;
  searchInlineNote: string;
  searchErrorNote: string;
  searchResults: (n: number) => string;
  searchNoResult: (q: string) => string;

  /* 筛选 */
  filtersLabel: string;
  filtered: string;
  tagsLabel: string;
  categoriesLabel: string;
  timeLabel: string;
  timeAll: string;
  timeYear: (year: number) => string;
  sortLabel: string;
  densityLabel: string;
  languageLabel: string;
  aiLabel: string;
  aiOn: string;
  aiOff: string;
  aiHint: string;
  clear: string;
  results: (shown: number, total: number) => string;
  emptyFiltered: string;

  /**
   * 折叠起来的工具栏（第 10 项）：整块收起时只留一行。
   * `filtersNone` 是没有生效条件时那一行的小字；Show/Hide 是给读屏用的展开/收起说明。
   */
  filtersNone: string;
  filtersShow: string;
  filtersHide: string;

  /**
   * 卡组（content/README.md 第 5 节）：列表页按目录把文章分成几块。
   * `ungrouped` 是「没放进任何目录」那一块（顶层文章）—— 它只在有真卡组时才出现。
   * 卡组页（`/zh/posts/notes/`）复用 `kicker` / `count`，另有两句它自己的话：
   * `pageNote`（组里没写 description 时的说明）与 `backAll`（回全部文章）。
   */
  groups: {
    kicker: string;
    count: (n: number) => string;
    ungrouped: string;
    ungroupedNote: string;
    pageNote: string;
    backAll: string;
  };

  /* 卡片（第 11 项） */
  card: {
    minutes: (n: number) => string;
    words: (n: number) => string;
    updated: (date: string) => string;
    pinned: string;
    ai: string;
    draft: string;
    /** 「笔记」角标：卡组目录里的那一篇（与单篇文章的卡片区分开） */
    note: string;
    noteHint: (group: string) => string;
    fullNote: string;
  };
  /**
   * 卡片标题的悬停说明，用在**正文页还没落地**的时候（与 RouteLink 的 navPending
   * 同一个口径，判断在 components/list/PostCard.tsx 里读 lib/site.ts 的 ARTICLE_ROUTE）。
   * 第 12 项已落地，所以这条文案当前不会渲染出来 —— 留着是为了把状态改回 `"pending"`
   * 时（比如以后换 slug 规则）不至于出现一个没有说明的不可点标题。
   */
  articlePending: (item: number) => string;
}

const ZH: ListText = {
  title: "文章",
  kicker: "全部文章",
  lead: "按标签、分类与时间筛选，或在上面直接搜。所有结果都留在这一页，不会跳到别处；筛选状态写在地址栏里，可以直接把这一页的地址发给别人。",
  total: (n) => `共 ${n} 篇`,
  rss: "订阅 RSS",
  empty: "还没有文章 —— 第一篇由你亲笔写。",
  emptyHint:
    "把 .md 放进 content/zh/posts/ 这一页就会自动出现卡片；写作规范（两种 frontmatter、标签、卡组、缩略图）见 content/README.md。",

  searchLabel: "搜索",
  searchPlaceholder: "标题、标签、分类、正文……",
  searchClear: "清除搜索",
  searchHint:
    "搜索用构建期生成的索引（/search-index.json）里的字段与权重，第一次输入时才去读它（fuse.js 也是那时才加载）。",
  searchLoading: "正在读搜索索引……",
  searchIndexNote: "结果来自构建期索引，含每篇正文的前 1200 字。",
  searchInlineNote: "索引没读到，这一次只匹配本页已有的标题 / 标签 / 分类 / 摘要。",
  searchErrorNote: "检索组件没能加载（fuse.js 加载失败），搜索暂时不可用；下面的筛选仍然有效。",
  searchResults: (n) => `搜索命中 ${n} 篇`,
  searchNoResult: (q) => `没有匹配「${q}」的文章。`,

  filtersLabel: "筛选",
  filtered: "已筛选",
  tagsLabel: "标签",
  categoriesLabel: "分类",
  timeLabel: "时间",
  timeAll: "全部",
  timeYear: (year) => `${year} 年`,
  sortLabel: "排序",
  densityLabel: "密度",
  languageLabel: "语言",
  aiLabel: "AI 文章",
  aiOn: "已隐藏（默认）",
  aiOff: "已显示",
  aiHint:
    "frontmatter 里写了 isAI: true 的文章默认不出现在列表里（也一并从搜索命中里排除）；想看就把这一项点开。",
  clear: "清除筛选",
  results: (shown, total) => `显示 ${shown} / ${total} 篇`,
  emptyFiltered: "这些筛选条件下没有文章 —— 放宽一档试试，或者按上面的「清除筛选」。",

  filtersNone: "没有筛选条件",
  filtersShow: "展开搜索与筛选",
  filtersHide: "收起搜索与筛选",

  groups: {
    kicker: "卡组",
    count: (n) => `${n} 篇`,
    ungrouped: "未分组",
    ungroupedNote: "没放进任何目录的文章（放在 content/<lang>/posts/ 顶层的那些）。",
    pageNote: "这个卡组（目录）里的文章都列在下面。",
    backAll: "← 全部文章",
  },

  card: {
    minutes: (n) => `${n} 分钟`,
    words: (n) => `${n} 字`,
    updated: (date) => `改于 ${date}`,
    pinned: "置顶",
    ai: "AI",
    draft: "草稿",
    note: "笔记",
    noteHint: (group) =>
      `这是卡组「${group}/」里的一篇笔记 —— 与单篇文章的卡片样式不同（虚线描边 + 画布底色）`,
    fullNote: "列表只到摘要为止 —— 点标题进正文页读全文。",
  },
  articlePending: (item) => `文章页还没做（第 ${item} 项落地后可点）`,
};

const EN: ListText = {
  title: "Posts",
  kicker: "All posts",
  lead: "Filter by tag, topic or year, or search right here. Results stay on this page; the filter state lives in the address bar, so you can share the exact view you are looking at.",
  total: (n) => `${n} post${n === 1 ? "" : "s"}`,
  rss: "RSS feed",
  empty: "No posts yet — the first one is yours to write.",
  emptyHint:
    "Drop a .md into content/en/posts/ and cards appear here automatically; the writing guide (both frontmatter styles, tags, card groups, covers) is content/README.md.",

  searchLabel: "Search",
  searchPlaceholder: "Title, tags, topics, body…",
  searchClear: "Clear search",
  searchHint:
    "Search uses the fields and weights of the build-time index (/search-index.json); it is fetched on your first keystroke (fuse.js loads then too).",
  searchLoading: "Loading the search index…",
  searchIndexNote: "Results come from the build-time index, including the first 1200 characters of each post.",
  searchInlineNote: "The index could not be read — this search only matches title / tags / topics / summary on this page.",
  searchErrorNote: "The search library failed to load (fuse.js); search is unavailable. The filters below still work.",
  searchResults: (n) => `${n} match${n === 1 ? "" : "es"}`,
  searchNoResult: (q) => `Nothing matches “${q}”.`,

  filtersLabel: "Filters",
  filtered: "filtered",
  tagsLabel: "Tags",
  categoriesLabel: "Topics",
  timeLabel: "Time",
  timeAll: "All",
  timeYear: (year) => `${year}`,
  sortLabel: "Sort",
  densityLabel: "Density",
  languageLabel: "Language",
  aiLabel: "AI posts",
  aiOn: "Hidden (default)",
  aiOff: "Shown",
  aiHint:
    "Posts with isAI: true in frontmatter are hidden from the list by default (and from search matches); turn this on to see them.",
  clear: "Clear filters",
  results: (shown, total) => `Showing ${shown} of ${total}`,
  emptyFiltered: "No posts match these filters — try loosening one, or hit “Clear filters” above.",

  filtersNone: "No filters",
  filtersShow: "Show search and filters",
  filtersHide: "Hide search and filters",

  groups: {
    kicker: "Card group",
    count: (n) => `${n} post${n === 1 ? "" : "s"}`,
    ungrouped: "Ungrouped",
    ungroupedNote: "Posts that do not live in a directory of their own (directly under content/<lang>/posts/).",
    pageNote: "Every post in this card group is listed below.",
    backAll: "← All posts",
  },

  card: {
    minutes: (n) => `${n} min`,
    words: (n) => `${n} words`,
    updated: (date) => `updated ${date}`,
    pinned: "Pinned",
    ai: "AI",
    draft: "Draft",
    note: "Note",
    noteHint: (group) =>
      `A note that lives in the card group “${group}/” — its card is styled differently from a standalone article (dashed border, canvas background)`,
    fullNote: "The list stops at the summary — click a title to read the full post.",
  },
  articlePending: (item) => `Article pages are not built yet (lands in item ${item})`,
};

export const LIST_TEXT: Record<Lang, ListText> = { zh: ZH, en: EN };
