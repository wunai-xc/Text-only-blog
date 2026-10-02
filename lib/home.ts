/**
 * lib/home.ts —— 首页版面与文案（第 9 项：八栏吸附式首页）
 *
 * 首页的**唯一事实来源**：八栏的顺序、每栏的编号与文案都在这里。
 * 页面（app/[lang]/page.tsx）只把 `HOME_ORDER` 渲染成 <section>，不在页面里写死顺序 ——
 * 想换顺序就改下面那个数组，栏号会自动跟着变。
 *
 * 当前版面：**一栏一屏**，八栏从上到下依次占满一屏（滚动时一屏一栏地吸附）：
 *   01 本站介绍 · 02 文章卡片 · 03 数据统计 · 04 更新日志
 *   05 站内内容 · 06 阅读改善 · 07 外观切换 · 08 字体设置
 * 顺序沿用最早那份清单，只是把「文章」提到第二栏（读者是来读文章的）。
 * **早先的「哪两栏并排」已经去掉**：并排会让两栏挤在同一屏里（也就是「多个栏目堆在一起」），
 * 与「一个栏目占一屏」冲突 —— 所以现在一行一栏，不做卡片、不做并排，一屏就是一块。
 * 每一栏是**定高一屏**（不只起点对齐）：内容比一屏多时在**栏内**滚动，栏本身仍是一屏 ——
 * 吸附点因此永远落在整屏位置，字号档、卡片条数怎么变都不会把版面顶歪。
 * 首页的最后「一屏」是页脚（`scroll-snap-align: end`）：不长不短的一条尾巴，
 * 少了它 mandatory 吸附会把页脚吸回去、永远读不到。以上都在 globals.css 的「6c. 首页」。
 *
 * 为什么首页文案不放在 lib/site.ts 的 I18N 里（约定第 3 条要求 UI 文案集中在那里）：
 * 八栏 × 中英两语 ×（标题 + 一句说明 + 空状态 + 示范段落），塞进去会把 site.ts 变成
 * 站点文案仓库；这里的文案**跟着版面走**（改一版首页只动这一个文件），与第 6/7 项
 * 「选项文案跟着选项走」（THEME_LABELS / READING_*）是同一个取舍。其余页面骨架的文案
 * 照旧在 lib/site.ts —— 约定第 3 条据此补一句说明（见 PROJECTS.md 第 5 节）。
 *
 * 需要作者动笔的地方一律标「编辑此处」（约定第 2 条）：第 1 栏的自述、第 7/8 栏的示范句子、
 * 第 3 栏的访问统计接法，以及文章本身。
 *
 * 零依赖（只 import 类型），服务端与浏览器都能用。
 */

import type { Lang } from "./site";
import type { TypographyCounts } from "./typography";

/* ------------------------------- 版面 ------------------------------- */

export type HomeBlockId =
  | "intro" /* 01 本站介绍 */
  | "posts" /* 02 文章卡片 */
  | "stats" /* 03 数据统计 */
  | "changelog" /* 04 更新日志 */
  | "inventory" /* 05 站内内容 */
  | "reading" /* 06 阅读改善 */
  | "themes" /* 07 外观切换 */
  | "fonts"; /* 08 字体设置 */

/**
 * 版面：**一栏一屏**，八栏从上到下依次占满一屏。
 *
 * 顺序就是数组顺序；栏号由 `homeNumber()` 推出来，不手写第二份。
 * 早先这里是一张带「哪两栏并排」的表（`HOME_ROWS`）—— 并排会把两栏塞进同一屏
 * （也就是「多个栏目堆在一起」），与「一个栏目占一屏」直接冲突，所以去掉了：
 * 现在一行就是一栏，`<section class="home-block">` 自己就是那个吸附块
 * （吸附与一屏高见 app/globals.css 的「6c. 首页」）。
 *
 * 想调顺序：移动下面这几行的先后；想加一栏：这里加一个 id、`HOME_TEXT` 补文案、
 * 页面里那张 `Record<HomeBlockId, ReactNode>` 补一个组件（穷尽类型，漏了 TypeScript 报错）。
 */
export const HOME_ORDER: HomeBlockId[] = [
  "intro", /* 01 本站介绍 */
  "posts", /* 02 文章卡片 */
  "stats", /* 03 数据统计 */
  "changelog", /* 04 更新日志 */
  "inventory", /* 05 站内内容 */
  "reading", /* 06 阅读改善 */
  "themes", /* 07 外观切换 */
  "fonts", /* 08 字体设置 */
];

/** 栏数（文案与自检用；改版面表时它自己跟着变） */
export const HOME_BLOCK_COUNT = HOME_ORDER.length;

/**
 * 栏号：01 ~ 08。**从版面表推出来**（不是写死的文案），
 * 所以调顺序时不会出现「编号还对、内容已经换了」的错位。
 */
export function homeNumber(id: HomeBlockId): string {
  const index = HOME_ORDER.indexOf(id);
  return String(index + 1).padStart(2, "0");
}

/* ------------------------------- 文案 ------------------------------- */

export interface HomeBlockText {
  /** 栏名：<h2>、侧边指示器、<section aria-label> 都用它 */
  title: string;
  /** 标题上面那行小字（栏号后面那句） */
  kicker: string;
}

export interface HomeText {
  /** 侧边指示器的无障碍名字 */
  indexLabel: string;
  /** 指示器顶部的等宽小字 */
  indexNote: string;
  blocks: Record<HomeBlockId, HomeBlockText>;

  intro: { body: string; entries: string; rss: string; note: string };
  /* 卡片上的小字（几分钟 / 置顶 / 草稿 / AI / 正文页未落地）不在这里：
     第 11 项的卡片是共用件，那句文案跟着卡片走（lib/list.ts 的 LIST_TEXT.card）。
     这一栏只剩「显示了几篇」与空状态两句 —— 改卡片文案请去 lib/list.ts。 */
  posts: { count: (n: number) => string; empty: string };
  stats: {
    note: string;
    analytics: string;
    labels: {
      words: string;
      reading: string;
      first: string;
      last: string;
      built: string;
      drafts: string;
    };
  };
  changelog: {
    note: string;
    empty: string;
    limit: (n: number) => string;
    /** 最新那条提交旁的标记（参考项目首页那枚「NEW」） */
    newTag: string;
  };
  inventory: {
    labels: { posts: string; groups: string; tags: string; categories: string; langs: string };
    note: string;
  };
  reading: {
    lead: string;
    sample: string;
    before: string;
    after: string;
    counts: (counts: TypographyCounts) => string;
    rulesLabel: string;
    rules: string[];
    featuresLabel: string;
    features: string[];
  };
  themes: { lead: string; demo: string };
  fonts: { lead: string; sample: string; custom: string };
}

const ZH: HomeText = {
  indexLabel: "首页八栏",
  indexNote: "8 栏",
  blocks: {
    intro: { title: "本站介绍", kicker: "开场" },
    posts: { title: "文章", kicker: "先读这几篇" },
    stats: { title: "数据统计", kicker: "写了多少" },
    changelog: { title: "更新日志", kicker: "最近几条提交" },
    inventory: { title: "站内内容", kicker: "有几类东西" },
    reading: { title: "阅读改善", kicker: "为读中文做的调整" },
    themes: { title: "外观切换", kicker: "纸 / 亮 / 暗" },
    fonts: { title: "字体设置", kicker: "字体 / 宽度 / 字号 / 行距" },
  },
  intro: {
    body: "这个网站是我的笔记本，我的数据库。这里大量使用文字，很少有图片与视频；文章以 Markdown 手写，全部由作者本人写。",
    entries: "从这里开始",
    rss: "订阅 RSS",
    note: "站内链接的可用性只有一个事实来源（lib/site.ts 的 ROUTES）：还没做的页面渲染成不可点，不留会 404 的死链。",
  },
  posts: {
    count: (n) => `按时间倒序、置顶优先，本栏显示 ${n} 篇`,
    empty: "文章与笔记-展示在此",
  },
  stats: {
    note: "数字来自构建期：每次部署重新算一遍，所以这是「仓库此刻有多少字」，不是访问量。",
    analytics:
      "编辑此处：想统计访问量的话，纯静态站需要接一个外部服务（例如 Cloudflare Web Analytics，或自建一个计数器），把脚本加在这一栏里。",
    labels: {
      words: "累计字数",
      reading: "累计阅读（分钟）",
      first: "首次发布",
      last: "最近更新",
      built: "本次构建",
      drafts: "草稿（未发布）",
    },
  },
  changelog: {
    note: "构建期取一次：先试 GitHub API，读不到再退回本机 git 历史（不含合并提交）。每一行点开是这条提交在 GitHub 上的页面 —— 也是「这个站还在长」的证据。",
    empty: "两个来源都拿不到（构建环境里没有 .git，GitHub API 也不通）—— 这一栏留空，不影响其它内容。",
    limit: (n) => `最近 ${n} 条`,
    newTag: "新",
  },
  inventory: {
    labels: {
      posts: "文章",
      groups: "专题（笔记）",
      tags: "标签",
      categories: "题材（分类）",
      langs: "语言",
    },
    note: "「笔记」目前对应卡组：content/<lang>/posts/ 下带 _index.md 的目录（专题）。要真正的短笔记型内容，得另加一种目录类型，说一声即可。",
  },
  reading: {
    lead: "中文排版在渲染时自动优化，四条规则都在 lib/typography.ts 里；代码、公式、链接地址一律跳过。",
    sample: "他在2024年写下第一篇笔记,saying that 42%的灵感来自...读书(大概)。",
    before: "优化前（作者写下的原文）",
    after: "优化后（渲染时自动改的）",
    counts: (counts) =>
      `补空格 ${counts.spaces} 处 · 标点转全角 ${counts.punctuation} 处 · 括号 ${counts.parentheses} 个 · 省略号 ${counts.ellipses} 处`,
    rulesLabel: "四条规则",
    rules: [
      "中英之间补一个空格：中文English → 中文 English",
      "半角句读转全角（只在中文语境里转）：, → ，",
      "成对的半角括号转全角（f(x) 这种函数调用不动）",
      "三个点连写转省略号：... → ……",
    ],
    featuresLabel: "这一项已经做到的",
    features: [
      "护眼纸质底色，纸 / 亮 / 暗三套外观（第 7 栏可试）",
      "正文字体四档（黑体 / 宋体 / 楷体 / 等宽，用的都是本地字体）+ 自定义（上传自己的字体文件），宽度 / 字号 / 行距各三档（第 8 栏可调）",
      "代码高亮、KaTeX 公式（含 \\ce 化学式）、五类图表按需加载",
      "打印即排版好的 PDF（Ctrl+P 存一份）",
      "RSS 订阅、离线可用（Service Worker + 离线页）",
      "悬浮目录、右侧阅读进度与圆形回顶（文章页）",
    ],
  },
  themes: {
    lead: "颜色的唯一事实来源是 app/globals.css 的三套令牌。「纸」是默认，也是没有 JS 时的外观；点一下立刻全站生效。",
    demo: "只有一件事是不可或缺的：人必须达成自我满足，不管是通过诗歌还是艺术的方式；只有这样，人才值得一看。”然而，达成自我满足至多只是一个必要条件。世界上有许多人达成了自我满足，而且，也正因为如此，他们不值得一看。",
  },
  fonts: {
    lead: "字体 / 宽度 / 字号 / 行距写的是 --reading-* 四个令牌：正文与下面这段示范用的是同一套度量，所以改完立刻生效。四档预设用的都是你设备上已有的字体，第五档「自定义」用你自己上传的字体文件 —— 无论哪一档，都不下载任何字体文件。",
    sample: "阿尔伯特·爱因斯坦Albert Einstein， E = mc² 于1905年在狭义相对论框架下提出",
    custom:
      "「自定义」那一档要你先传一份字体文件：在左下角的设置中心里选一份（woff2 / woff / ttf / otf），它只在你的浏览器里读、存本机，不上传服务器。",
  },
};

const EN: HomeText = {
  indexLabel: "Home sections",
  indexNote: "8 blocks",
  blocks: {
    intro: { title: "About this site", kicker: "Opening" },
    posts: { title: "Posts", kicker: "Start here" },
    stats: { title: "Statistics", kicker: "How much is written" },
    changelog: { title: "Changelog", kicker: "Latest commits" },
    inventory: { title: "What is inside", kicker: "Content types" },
    reading: { title: "Reading comfort", kicker: "Tuned for Chinese" },
    themes: { title: "Appearance", kicker: "Paper / light / dark" },
    fonts: { title: "Text settings", kicker: "Font / width / size / leading" },
  },
  intro: {
    body: "Edit here: two or three sentences about who this blog is for and what you write. Text only — no images, no video; every post is hand-written in Markdown.",
    entries: "Start here",
    rss: "RSS feed",
    note: "Link availability has a single source of truth (ROUTES in lib/site.ts): pages that do not exist yet render as non-clickable, so there are no dead links.",
  },
  posts: {
    count: (n) => `Newest first, pinned on top — ${n} shown in this block`,
    empty: "No posts yet — the first one is yours to write; cards appear here automatically.",
  },
  stats: {
    note: "These numbers come from the build: they are recomputed on every deploy, so this is “how much text the repo holds right now”, not traffic.",
    analytics:
      "Edit here: to count visits, a static site needs an external service (Cloudflare Web Analytics, or a counter of your own) — drop its script into this block.",
    labels: {
      words: "Words",
      reading: "Reading (min)",
      first: "First post",
      last: "Last update",
      built: "This build",
      drafts: "Drafts (unpublished)",
    },
  },
  changelog: {
    note: "Fetched once at build time: the GitHub API first, then the local git history (merges excluded). Each row opens that commit on GitHub — also evidence that the site is still growing.",
    empty: "Neither source worked (no .git in the build, and the GitHub API unreachable) — this block stays empty and nothing else is affected.",
    limit: (n) => `Latest ${n}`,
    newTag: "New",
  },
  inventory: {
    labels: {
      posts: "Posts",
      groups: "Groups (notes)",
      tags: "Tags",
      categories: "Topics",
      langs: "Languages",
    },
    note: "“Notes” currently maps to card groups: directories under content/<lang>/posts/ with an _index.md. Real short-form notes would need another content type — just ask.",
  },
  reading: {
    lead: "Chinese typography is optimised while rendering; the four rules live in lib/typography.ts and never touch code, math or link URLs.",
    /* 这一段故意是中文：四条规则只作用于中文语境，换成英文就演示不出效果了 */
    sample: "他在2024年写下第一篇笔记,saying that 42%的灵感来自...读书(大概)。",
    before: "Before (as written)",
    after: "After (rewritten while rendering)",
    counts: (counts) =>
      `${counts.spaces} space(s) inserted · ${counts.punctuation} punctuation mark(s) made full-width · ${counts.parentheses} parenthesis · ${counts.ellipses} ellipsis`,
    rulesLabel: "The four rules",
    rules: [
      "A space between Chinese and Latin or digits: 中文English → 中文 English",
      "Half-width sentence punctuation → full-width (Chinese context only): , → ，",
      "Paired half-width brackets → full-width (f(x) is left alone)",
      "Three dots become an ellipsis: ... → ……",
    ],
    featuresLabel: "What is already in place",
    features: [
      "Eye-friendly paper background, three appearance token sets (try block 7)",
      "Body font (four presets pulled from fonts on your device, plus a Custom preset that uses a font file you upload) and width / size / leading, three steps each (block 8)",
      "Code highlighting, KaTeX math (incl. \\ce chemistry), five chart types loaded on demand",
      "Print to a properly typeset PDF (Ctrl+P)",
      "RSS feed and offline support (Service Worker + offline page)",
      "Floating table of contents, reading progress and a back-to-top button (article pages)",
    ],
  },
  themes: {
    lead: "Colour has exactly one source of truth: the three token sets in app/globals.css. “Paper” is the default and what you get without JS; one click applies site-wide.",
    demo: "Edit here: this sample text is here to judge contrast in all three appearances — replace it with your own sentence.",
  },
  fonts: {
    lead: "Font / width / size / leading are the four --reading-* tokens: the body text and the sample below share the same metrics, so changes apply instantly. The four presets use fonts already on your device; the fifth, Custom, uses a font file you upload yourself — either way, nothing is downloaded.",
    sample: "Edit here: this sample re-typesets to your choice. 中文 English mixed, numbers 2024 — all visible at once.",
    custom:
      "The Custom preset needs a font file from you first: pick one (woff2 / woff / ttf / otf) in the settings panel at the bottom-left. It is read and stored inside your browser only — never uploaded.",
  },
};

export const HOME_TEXT: Record<Lang, HomeText> = { zh: ZH, en: EN };
