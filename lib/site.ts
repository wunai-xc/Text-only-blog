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
 *   3. `NAV`      站内导航的顺序与图标（就是 ROUTES 里标了 nav 的那些，按书写顺序）。
 *                 顶栏改版（对齐 wunai-blog 参考稿）之后，这排入口挂在**页脚**
 *                 （components/SiteFooter.tsx 的第一块）；顶栏只留品牌 / 友链 / 图片位三段。
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
  /** 是否进站内导航（页脚那一排入口，顺序即书写顺序） */
  nav?: boolean;
  /** 导航图标（nav 项才有） */
  icon?: IconName;
}

/**
 * ⚠️ 改这里就能切换「待落地」标记：做完第 10~13 项的某一个页面，
 * 把对应项的 status 从 "pending" 改成 "ready" 即可（顺序即站内导航顺序）。
 */
export const ROUTES: Record<RouteId, SiteRoute> = {
  home: { path: "/{lang}/", status: "ready", item: 1, nav: true, icon: "mdi:home-outline" },
  posts: {
    path: "/{lang}/posts/",
    status: "ready",
    item: 10,
    nav: true,
    icon: "mdi:post-outline",
  },
  tags: {
    path: "/{lang}/tags/",
    status: "ready",
    item: 13,
    nav: true,
    icon: "mdi:tag-multiple-outline",
  },
  categories: {
    path: "/{lang}/categories/",
    status: "ready",
    item: 13,
    nav: true,
    icon: "mdi:shape-outline",
  },
  archives: {
    path: "/{lang}/archives/",
    status: "ready",
    item: 13,
    nav: true,
    icon: "mdi:archive-outline",
  },
  search: { path: "/{lang}/search/", status: "ready", item: 13, nav: true, icon: "mdi:magnify" },
  links: {
    path: "/{lang}/links/",
    status: "ready",
    item: 13,
    nav: true,
    icon: "mdi:account-multiple-outline",
  },
  about: { path: "/{lang}/about/", status: "ready", item: 13, icon: "mdi:account-outline" },
  settings: { path: "/{lang}/settings/", status: "ready", item: 13, icon: "mdi:cog-outline" },
};

/** 路径（替换 {lang}）；不保证这一页已经存在 —— 判断用 routeReady() */
export function routeHref(id: RouteId, lang: Lang): string {
  return ROUTES[id].path.replace("{lang}", lang);
}

export function routeReady(id: RouteId): boolean {
  return ROUTES[id].status === "ready";
}

/**
 * 文章**正文页**的落地状态（第 12 项；列表页是 ROUTES.posts，第 10 项，两者不是一回事）。
 *
 * 首页与列表页的文章卡片按它决定「可点 / 不可点」，与 RouteLink 是同一个约定
 * （约定第 8 条：没有这一页就不留会 404 的链接）。第 12 项已落地，
 * 所以这里改成 "ready" —— 所有卡片一起变成真链接，不需要去改各个卡片组件。
 */
export const ARTICLE_ROUTE: { status: "ready" | "pending"; item: number } = {
  status: "ready",
  item: 12,
};

/**
 * 字符串是不是一个 RouteId（第 8 项：装饰层要把路径的段落认成「哪一页」）。
 * 用 ROUTES 自己当事实来源，加一条路由这里不用改。
 */
export function isRouteId(value: string): value is RouteId {
  return Object.prototype.hasOwnProperty.call(ROUTES, value);
}

/** 站内导航（顺序即 ROUTES 里的书写顺序）。页脚的导航栏读它，顶栏不再用它 */
export const NAV: RouteId[] = (Object.keys(ROUTES) as RouteId[]).filter((id) => ROUTES[id].nav);

/**
 * 顶栏右侧那张图（顶栏第三段，对齐 wunai-blog 参考稿的 `image-placeholder`）。
 *
 * 怎么用：把图片放进 `public/`（例如 `public/header.jpg`），再把文件名填到下面的 `src`，
 * 例如 `src: "/header.jpg"`。**留空时**这一格画成一个虚线空位、写着「图片位 · 编辑此处」，
 * 尺寸与有图时完全一致 —— 所以以后补图不会让顶栏高度跳一下。
 *
 * 尺寸建议：横构图、主体居中。桌面上这一格是 15rem × 顶栏高（约 240 × 88px），
 * 按 2 倍屏准备 480×176 左右就够；窄屏收窄到 140px / 80px，由 `object-fit: cover` 居中裁切。
 *
 * `alt` 留空 = 它是**装饰**（整格带 `aria-hidden`，与 wunai-blog 一致）；
 * 想让读屏读出来（例如这是站标）就填上 alt，那时它不再被当作装饰。
 */
export const HEADER_IMAGE: { src: string; alt: string } = {
  src: "", // 编辑此处：例如 "/header.jpg"
  alt: "",
};

/* ------------------------------ i18n 文案 ------------------------------ */

export interface SiteStrings {
  /* 品牌与导航（顶栏的小字行 + 页脚那一排入口共用这套文案） */
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
  /** 顶栏图片位空着时格子里显示的字（作者把图放进 public/ 后填上面的 HEADER_IMAGE.src） */
  headerImage: string;
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
    headerImage: "图片位 · 编辑此处",
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
    headerImage: "Image · edit here",
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
  description: "wunai的数字文章笔记库",
  i18n: I18N,
};

/**
 * 联系方式。**全部留空**，等你自己填 —— 空着的条目在页脚显示「编辑此处」，
 * 不会渲染成空链接（点一下什么都不发生比缺一行更糟）。
 */
export const CONTACT: { email: string; github: string; repo: string } = {
  email: "3234319738@qq.com", // 编辑此处：邮箱，例如 you@example.com
  github: "https://github.com/wunai-xc", // 编辑此处：GitHub 主页，例如 https://github.com/your-name
  repo: "https://github.com/wunai-xc/Text-only-blog", // 编辑此处：本站仓库地址（公开后再填）
};

/**
 * giscus 评论（第 12 项：文章页）。
 *
 * **四个值全部留空** —— 空的含义是「评论还没接上」，文章页会显示「编辑此处」而不是
 * 一个空壳 iframe。到 https://giscus.app 按提示选中仓库与 Discussions 分类，
 * 页面会直接把下面这四个值生成出来，粘进来即可（改完重新构建）。
 *
 * 注意：光填这里还不够 —— 仓库必须**公开**、且已经在 Settings → General → Features 里
 * 打开 Discussions、装过 giscus 应用（giscus.app 的向导会一步步带你做）。
 * 第三个 `category` 是 Discussions 里的**分类名**（不是 id），两者都要填。
 */
export const COMMENTS: {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
} = {
  repo: "", // 编辑此处：例如 "your-name/your-repo"
  repoId: "", // 编辑此处：giscus.app 给的 data-repo-id
  category: "", // 编辑此处：Discussions 分类名，例如 "Announcements"
  categoryId: "", // 编辑此处：giscus.app 给的 data-category-id
};

/** 评论是否已经配置好（四项都填了才算） */
export function commentsReady(): boolean {
  return (
    COMMENTS.repo !== "" &&
    COMMENTS.repoId !== "" &&
    COMMENTS.category !== "" &&
    COMMENTS.categoryId !== ""
  );
}

/**
 * 友链（第 13 项的 /[lang]/links/ 页）。**现在是空的** —— 空数组时那一页只显示一段
 * 「编辑此处」的说明，不会渲染出一个空清单。
 *
 * 填法（一行一条）：
 *   { name: "某某的博客", url: "https://example.com", note: "一句话说明" }
 * `note` 可以不写。加别人之前先问一声，并确认对方也链了你 —— 这件事代码管不了。
 */
export const LINKS: { name: string; url: string; note?: string }[] = [
  // 编辑此处：删掉这一行注释，按上面的形状填自己的友链
];

/** 每语言的 RSS 地址（第 5 项生成，路由见 app/[lang]/feed.xml/route.ts） */
export function feedHref(lang: Lang): string {
  return `/${lang}/feed.xml`;
}

/**
 * 「阅读器自动发现订阅源」用的 `alternates.types`（根布局与各页面共用一份）。
 *
 * ⚠️ Next 的 metadata 是**浅合并**：页面一旦自己写了 `alternates`（哪怕只写 canonical
 * 或 languages），根布局里这一份 `types` 就被整体覆盖掉。所以自己写 alternates 的页面
 * 要把它一起带上 —— 别在页面里手抄第二份地址（第 5 项那次记下的坑，第 10 项先按这条办，
 * 第 12 项的文章页也要这么做）：
 *
 *   alternates: { canonical, languages, types: feedAlternatesTypes() }
 */
export function feedAlternatesTypes(): Record<string, { url: string; title: string }[]> {
  return {
    "application/rss+xml": [
      { url: "/zh/feed.xml", title: `${SITE.title}（中文）` },
      { url: "/en/feed.xml", title: `${SITE.title} (English)` },
    ],
  };
}
