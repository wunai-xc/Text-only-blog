/**
 * lib/decor.ts —— 装饰层（第 8 项：装饰与动效）
 *
 * 「背景图案随路由变」这件事的事实来源就在这一个文件里：**路径 → 图纸编号 + 图案名 + 图签文字**。
 * 全是纯函数与常量表（零依赖），服务端与浏览器都能 import；真正调用它的是客户端组件
 * `components/BlueprintBackground.tsx` —— 静态导出下服务端不知道当前路径，
 * 只有客户端的 `usePathname()` 能给出（构建期那一次由 Next 自己渲染，见组件的注释）。
 *
 * 本文件还是**环境色层**（第 8 项的扩展：换页时形变的大色块 + 结构覆盖）的唯一事实来源：
 * 下面 `AMBIENTS` 表给出「每一页是三块什么颜色、什么位置、什么朝向的大色块，配哪一种结构图案」，
 * 由 `components/AmbientBackdrop.tsx` 渲染成固定层（`z-index: -1`，在正文下面）。
 * **颜料值不在这个文件里**：这里只说「用 1 号颜料」，色值在三套外观的令牌里
 * （`app/globals.css` 的 `--ambient-tint-1…6`，约定第 7 条）。
 *
 * ⚠️ **背景现在是纯色**（站长的要求）：图案整套代码都还在，只是被 `DECOR_PATTERNS` 这一个
 * 开关关掉了 —— 每页拿到的都是 `plain`（什么都不画），所以纸面只有 `--c-canvas` 一个颜色。
 * 想恢复「图纸图案随路由变」，把下面那个常量改成 `true` 即可，别的都不用动。
 *
 * 图案本身画在 `app/globals.css` 的第 5 节（按 `data-decor` 选层：没有图片、没有 JS 计算，
 * 所以断网 / PWA 离线时装饰也在）。**新增一个图案 = 这里加一行 + globals.css 加一条规则**，
 * 别在组件里写 if (pathname === …)。
 *
 * 约定第 5 条：装饰层 `aria-hidden` + `pointer-events: none`，且不得影响正文可读性
 * —— 所以新图案一律 1px 线宽，颜色只许用 `--bp-line` / `--bp-line-strong`（透明度 ≤ 0.26）。
 */

import { isLang, isRouteId, SITE, type Lang, type RouteId } from "./site";

/** 图案名 —— 与 app/globals.css 里 `.blueprint[data-decor="…"]` 的取值一一对应 */
export type DecorPattern =
  | "sheet" /* 整幅图纸：细格 + 每 5 格一条粗格 + 虚线图框 */
  | "columns" /* 分栏线 + 一条虚线中轴（列表页） */
  | "measure" /* 左侧刻度尺（文章页：像在图纸上排版） */
  | "grid" /* 更密的细格，没有粗格 */
  | "dots" /* 点阵 */
  | "hatch" /* 45° 剖面线 */
  | "plain" /* 什么都不画（离线页） */;

/** 一张「图纸」是哪一页 —— RouteId 之外还有文章正文 / 离线页 / 认不出来的路径 */
export type DecorSection = RouteId | "article" | "offline" | "unknown";

/* ------------------------------------------------------------------
   环境色层（第 8 项的扩展）：**只有大色块**，没有图案、没有线格 ——
   站长明确要求「不要任何格子背景，背景干净点」，所以这一层就是几块软边的大颜色，
   随路径换位置 / 换形 / 换色，换页时**形变**成下一页的样子（不是整层换掉、不是闪一下）。
   规格写在这里，怎么画（遮罩 / 过渡曲线）全在 globals.css 第 5c 节。
   ⚠️ 往这里加「图案 / 格子 / 线」之前先问一声：那正是被否掉的东西。
   ------------------------------------------------------------------ */

/** 颜料编号 —— 对应 globals.css 的 `--ambient-tint-1…6`（三套外观各一组色值） */
export type AmbientTint = 1 | 2 | 3 | 4 | 5 | 6;

/** 一块大色块。圆心是**视口百分比**，直径是**视口长边的倍数**（60 = 0.6 个 vmax） */
export interface AmbientBlob {
  /** 颜料号（1~6）—— 色值在三套外观的令牌里，这里只说用哪一号 */
  tint: AmbientTint;
  /** 圆心横坐标（视口宽度的百分比；可以超出 0~100，让色块只露出一角） */
  x: number;
  /** 圆心纵坐标（视口高度的百分比） */
  y: number;
  /** 直径（vmax 的倍数） */
  size: number;
  /** 纵向再拉长多少（1 = 正圆，>1 = 竖椭圆） */
  stretch?: number;
  /** 旋转（度）：圆看不出旋转，椭圆看得出朝向 */
  rot?: number;
  /** 这一块自己的浓度（默认 1；0 = 这一页不用它 —— 但位置仍然写出来，
      换到下一页时它照样参与形变，不会「凭空冒出来」） */
  fade?: number;
}

export interface Ambient {
  /** **固定三块**：换页时元素不增不减，只改 transform / 颜色 / 浓度 —— 这才有「形变」 */
  blobs: [AmbientBlob, AmbientBlob, AmbientBlob];
}

/** 换页时色块形变的时长（毫秒）；**必须与 globals.css 的 `--ambient-shift` 一致** */
export const AMBIENT_SHIFT_MS = 1100;

/**
 * 色块的基准方框（vmax）。组件只写**恒定**的宽高，靠 `transform: scale()` 放大到 `size`：
 * 方框尺寸一变，遮罩就得每帧重新栅格化，手机上会发涩 —— 所以这个数不要按路由变。
 */
export const AMBIENT_BASE_VMAX = 36;

/** 换页后正文渐入的时长（毫秒）；`components/PageIntro.tsx` 用它决定何时摘掉属性，
    与 globals.css 里 `page-fade-in` 的那条动画一致 */
export const PAGE_FADE_MS = 420;

export interface Decor {
  section: DecorSection;
  pattern: DecorPattern;
  /** 图纸编号（图签上印的两位数字） */
  sheet: string;
  /** 这张图纸的语言（`/offline/` 之类没有语言段时退回站点默认语言） */
  lang: Lang;
  /** 这一页的大色块与结构图案（第 8 项扩展，见 `AMBIENTS` 与 globals.css 第 5c 节） */
  ambient: Ambient;
}

/**
 * 背景图案总开关。
 *
 * `false` = **全站纯色背景**：每一页拿到的都是 `plain`（CSS 里那一条就是
 * `background-image: none`），所以纸面只有 `--c-canvas` 一个颜色 ——
 * 没有网格、没有边缘淡出、没有虚线图框。右下角那张「图纸图签」不受这个开关影响
 * （它是内容里的装饰字，不是背景；嫌它碍眼就把 components/BlueprintBackground.tsx 里
 * 那个 `.blueprint-tag` 删掉，或给 globals.css 加一条 `.blueprint-tag { display: none }`）。
 *
 * `true` = 恢复第 8 项那套「一页一张图纸」：首页整幅网格、列表页分栏线、文章页刻度尺……
 * 图案与编号的对应表就在下面（`PATTERNS` / `SHEETS`），CSS 全在 globals.css 第 5 节，
 * 一行都没删 —— 关掉只是为了把背景做成纯色。
 */
export const DECOR_PATTERNS = false;

/**
 * 路由 → 图案。顺序与 lib/site.ts 的 ROUTES 无关（这里按 DecorSection 排），
 * 改一张图纸的图案只动这一行。
 * ⚠️ 这张表只在 `DECOR_PATTERNS` 为 `true` 时生效。
 */
const PATTERNS: Record<DecorSection, DecorPattern> = {
  home: "sheet",
  posts: "columns",
  article: "measure",
  tags: "grid",
  categories: "hatch",
  archives: "columns",
  search: "dots",
  links: "hatch",
  about: "grid",
  settings: "columns",
  offline: "plain",
  unknown: "sheet",
};

/** 路由 → 图纸编号。空号（00）留给「认不出来的路径」，编号跳号也说明少了一张图纸 */
const SHEETS: Record<DecorSection, string> = {
  home: "01",
  posts: "02",
  article: "03",
  tags: "04",
  categories: "05",
  archives: "06",
  search: "07",
  links: "08",
  about: "09",
  settings: "10",
  offline: "11",
  unknown: "00",
};

/**
 * 路由 → 环境色层（第 8 项的扩展）。
 *
 * 与 `PATTERNS` / `SHEETS` 是同一种做法（穷尽表 + 一行一页），但目的不同：
 * `PATTERNS` 决定纸上的「图纸图案」（现在被 `DECOR_PATTERNS` 关着），这一张决定
 * **正文底下那几块颜色** —— 每页一组，换页时形变过去。**这一层里没有图案**（站长的要求：
 * 不要任何格子背景），只有三块软边的大色块。
 *
 * 三条读这张表时要记住的事：
 *   1. **三块，永远三块**（元素的增删会让形变变成「跳变」，所以用不到的块写 `fade: 0.3` 那种
 *      很低的浓度，而不是删掉一行）；
 *   2. **浓度是「整层 × 这一块」两级**：整层一个 `--ambient-alpha`（三套外观各一档，
 *      见 globals.css），单块再乘 `fade`。所以这里写 0.6 只是「比别页淡一点」，不是绝对透明度；
 *   3. **文章页刻意最淡**（正文页只在两个角留一点色）：读者在这儿停留最久，装饰要让路 ——
 *      见 globals.css 里 `.ambient[data-route="article"]` 那一条。
 *
 * 「每页独特」靠的是**位置 / 大小 / 椭圆朝向 / 颜料**四样一起变（相邻的两页一定不一样）——
 * 不是靠换图案：图案那套已经被否掉了。
 */
const AMBIENTS: Record<DecorSection, Ambient> = {
  /* 01 首页：暖褐大块压左上（整页最大的一块）、陶土在右、苔绿从下沿露出来 */
  home: {
    blobs: [
      { tint: 1, x: 16, y: 18, size: 84, stretch: 1.1, rot: -16 },
      { tint: 4, x: 88, y: 32, size: 62, stretch: 0.92, rot: 22 },
      { tint: 2, x: 38, y: 98, size: 76, stretch: 1.05, fade: 0.8 },
    ],
  },
  /* 02 文章列表：两条竖长色斑贴着左右边缘（像两栏文稿纸），底下再压一块紫褐 */
  posts: {
    blobs: [
      { tint: 3, x: -8, y: 36, size: 80, stretch: 1.3 },
      { tint: 1, x: 108, y: 26, size: 68, stretch: 1.4, rot: 6 },
      { tint: 5, x: 48, y: 110, size: 72, stretch: 0.9, fade: 0.6 },
    ],
  },
  /* 03 正文：右上角一点青灰、左下角一点暖褐，第三块不用（`fade: 0`）—— 全站最安静的一页 */
  article: {
    blobs: [
      { tint: 6, x: 98, y: 6, size: 58, fade: 0.7 },
      { tint: 1, x: -6, y: 92, size: 66, stretch: 1.2, fade: 0.55 },
      { tint: 3, x: 60, y: 46, size: 40, fade: 0 },
    ],
  },
  /* 04 标签：苔绿与陶土分居左上 / 右上，青灰压在下半页 */
  tags: {
    blobs: [
      { tint: 2, x: 20, y: 12, size: 62, stretch: 1.15, rot: -10 },
      { tint: 4, x: 80, y: 20, size: 54 },
      { tint: 6, x: 52, y: 92, size: 68, stretch: 0.95, fade: 0.7 },
    ],
  },
  /* 05 分类：紫褐在左下、灰蓝在右下、苔绿从顶上露一角 */
  categories: {
    blobs: [
      { tint: 5, x: 10, y: 64, size: 72, stretch: 1.25, rot: 28 },
      { tint: 3, x: 88, y: 68, size: 58, stretch: 1.1, rot: -24 },
      { tint: 2, x: 50, y: -8, size: 58, fade: 0.65 },
    ],
  },
  /* 06 归档：左上暖褐、右下青灰、中间一块很淡的陶土 */
  archives: {
    blobs: [
      { tint: 1, x: 6, y: 14, size: 74, stretch: 1.05 },
      { tint: 6, x: 94, y: 80, size: 66 },
      { tint: 4, x: 44, y: 50, size: 46, fade: 0.3 },
    ],
  },
  /* 07 搜索：灰蓝在左下、暖褐在右上、中间几乎不留色 */
  search: {
    blobs: [
      { tint: 3, x: 26, y: 82, size: 70, stretch: 1.2, rot: 12 },
      { tint: 1, x: 76, y: 16, size: 60 },
      { tint: 6, x: 50, y: 48, size: 44, fade: 0.25 },
    ],
  },
  /* 08 友链：陶土在左上、紫褐在右侧（这一页最斜的一块）、灰蓝从底下露一角 */
  links: {
    blobs: [
      { tint: 4, x: 16, y: 22, size: 66, stretch: 1.1, rot: -12 },
      { tint: 5, x: 86, y: 54, size: 72, stretch: 1.3, rot: -32 },
      { tint: 3, x: 44, y: 106, size: 58, fade: 0.5 },
    ],
  },
  /* 09 关于：青灰在右上、苔绿在左下、中间一块很淡的暖褐 */
  about: {
    blobs: [
      { tint: 6, x: 86, y: 12, size: 68, stretch: 1.15, rot: 18 },
      { tint: 2, x: 8, y: 74, size: 64 },
      { tint: 1, x: 52, y: 44, size: 52, fade: 0.25 },
    ],
  },
  /* 10 设置：两条竖长色斑压左右边缘、紫褐从底下露一角 */
  settings: {
    blobs: [
      { tint: 3, x: -10, y: 22, size: 68, stretch: 1.25 },
      { tint: 1, x: 110, y: 72, size: 62, stretch: 1.15 },
      { tint: 5, x: 52, y: 114, size: 56, fade: 0.45 },
    ],
  },
  /* 11 离线：纸面最干净 —— 只有上下两片很淡的色 */
  offline: {
    blobs: [
      { tint: 1, x: 50, y: -12, size: 62, fade: 0.3 },
      { tint: 3, x: 50, y: 114, size: 58, stretch: 1.2, fade: 0.3 },
      { tint: 5, x: 120, y: 50, size: 40, fade: 0 },
    ],
  },
  /* 00 认不出来的路径：紫褐在左下、青灰在右上、中间一块淡灰蓝 */
  unknown: {
    blobs: [
      { tint: 5, x: 20, y: 86, size: 66, stretch: 1.15, rot: 24 },
      { tint: 6, x: 82, y: 18, size: 60 },
      { tint: 3, x: 50, y: 50, size: 48, fade: 0.35 },
    ],
  },
};

/** 去掉查询串 / 哈希 / 尾斜杠（`/zh/` 与 `/zh` 是同一张图纸） */
function normalize(pathname: string): string {
  const cut = pathname.split(/[?#]/)[0] ?? "";
  const trimmed = cut.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

function segments(pathname: string): string[] {
  return normalize(pathname).split("/").filter(Boolean);
}

/** 路径里的语言段；没有（`/offline/`、`/404.html`）就退回站点默认语言 */
export function langFromPath(pathname: string): Lang {
  const first = segments(pathname)[0];
  return first && isLang(first) ? first : SITE.defaultLang;
}

/**
 * 路径 → 图纸。语言段先摘掉（静态导出下每页都在 `/{lang}/…` 下），再看第一段：
 *   `/zh/`              → home
 *   `/zh/posts/`        → posts（列表）
 *   `/zh/posts/<slug>/` → article（正文，列表以外的任何一层）
 *   `/offline/`         → offline
 *   其它                → unknown
 */
export function sectionFromPath(pathname: string): DecorSection {
  const parts = segments(pathname);
  if (parts.length > 0 && isLang(parts[0])) parts.shift();
  if (parts.length === 0) return "home";

  const [head, ...rest] = parts;
  if (head === "offline") return "offline";
  if (!isRouteId(head)) return "unknown";
  if (head === "posts" && rest.length > 0) return "article";
  return head;
}

export function decorate(pathname: string): Decor {
  const section = sectionFromPath(pathname);
  return {
    section,
    // 图案关了（背景纯色）就给每页同一个 plain；开关见上面的 DECOR_PATTERNS
    pattern: DECOR_PATTERNS ? PATTERNS[section] : "plain",
    sheet: SHEETS[section],
    lang: langFromPath(pathname),
    // 环境色层不受 DECOR_PATTERNS 影响：它是「正文底下的颜色」，与纸上的图纸图案是两件事
    ambient: AMBIENTS[section],
  };
}

/** 图签上的编号，例如 `TOB-ZH-04`（TOB = Text-Only-Blog） */
export function decorCode(decor: Decor): string {
  return `TOB-${decor.lang.toUpperCase()}-${decor.sheet}`;
}

/** 图签上的名字：RouteId 的图纸复用导航文案（`SITE.i18n.nav`，那一排入口现在在页脚），
    其余三张在 `SITE.i18n.decor` 里 */
export function decorLabel(section: DecorSection, lang: Lang): string {
  const t = SITE.i18n[lang];
  if (section === "article" || section === "offline" || section === "unknown") {
    return t.decor[section];
  }
  return t.nav[section];
}
