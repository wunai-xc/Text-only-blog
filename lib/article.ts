/**
 * lib/article.ts —— 文章页的版面、文案与纯函数（第 12 项）
 *
 * 与 lib/home.ts / lib/list.ts 是同一个取舍：**这一页的事实来源只有这一个文件**。
 * 放在这里的五样东西：
 *   1. 悬浮件的阈值常量（目录里标题的缩进档、进度条与回顶的判定）；
 *   2. `articleNeighbors()`：上下篇（**没有第二份排序**：顺序完全来自 `getPosts` 的时间倒序）；
 *   3. `parseTypographyOption()`：把 frontmatter 的 `typography` 字段翻成
 *      `lib/markdown.ts` 的 `RenderOptions.typography`（第 4 项留给第 12 项的接口）；
 *   4. giscus 的常量与外观映射（评论是第三方 iframe，细节集中在这里）；
 *   5. 文案（中英各一份，缺一边 TypeScript 直接报错）。
 *
 * **零运行时依赖**：对 `lib/markdown.ts` / `lib/typography.ts` / `lib/list.ts` / `lib/site.ts`
 * 一律只用 `import type` —— 编译后整条 import 被擦掉。原因是这个文件会被**客户端组件**引入
 * （悬浮目录与进度条要读文案）：一旦值导入了 `lib/markdown.ts`，unified 那一整套插件
 * 就会被拉进浏览器包。要新的常量就在本文件里写，别把 lib/markdown.ts 的值搬进来。
 */

import type { ListPost } from "./list";
import type { TocEntry } from "./markdown";
import type { Lang } from "./site";
import type { Theme } from "./theme";
import type { TypographyOptions } from "./typography";

/* ------------------------------ 常量 ------------------------------ */

/**
 * 一篇文章都没有时用的**保留 slug**：`/<lang>/posts/__empty__/`。
 *
 * 为什么需要它：文章页是动态路由（`[...slug]`），而静态导出（`output: export`）里
 * **动态路由至少要生成一条路径**，`generateStaticParams()` 返回空数组会让构建直接失败：
 *
 *     Error: Page "/[lang]/posts/[...slug]" returned an empty array from "generateStaticParams()".
 *
 * 于是零文章时只生成这一条路径，它渲染的是「还没有文章」那一页（`emptyTitle` / `emptyLead`，
 * 正文那一句复用 `LIST_TEXT` 的空状态文案）—— 与约定第 4 条「零文章时站点必须仍能构建与浏览」
 * 是同一件事。作者写下第一篇之后，这个地址**自动消失**（那时 `generateStaticParams` 非空，
 * 不再返回它）；它也不进 sitemap、metadata 里带 `noindex`。
 *
 * 名字用双下划线开头是刻意的：内容加载器跳过下划线开头的文件，双下划线一眼就能看出
 * 「这是保留名，不是某一篇文章」。
 */
export const EMPTY_POST_SLUG = "__empty__";

/**
 * 目录里标题的缩进档：depth 1~2 不缩进、3 缩进一档、4 及更深缩进两档。
 * 用一个函数换算而不是在 CSS 里写三种 depth（`[data-depth="4"]` 之类会跟着层级变多），
 * 同时它也是「这一条要不要渲染」的开关（见 ArticleToc）。
 */
export const TOC_MAX_DEPTH = 4;

export function tocIndent(depth: number): 0 | 1 | 2 {
  if (depth <= 2) return 0;
  if (depth === 3) return 1;
  return 2;
}

/** 滚到多深才显示「回顶」按钮（一屏少一点，读完第一屏才需要它） */
export const BACK_TO_TOP_AFTER = 600;

/** 判定「当前读到哪一个小节」的那条线：视口顶部往下这么多像素（= 吸顶顶栏的下沿） */
export const TOC_ACTIVE_OFFSET = 120;

/** 拖动进度条时一次方向键跳多少个百分点（滑块必须能只用键盘走：↑/↓ 一步、PageUp/PageDown 三步、Home/End 两头） */
export const PROGRESS_KEY_STEP = 5;

/**
 * 拖动进度条时，滑块离章节节点多近就报出该节点的标题（占整页的比例，与参考稿的
 * NEAR_THRESHOLD 同值）。太小则几乎「停」不出标题，太大则一路都在跳。
 * 指尖设备没有 hover，那条路只能靠它（见 ArticleProgress）。
 */
export const PROGRESS_NEAR_THRESHOLD = 0.05;

/**
 * 判定「正文标题已经滚出视野」的线（粘性标题用它决定出现 / 消失）。
 * 与目录高亮那条 `TOC_ACTIVE_OFFSET` **同值** —— 两者要的都是「吸顶顶栏的下沿」，
 * 只是用途不同（一个高亮小节、一个挂标题）。分成两个名字是为了读代码时不别扭，数只有一个。
 */
export const STICKY_TITLE_OFFSET = TOC_ACTIVE_OFFSET;

/** giscus 的地址与来源（主题变化时要用它做 postMessage 的白名单） */
export const GISCUS_SCRIPT_SRC = "https://giscus.app/client.js";
export const GISCUS_ORIGIN = "https://giscus.app";

/**
 * 外观 → giscus 内置主题名。三套外观映射到它自带的两种：
 * 「纸」是浅色，归 light；「亮」也是浅色；「暗」用 dark。
 * 想换成别的（`noborder_light`、`transparent_dark` 之类）改这一张表即可。
 */
export const GISCUS_THEMES: Record<Theme, string> = {
  paper: "light",
  light: "light",
  dark: "dark",
};

/** 站内路径 → giscus 讨论的标题（列表页的 `?tag=` 会被去掉，同一篇文章始终是同一个 term） */
export function commentsTerm(href: string): string {
  return href.split(/[?#]/)[0] ?? href;
}

/* ------------------------------ 上下篇 ------------------------------ */

export interface ArticleNeighbors {
  /** 时间更**新**的一篇（列表里在它前面）；没有就是 null */
  newer: ListPost | null;
  /** 时间更**旧**的一篇（列表里在它后面）；没有就是 null */
  older: ListPost | null;
}

/**
 * 上下篇。
 *
 * 传入的 `posts` 是 `getPosts(lang)` 的直接结果（**时间倒序**），所以「上/下」这件事
 * 只在这个函数里解释一次，不在页面里再排一遍：
 *   - `older`（上一篇）= 列表里它后面那篇；
 *   - `newer`（下一篇）= 列表里它前面那篇。
 * 页面上两个方向都带着日期，所以「上/下」不会读错。
 */
export function articleNeighbors(posts: ListPost[], slug: string): ArticleNeighbors {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index < 0) return { newer: null, older: null };
  return {
    newer: index > 0 ? posts[index - 1] : null,
    older: index + 1 < posts.length ? posts[index + 1] : null,
  };
}

/* --------------------------- frontmatter: typography --------------------------- */

/** 宽松的布尔：`true` / `"true"` / `1` / `"是"` 都算真（与 lib/frontmatter.ts 的口径一致） */
function looseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const text = value.trim().toLowerCase();
    if (["true", "yes", "on", "1", "是", "开"].includes(text)) return true;
    if (["false", "no", "off", "0", "否", "关"].includes(text)) return false;
  }
  return undefined;
}

function nonEmptyObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * frontmatter 的 `typography` → `renderMarkdown` 的选项（规范见 content/README.md 第 9 节）：
 *
 *   typography: false                        → 整块关掉
 *   typography: { spacing: false }           → 只关某几条
 *   没写                                     → 返回 undefined（渲染层默认四条全开）
 *
 * 返回 `undefined` 与返回 `false` 是两件事：前者「没说」，后者「说了要关」。
 */
export function parseTypographyOption(value: unknown): TypographyOptions | false | undefined {
  if (value === undefined || value === null) return undefined;

  const asBoolean = looseBoolean(value);
  if (asBoolean !== undefined) return asBoolean ? {} : false;

  if (!nonEmptyObject(value)) return undefined;

  const options: TypographyOptions = {};
  const spacing = looseBoolean(value.spacing);
  const punctuation = looseBoolean(value.punctuation);
  const parentheses = looseBoolean(value.parentheses);
  if (spacing !== undefined) options.spacing = spacing;
  if (punctuation !== undefined) options.punctuation = punctuation;
  if (parentheses !== undefined) options.parentheses = parentheses;

  // 一个可识别的开关都没写（比如 typography = { typo = false } 这种笔误）就当没说
  return Object.keys(options).length > 0 ? options : undefined;
}

/* ------------------------------ 文案 ------------------------------ */

export interface ArticleText {
  /** 页头小字（图签编号之后那句） */
  kicker: string;
  /** 零文章时那条保留路径（`EMPTY_POST_SLUG`）的标题与说明 */
  emptyTitle: string;
  emptyLead: string;
  updated: (date: string) => string;
  minutes: (n: number) => string;
  words: (n: number) => string;
  tagsLabel: string;
  categoriesLabel: string;

  tocLabel: string;
  tocNote: string;
  tocEmpty: string;
  /** 目录开关（左上角那颗挂件）的两句 aria-label / title */
  tocExpand: string;
  tocCollapse: string;

  progressLabel: string;
  /** 进度条的悬停说明：它现在是个**滑块**（能拖、也能用方向键） */
  progressHint: string;
  /** 轨道上那列章节方块（一组按钮）的名字 */
  progressSections: string;
  backToTop: string;

  pagerLabel: string;
  /** 时间更早的那一篇 */
  older: string;
  /** 时间更新的那一篇 */
  newer: string;

  commentsTitle: string;
  commentsNote: string;
  commentsSetup: string;
  commentsLoading: string;
  commentsUnavailable: string;
}

const ZH: ArticleText = {
  kicker: "正文",
  emptyTitle: "还没有文章",
  emptyLead:
    "这是「一篇文章都没有」时的占位页：文章页是动态路由，静态导出要求它至少生成一条路径（空数组会让构建直接失败），所以这里暂时用这个保留地址顶着。写下第一篇、放进 content/zh/posts/ 之后，这个地址会自动消失。",
  updated: (date) => `改于 ${date}`,
  minutes: (n) => `${n} 分钟`,
  words: (n) => `${n} 字`,
  tagsLabel: "标签",
  categoriesLabel: "分类",

  tocLabel: "目录",
  tocNote: "点标题跳过去；标题与正文一样，会跟着阅读偏好变宽变窄。",
  tocEmpty: "这一篇没有小节标题。",
  tocExpand: "展开目录",
  tocCollapse: "收起目录",

  progressLabel: "阅读进度",
  progressHint: "拖动跳到任意位置（也可以用方向键）",
  progressSections: "章节跳转",
  backToTop: "回到顶部",

  pagerLabel: "上下篇",
  older: "上一篇",
  newer: "下一篇",

  commentsTitle: "评论",
  commentsNote:
    "评论由 giscus 提供（GitHub Discussions），滑到这一节才会加载 giscus.app 的 iframe —— 不读评论就不会连过去。",
  commentsSetup:
    "编辑此处：评论还没接上。到 giscus.app 生成配置后，把 appId / repoId / categoryId 填进 lib/site.ts 的 COMMENTS，这一节就会自动变成 GitHub Discussions 的评论区。",
  commentsLoading: "正在加载评论……",
  commentsUnavailable: "评论没能加载（可能是网络或浏览器插件拦了第三方 iframe）；正文不受影响。",
};

const EN: ArticleText = {
  kicker: "Article",
  emptyTitle: "No posts yet",
  emptyLead:
    "This is the placeholder for the zero-post case: the article route is dynamic, and a statically exported dynamic route must generate at least one path (an empty array fails the build), so this reserved URL stands in for now. It disappears on its own once the first post lands in content/en/posts/.",
  updated: (date) => `updated ${date}`,
  minutes: (n) => `${n} min`,
  words: (n) => `${n} words`,
  tagsLabel: "Tags",
  categoriesLabel: "Topics",

  tocLabel: "Contents",
  tocNote: "Click to jump; the headings follow your reading width just like the body.",
  tocEmpty: "This post has no section headings.",
  tocExpand: "Show contents",
  tocCollapse: "Hide contents",

  progressLabel: "Reading progress",
  progressHint: "Drag to jump anywhere (arrow keys work too)",
  progressSections: "Jump to section",
  backToTop: "Back to top",

  pagerLabel: "Previous and next",
  older: "Previous",
  newer: "Next",

  commentsTitle: "Comments",
  commentsNote:
    "Comments are powered by giscus (GitHub Discussions). The giscus.app iframe only loads when you scroll down to this section — if you never read the comments, nothing is fetched from there.",
  commentsSetup:
    "Edit here: comments are not wired up yet. Generate a config on giscus.app and fill appId / repoId / categoryId into COMMENTS in lib/site.ts; this section then becomes a GitHub Discussions thread.",
  commentsLoading: "Loading comments…",
  commentsUnavailable:
    "Comments could not load (network, or an extension blocking third-party iframes). The article itself is unaffected.",
};

export const ARTICLE_TEXT: Record<Lang, ArticleText> = { zh: ZH, en: EN };

/** 目录是嵌套的（`TocEntry` 自己套自己）；这个类型只是给组件签名用的别名 */
export type ArticleToc = TocEntry[];
