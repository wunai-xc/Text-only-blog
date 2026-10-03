/**
 * lib/site-strings.ts —— 页面骨架的中英文案（从 lib/site.ts 拆出）
 *
 * 这里的每一句都是「界面上的字」：顶栏、页脚、设置中心的标题与说明、上传字体的报错。
 * 它是全站改得最勤的一块内容（比站点域名、评论配置勤得多），所以单独一个文件 ——
 * 改文案不用在一堆配置里翻。
 *
 * 用法：`SITE.i18n[lang]`（SITE 在 lib/site.ts，把这张表挂了进去）。
 *
 * ⚠️ 中英各一份，`SiteStrings` 接口约束两边字段完全一致 —— 缺一边 TypeScript 直接报错
 * （约定第 3 条）。加一句话要**同时**给 zh 和 en 补上，否则这里编译不过。
 *
 * 另外两类文案不在这里，跟着各自的选项走（与阅读偏好的做法一致）：
 *   - 外观（跟随系统 / 纸 / 亮 / 暗）在 lib/theme.ts 的 `THEME_LABELS`；
 *   - 阅读偏好（字体 / 宽度 / 字号 / 行距 / 缩进）在 lib/prefs.ts 的 `READING_*` 表。
 */

import type { Lang } from "./lang";
import type { RouteId } from "./routes";

export interface SiteStrings {
  /* 品牌与导航（顶栏的小字行 + 页脚那一排入口共用这套文案） */
  navLabel: string;
  /** 悬停提示：这一页还没做，由第 N 项落地 */
  navPending: (item: number) => string;
  /** 导航项的名字，按 RouteId 索引 */
  nav: Record<RouteId, string>;
  /**
   * 图签名字（右下角那张「图纸标题栏」）里 RouteId 之外的三张图纸。
   * RouteId 那几张直接复用上面的 nav，不另写一份。
   */
  decor: Record<"article" | "offline" | "unknown", string>;
  brandTagline: string;
  brandAbout: string;
  allPosts: string;
  /** 顶栏图片位空着时格子里显示的字（作者把图放进 public/ 后填 HEADER_IMAGE.src） */
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
  /* 设置中心：自定义配色（外观选到「自定义」时展开） */
  customColors: string;
  customColorsHint: string;
  customBase: string;
  customCanvas: string;
  customInk: string;
  customAccent: string;
  customDanger: string;
  customDark: string;
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

export const I18N: Record<Lang, SiteStrings> = {
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
      "调的是正文的宽度 / 字号 / 行距 / 首行缩进与字体（第 6 项那几个 --reading-* 令牌），改完立刻生效，全站通用。宽度 / 字号 / 行距是滑块：没拖过时用的是按你屏幕大小算出来的默认值（屏大一点，一行的字多几个、字号也大一档），拖过之后以你选的为准，「恢复默认」会交还给屏幕。导轨上那圈小圆环标的就是「默认值」的位置，拖动时会吸附到刻度节点上。字体那几档（黑体 / 宋体 / 楷体 / 仿宋 / 圆体 / 隶书 / 行楷 / 等宽）用的都是你设备上已有的字体，不下载任何字体文件（设备上没装的那一档会自动退回最接近的默认字体）；「自定义」那一档用的则是你自己上传的字体文件，只存在你的浏览器里。",
    readingFont: "正文字体",
    readingWidth: "正文宽度",
    readingSize: "正文字号",
    readingLeading: "行距",
    readingIndent: "首行缩进",
    readingCurrent: "当前取值",
    customColors: "自定义配色",
    customColorsHint:
      "先挑一套预设当起点，再微调四个关键色，剩下的「面 / 线 / 弱字 / 重点底色」会自动从它们推出来，不用逐项去调。深浅那一档由底色决定：浅底选「亮底」，深底选「暗底」（表单控件与滚动条会跟着变）。这套配色只存在你的浏览器里。",
    customBase: "从预设开始",
    customCanvas: "底色",
    customInk: "文字色",
    customAccent: "重点色",
    customDanger: "警示色",
    customDark: "暗底",
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
    contactBody:
      "Reach me by email, through my blog, or add me on QQ to pester me: 3234319738",
    email: "Email",
    github: "GitHub",
    repo: "Source",
    rss: "RSS",
    notFilled: "Edit here",
    footerNote: "Thanks for reading. May we be friends and grow together.",
    poweredBy: "Next.js + Cloudflare Workers static assets",
    settingsTitle: "Settings",
    settingsOpen: "Open settings",
    settingsClose: "Close settings",
    settingsIntro:
      "Everything here is a preference in your own browser: stored locally (preferences in localStorage, an uploaded font file in IndexedDB), never uploaded, not shared between devices.",
    appearance: "Appearance",
    reading: "Reading",
    readingHint:
      "Changes the width / size / leading / first-line indent and font of the body text (the --reading-* tokens from item 6). Takes effect immediately, site-wide. Width, size and leading are sliders: until you drag one, its value is the default worked out from your screen size (a bigger screen gets a slightly wider column and larger type); once you drag it, yours wins, and “Reset” hands it back to the screen. The small ring on the rail marks that default value, and dragging snaps to the tick nodes. The font presets (Sans / Song / Kai / FangSong / Yuanti / LiShu / XingKai / Mono) all use fonts already installed on your device — nothing is downloaded (a preset your device does not have falls back to the nearest default). The Custom preset uses a font file you upload yourself, kept in your browser only.",
    readingFont: "Font",
    readingWidth: "Width",
    readingSize: "Font size",
    readingLeading: "Line height",
    readingIndent: "Paragraph indent",
    readingCurrent: "Current values",
    customColors: "Custom colors",
    customColorsHint:
      "Start from a preset, then fine-tune four key colors; the surfaces, rules, muted text and accent tints are derived from them automatically, so you do not have to adjust every token. The light/dark switch follows your background: pick Light for a pale canvas, Dark for a deep one (form controls and scrollbars follow along). This palette stays in your browser only.",
    customBase: "Start from",
    customCanvas: "Background",
    customInk: "Text",
    customAccent: "Accent",
    customDanger: "Danger",
    customDark: "Dark base",
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