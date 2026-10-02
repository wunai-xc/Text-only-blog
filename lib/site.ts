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
  src: "/wunai_xc.png", // 顶栏右上角那张图（文件在 public/wunai_xc.png）
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
  readingFont: string;
  readingWidth: string;
  readingSize: string;
  readingLeading: string;
  readingIndent: string;
  readingCurrent: string;
  language: string;
  languageHint: string;
  reset: string;
  resetHint: string;
  /* 设置中心：「自定义」字体（读者自己上传字体文件） */
  localFontUpload: string;
  localFontReplace: string;
  localFontRemove: string;
  localFontEmpty: string;
  localFontHint: string;
  localFontErrType: string;
  localFontErrSize: string;
  localFontErrRead: string;
  localFontErrStore: string;
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
    contactBody: "你可以通过我的邮箱来找我，或者是我的博客以及你可以通过添加我的QQ来骚扰我3234319738",
    email: "邮箱",
    github: "GitHub",
    repo: "本站源码",
    rss: "RSS 订阅",
    notFilled: "编辑此处",
    footerNote: "感谢你的阅读，愿我们彼此为友，共同进步",
    poweredBy: "Next.js + Cloudflare Workers 静态资源",
    settingsTitle: "设置中心",
    settingsOpen: "打开设置",
    settingsClose: "关闭设置",
    settingsIntro:
      "这里改的都是你浏览器里的偏好：存在本机（偏好是 localStorage，上传的字体文件是 IndexedDB），不上传任何服务器，换设备不会跟着走。",
    appearance: "外观",
    reading: "阅读偏好",
    readingHint:
      "调的是正文的字体 / 宽度 / 字号 / 行距 / 首行缩进（第 6 项那几个 --reading-* 令牌），改完立刻生效，全站通用。字体四档（黑体 / 宋体 / 楷体 / 等宽）用的都是你设备上已有的字体，不下载任何字体文件；「自定义」那一档用的则是你自己上传的字体文件，只存在你的浏览器里。",
    readingFont: "正文字体",
    readingWidth: "正文宽度",
    readingSize: "正文字号",
    readingLeading: "行距",
    readingIndent: "首行缩进",
    readingCurrent: "当前取值",
    language: "语言",
    languageHint: "中英文各有一份内容，切换语言不会丢掉这里的设置。",
    reset: "恢复默认",
    resetHint: "把外观与阅读偏好都还原成默认值（文章内容不受影响）。",
    localFontUpload: "上传字体文件",
    localFontReplace: "更换",
    localFontRemove: "移除",
    localFontEmpty: "还没有上传字体文件 —— 上传一份，就能用上你自己的字体。",
    localFontHint:
      "选你设备上的一份字体文件（woff2 / woff / ttf / otf，单份不超过 30 MB）。它只在你的浏览器里读、存本机（IndexedDB），不会上传到服务器，也不会跟着账号走。",
    localFontErrType: "只认 woff2 / woff / ttf / otf 这几种字体文件。",
    localFontErrSize: "字体文件太大了（上限 30 MB）。",
    localFontErrRead: "这个文件里读不出有效字体，换一份试试。",
    localFontErrStore: "浏览器没能存下这份字体（隐私模式或存储空间不足）。",
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
      "Everything here is a preference in your own browser: stored locally (preferences in localStorage, an uploaded font file in IndexedDB), never uploaded, not shared between devices.",
    appearance: "Appearance",
    reading: "Reading",
    readingHint:
      "Changes the font / width / size / leading / first-line indent of the body text (the --reading-* tokens from item 6). Takes effect immediately, site-wide. The four font presets use fonts already installed on your device — nothing is downloaded. The Custom preset uses a font file you upload yourself, kept in your browser only.",
    readingFont: "Font",
    readingWidth: "Width",
    readingSize: "Font size",
    readingLeading: "Line height",
    readingIndent: "Paragraph indent",
    readingCurrent: "Current values",
    language: "Language",
    languageHint: "Each language has its own content; switching keeps your settings here.",
    reset: "Reset to defaults",
    resetHint: "Restores appearance and reading preferences (your posts are untouched).",
    localFontUpload: "Upload a font file",
    localFontReplace: "Replace",
    localFontRemove: "Remove",
    localFontEmpty: "No font file uploaded yet — upload one to read in your own font.",
    localFontHint:
      "Pick a font file from your device (woff2 / woff / ttf / otf, up to 30 MB). It is read and stored inside your browser only (IndexedDB) — never uploaded, and it does not follow your account.",
    localFontErrType: "Only woff2 / woff / ttf / otf font files are supported.",
    localFontErrSize: "That font file is too large (30 MB max).",
    localFontErrRead: "No usable font could be read from that file — try another one.",
    localFontErrStore: "Your browser could not store this font (private mode or no space).",
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
 * 四个值都填了评论才挂上去；任何一个留空，文章页就按约定第 2 条显示「编辑此处」+
 * 怎么配，而不是一个空壳 iframe —— 这个开关留着有用（换仓库、临时关评论都靠它）。
 *
 * 换仓库要同时改三处：仓库必须**公开**、在 Settings → General → Features 里打开
 * Discussions、并装过 giscus 应用；然后到 https://giscus.app 选中仓库与分类，
 * 页面会把下面这四个值生成出来。`category` 是分类**名**（不是 id），两个都要填。
 *
 * 当前挂在 Discussions 自带的 `Announcements` 分类上 —— 这是 giscus 官方推荐的选法：
 * 只有维护者能发起讨论，giscus 机器人写得进去，读者也不会在评论区里建出一堆散帖。
 */
export const COMMENTS: {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
} = {
  repo: "wunai-xc/Text-only-blog",
  repoId: "R_kgDOU0PvBQ",
  category: "Announcements",
  categoryId: "DIC_kwDOU0PvBc4DG5Ok",
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
 * 友链条目（第 13 项的 /[lang]/links/ 页；卡片由该页渲染，数据只此一处）。
 */
export interface FriendLink {
  /** 站点或作者名称 */
  name: string;
  /** 站点地址（整张卡片点击跳转） */
  url: string;
  /**
   * 头像地址。**外链直引**（与 wunai-Blog 的友链页一致：原生 `<img>`，不经 next/image，
   * 因为静态导出不优化图片、remotePatterns 也管不到任意域名）。
   * 留空时页面按名称首字画占位方块，不留碎图。
   */
  avatar?: string;
  /** 一句话介绍，中英各一份；两边都留空时卡片副标题回退显示域名 */
  note?: { zh: string; en: string };
}

/**
 * 友链 —— 八个，与 wunai-Blog 的 `my-app/lib/links.ts` 同一份名单（名字 / 地址 / 头像 / 介绍）。
 *
 * 头像取自各位的 GitHub 主页（`avatars.githubusercontent.com` 直链带 `s=96`，
 * 够 48px 卡片两倍图用；`github.com/<用户名>.png?size=96` 那种会 302 到同一个地方）；
 * 没有 GitHub 的两位用对方站点自己的头像图 / favicon。若对方改了简介或头像，
 * 按下面的形状改一行即可 —— 也可以换成本地图：图片放进 `public/avatars/`，这里写 `/avatars/xxx.png`。
 *
 * 加别人之前先问一声，并确认对方也链了你 —— 这件事代码管不了（页面底部也写着这句）。
 */
export const LINKS: FriendLink[] = [
  {
    name: "哈康",
    url: "https://hconzlvra.top/",
    avatar: "https://avatars.githubusercontent.com/u/273501356?v=4&s=96",
    note: {
      zh: "就让我自己登基，成为疯的君王.",
      en: "Let me ascend the throne myself and become a mad monarch.",
    },
  },
  {
    name: "摩尔",
    url: "https://molforte.github.io/Molforte.pages/",
    avatar: "https://avatars.githubusercontent.com/u/176408050?v=4&s=96",
    note: {
      zh: "来自中国浙江省的学生，正在学习嵌入式与 AI。",
      en: "A student from Zhejiang province, China. Learning Embedded and AI.",
    },
  },
  {
    name: "阿卡迪亚",
    url: "https://www.arcadia.moe/",
    avatar: "https://avatars.githubusercontent.com/u/97033226?v=4&s=96",
    note: {
      // 本人要求只写「开发者」这类中性说法，不要具体身份描述
      zh: "神秘开发者",
      en: "Developer",
    },
  },
  {
    name: "并非懒得喷",
    url: "https://www.bfladderbean.me/",
    avatar: "https://avatars.githubusercontent.com/u/139599235?v=4&s=96",
    note: {
      // 原句就是这句中文，英文站也保持原文：一句诗样的句子不宜机器翻译
      zh: "立春天，风渐暖，伊人一去不复返",
      en: "立春天，风渐暖，伊人一去不复返",
    },
  },
  {
    name: "subear",
    url: "https://subear.net/",
    // 该站首页未声明 favicon，这里用它自己的站内头像图（在 wunai-Blog 里已验证可访问）
    avatar: "https://subear.net/src/ProfilePhoto.jpg",
    note: {
      // 取自该站自己的副标题（brand-role），不是编造的描述
      zh: "Seeing · Living · Sleeping",
      en: "Seeing · Living · Sleeping",
    },
  },
  {
    name: "GTMC",
    url: "https://www.techmc.wiki/",
    // 该站 /favicon.ico 是有效图标文件（ICO 内嵌 PNG）
    avatar: "https://www.techmc.wiki/favicon.ico",
    note: {
      // 取自该站首页的自我介绍（Graduate Texts in Minecraft 的缩写）
      zh: "Graduate Texts in Minecraft：社区编写的技术性 MC 开放教科书，涵盖红石、游戏机制与引擎内部原理",
      en: "Community-written open textbook on technical Minecraft: redstone, mechanics, chunk systems and engine internals",
    },
  },
  {
    name: "戈登",
    // 对方「友链」页公布的地址（首页）
    url: "https://clawblog.rseg.club/",
    // GitHub 官方头像端点：github.com/<用户名>.png 会 302 到 avatars.githubusercontent.com
    avatar: "https://github.com/RSEGordon.png?size=96",
    note: {
      // 对方公开的描述原句：海洋遥感 · 数据科学 · 日常折腾
      zh: "海洋遥感 · 数据科学 · 日常折腾",
      en: "Ocean remote sensing · Data science · Everyday tinkering",
    },
  },
  {
    name: "Ryan100c",
    url: "https://hotpad100c-github-io.pages.dev/",
    avatar: "https://github.com/hotpad100c.png?size=96",
    note: {
      zh: "编程 · Minecraft · 创造：记录开发日志、灵感与 Minecraft 技术研究",
      en: "Programming · Minecraft · Making: dev logs, ideas and technical Minecraft research",
    },
  },
];

/** 取当前语言的介绍；缺当前语言时退回中文；都没有则返回空串（调用方回退显示域名） */
export function friendNote(note: { zh: string; en: string } | undefined, lang: Lang): string {
  if (!note) return "";
  return note[lang] || note.zh;
}

/** 去掉协议与末尾斜杠，得到可读的域名路径（卡片副标题的回退文案） */
export function friendHost(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

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
