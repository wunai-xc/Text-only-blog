/**
 * lib/site.ts —— 站点配置与 UI 文案（第 1 项建立，第 7 项扩全）
 *
 * 这里放「跟站点有关、但不属于任何一页」的东西。零依赖（不 import 任何包），
 * 服务端组件与客户端组件都能直接用：
 *
 *   1. `SITE`     站点元信息（标题 / 作者 / 域名 / 描述）+ i18n 文案表；
 *   2. `ROUTES`   路由表：路径模板 + **落地状态**。第 10~13 项的页面还没做，
 *                 状态是 `pending` 的入口在 UI 里渲染成不可点（见 components/RouteLink.tsx），
 *                 哪一项做完了，把这里的状态改成 `"ready"` 就行 —— 顶栏、页脚、首页会一起生效，
 *                 不需要去各页面找链接；
 *   3. `NAV`      顶栏导航的顺序与图标（就是 ROUTES 里标了 nav 的那些，按书写顺序）；
 *   4. `CONTACT`  联系方式。**全部留空**，由你亲笔填 —— 没填的条目在页脚显示「编辑此处」，
 *                 不会生成一个点不动的空链接。
 *
 * 文案分两处维护，都是中英各一份、缺一边 TypeScript 直接报错（约定第 3 条）：
 *   - 页面骨架的文案（顶栏、页脚、设置中心的标题与说明）在这里的 `I18N`；
 *   - 选项文案跟着选项走：外观在 lib/theme.ts 的 `THEME_LABELS`，阅读偏好在
 *     lib/prefs.ts 的 `READING_*` 表里（与第 6 项的做法一致）。
 *
 * 主题令牌与主题读写也不在这里 —— 那些在 lib/theme.ts（第 6 项）。
 */

import type { IconName } from "./icons";

export type Lang = "zh" | "en";

export const LANGS: Lang[] = ["zh", "en"];

export function isLang(v: string): v is Lang {
  return v === "zh" || v === "en";
}

/** 另一种语言（语言切换、hreflang 之类都用它） */
export function otherLang(lang: Lang): Lang {
  return lang === "zh" ? "en" : "zh";
}

/* ------------------------------ 路由表 ------------------------------ */

export type RouteId =
  | "home"
  | "posts"
  | "tags"
  | "categories"
  | "archives"
  | "search"
  | "links"
  | "about"
  | "settings";

export interface SiteRoute {
  /** 路径模板，`{lang}` 会被替换成 zh / en */
  path: string;
  /** ready = 页面已经存在；pending = 还没做，UI 里渲染成不可点 */
  status: "ready" | "pending";
  /** 由哪一项落地 —— 用来在悬停提示里说清楚，也是回头核对的清单 */
  item: number;
  /** 是否进顶栏导航 */
  nav?: boolean;
  /** 顶栏导航图标（nav 项才有） */
  icon?: IconName;
}

/**
 * ⚠️ 改这里就能切换「待落地」标记：做完第 10~13 项的某一个页面，
 * 把对应项的 status 从 "pending" 改成 "ready" 即可（顺序即顶栏导航顺序）。
 */
export const ROUTES: Record<RouteId, SiteRoute> = {
  home: { path: "/{lang}/", status: "ready", item: 1, nav: true, icon: "mdi:home-outline" },
  posts: {
    path: "/{lang}/posts/",
    status: "pending",
    item: 10,
    nav: true,
    icon: "mdi:post-outline",
  },
  tags: {
    path: "/{lang}/tags/",
    status: "pending",
    item: 13,
    nav: true,
    icon: "mdi:tag-multiple-outline",
  },
  categories: {
    path: "/{lang}/categories/",
    status: "pending",
    item: 13,
    nav: true,
    icon: "mdi:shape-outline",
  },
  archives: {
    path: "/{lang}/archives/",
    status: "pending",
    item: 13,
    nav: true,
    icon: "mdi:archive-outline",
  },
  search: { path: "/{lang}/search/", status: "pending", item: 13, nav: true, icon: "mdi:magnify" },
  links: {
    path: "/{lang}/links/",
    status: "pending",
    item: 13,
    nav: true,
    icon: "mdi:account-multiple-outline",
  },
  about: { path: "/{lang}/about/", status: "pending", item: 13, icon: "mdi:account-outline" },
  settings: { path: "/{lang}/settings/", status: "pending", item: 13, icon: "mdi:cog-outline" },
};

/** 路径（替换 {lang}）；不保证这一页已经存在 —— 判断用 routeReady() */
export function routeHref(id: RouteId, lang: Lang): string {
  return ROUTES[id].path.replace("{lang}", lang);
}

export function routeReady(id: RouteId): boolean {
  return ROUTES[id].status === "ready";
}

/**
 * 字符串是不是一个 RouteId（第 8 项：装饰层要把路径的段落认成「哪一页」）。
 * 用 ROUTES 自己当事实来源，加一条路由这里不用改。
 */
export function isRouteId(value: string): value is RouteId {
  return Object.prototype.hasOwnProperty.call(ROUTES, value);
}

/** 顶栏导航（顺序即 ROUTES 里的书写顺序） */
export const NAV: RouteId[] = (Object.keys(ROUTES) as RouteId[]).filter((id) => ROUTES[id].nav);

/* ------------------------------ i18n 文案 ------------------------------ */

export interface SiteStrings {
  /* 顶栏 */
  navLabel: string;
  /** 悬停提示：这一页还没做，由第 N 项落地 */
  navPending: (item: number) => string;
  /** 导航项的名字，按 RouteId 索引 */
  nav: Record<RouteId, string>;
  /**
   * 图签名字（第 8 项：右下角那张「图纸标题栏」）里 RouteId 之外的三张图纸。
   * RouteId 那几张直接复用上面的 nav，不另写一份。
   */
  decor: Record<"article" | "offline" | "unknown", string>;
  brandTagline: string;
  brandAbout: string;
  allPosts: string;
  langName: string;
  langTitle: (name: string) => string;
  statsPosts: (count: number) => string;
  statsWords: (count: number) => string;
  statsUpdated: (date: string) => string;
  statsEmpty: string;
  /* 页脚 */
  contactTitle: string;
  contactBody: string;
  email: string;
  github: string;
  repo: string;
  rss: string;
  notFilled: string;
  footerNote: string;
  poweredBy: string;
  /* 设置中心 */
  settingsTitle: string;
  settingsOpen: string;
  settingsClose: string;
  settingsIntro: string;
  appearance: string;
  reading: string;
  readingHint: string;
  readingWidth: string;
  readingSize: string;
  readingLeading: string;
  readingCurrent: string;
  language: string;
  languageHint: string;
  reset: string;
  resetHint: string;
}

const I18N: Record<Lang, SiteStrings> = {
  zh: {
    navLabel: "站点导航",
    navPending: (item) => `这一页还没做（第 ${item} 项落地），先点不进去`,
    nav: {
      home: "首页",
      posts: "文章",
      tags: "标签",
      categories: "分类",
      archives: "归档",
      search: "搜索",
      links: "友链",
      about: "关于",
      settings: "设置",
    },
    decor: { article: "正文", offline: "离线", unknown: "未编号" },
    brandTagline: "wunai 是谁？",
    brandAbout: "About……",
    allPosts: "全部文章 →",
    langName: "English",
    langTitle: (name) => `切换到 ${name}`,
    statsPosts: (count) => `${count} 篇`,
    statsWords: (count) => `${count} 字`,
    statsUpdated: (date) => `更新于 ${date}`,
    statsEmpty: "还没有文章 —— 第一篇由你亲笔写",
    contactTitle: "联系",
    contactBody: "编辑此处：一句话说明你希望读者怎么找到你。",
    email: "邮箱",
    github: "GitHub",
    repo: "本站源码",
    rss: "RSS 订阅",
    notFilled: "编辑此处",
    footerNote: "编辑此处：页脚的一句话（留空也可以）",
    poweredBy: "Next.js + Cloudflare Workers 静态资源",
    settingsTitle: "设置中心",
    settingsOpen: "打开设置",
    settingsClose: "关闭设置",
    settingsIntro:
      "这里改的都是你浏览器里的偏好：存在本机（localStorage），不上传任何服务器，换设备不会跟着走。",
    appearance: "外观",
    reading: "阅读偏好",
    readingHint:
      "调的是正文的宽度 / 字号 / 行距（第 6 项那三个 --reading-* 令牌），改完立刻生效，全站通用。",
    readingWidth: "正文宽度",
    readingSize: "正文字号",
    readingLeading: "行距",
    readingCurrent: "当前取值",
    language: "语言",
    languageHint: "中英文各有一份内容，切换语言不会丢掉这里的设置。",
    reset: "恢复默认",
    resetHint: "把外观与阅读偏好都还原成默认值（文章内容不受影响）。",
  },
  en: {
    navLabel: "Site navigation",
    navPending: (item) => `Not built yet (lands in item ${item})`,
    nav: {
      home: "Home",
      posts: "Posts",
      tags: "Tags",
      categories: "Categories",
      archives: "Archive",
      search: "Search",
      links: "Links",
      about: "About",
      settings: "Settings",
    },
    decor: { article: "Article", offline: "Offline", unknown: "Unnumbered" },
    brandTagline: "Who is wunai?",
    brandAbout: "About…",
    allPosts: "All posts →",
    langName: "中文",
    langTitle: (name) => `Switch to ${name}`,
    statsPosts: (count) => `${count} post${count === 1 ? "" : "s"}`,
    statsWords: (count) => `${count} words`,
    statsUpdated: (date) => `updated ${date}`,
    statsEmpty: "No posts yet — the first one is yours to write",
    contactTitle: "Contact",
    contactBody: "Edit here: one line about how readers can reach you.",
    email: "Email",
    github: "GitHub",
    repo: "Source",
    rss: "RSS",
    notFilled: "Edit here",
    footerNote: "Edit here: one line for the footer (leaving it empty is fine)",
    poweredBy: "Next.js + Cloudflare Workers static assets",
    settingsTitle: "Settings",
    settingsOpen: "Open settings",
    settingsClose: "Close settings",
    settingsIntro:
      "Everything here is a preference in your own browser: stored locally (localStorage), never uploaded, not shared between devices.",
    appearance: "Appearance",
    reading: "Reading",
    readingHint:
      "Changes the width / size / leading of the body text (the three --reading-* tokens from item 6). Takes effect immediately, site-wide.",
    readingWidth: "Width",
    readingSize: "Font size",
    readingLeading: "Line height",
    readingCurrent: "Current values",
    language: "Language",
    languageHint: "Each language has its own content; switching keeps your settings here.",
    reset: "Reset to defaults",
    resetHint: "Restores appearance and reading preferences (your posts are untouched).",
  },
};

/* ------------------------------ 站点与联系 ------------------------------ */

export const SITE = {
  title: "wunai's blog",
  author: "wunai",
  url: "https://blog.wunai.top",
  defaultLang: "zh" as Lang,
  description: "编辑此处：站点描述（会用于 SEO 与 RSS）",
  i18n: I18N,
};

/**
 * 联系方式。**全部留空**，等你自己填 —— 空着的条目在页脚显示「编辑此处」，
 * 不会渲染成空链接（点一下什么都不发生比缺一行更糟）。
 */
export const CONTACT: { email: string; github: string; repo: string } = {
  email: "", // 编辑此处：邮箱，例如 you@example.com
  github: "", // 编辑此处：GitHub 主页，例如 https://github.com/your-name
  repo: "", // 编辑此处：本站仓库地址（公开后再填）
};

/** 每语言的 RSS 地址（第 5 项生成，路由见 app/[lang]/feed.xml/route.ts） */
export function feedHref(lang: Lang): string {
  return `/${lang}/feed.xml`;
}
