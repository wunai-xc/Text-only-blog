/**
 * lib/decor.ts —— 几何实体层（第 15 项：几何实体与手绘草稿）
 *
 * 「背景里的那块几何实体随路由变」这件事的事实来源就在这一个文件里：
 * **路径 → 图纸编号 + 语言 + 主实体 / 卫星的规格**，全是纯函数与常量表（零依赖），
 * 服务端与浏览器都能 import；真正渲染它的是客户端组件 `components/FigureLayer.tsx`
 * —— 静态导出下服务端不知道当前路径，只有客户端的 `usePathname()` 能给出。
 *
 * 每页一枚**主实体 + 一枚小卫星**（`FIGURES`）。元素数量恒定（用不上的写 `fade: 0`，
 * 不删行 —— 否则换页会变成「跳变」而不是「形变」）。换页时同一批 DOM 节点被赋予新规格，
 * 浏览器按 CSS 的 transition 插值过去；**颜料值不在这个文件里**：这里只说「用 1 号颜料」，
 * 色值在三套外观的令牌里（`app/globals.css` 的 `--figure-tint-1…8`）。
 *
 * 草稿线（轮廓双线 / 构造线 / 排线 / 尺寸标注）的「手绘」路径由**确定性**算法生成，种子来自路径字符串 ——
 * 见 `components/FigureLayer.tsx`；这里只描述「这一页要哪一种线、多密」。
 *
 * 约定：装饰层 `aria-hidden` + `pointer-events: none`，不得影响正文可读性、不引图片资源。
 */

import { isLang, type Lang } from "./lang";
import { isRouteId, type RouteId } from "./routes";
import { SITE } from "./site";

/** 一张「图纸」是哪一页 —— RouteId 之外还有文章正文 / 离线页 / 认不出来的路径 */
export type DecorSection = RouteId | "article" | "offline" | "unknown";

/* ------------------------------------------------------------------
   几何实体（第 15 项）：**主实体 + 小卫星**，硬边、带描边，换页时形变。
   站长这一轮的要求（原话摘）：「一眼又能看到它清晰的边框，以及它就在那里，
   切换页面时色块运动到下一个位置」「就像一块小形状不断在变化」。
   规格写在这里，怎么画（双描边 / 草稿线 / 滚动联动）全在 globals.css 第 5 节
   与 components/FigureLayer.tsx。
   ------------------------------------------------------------------ */

/** 颜料编号 —— 对应 globals.css 的 `--figure-tint-1…8`（三套外观各一组色值） */
export type FigureTint = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** 形状集合：V1 的三种（rect / bar / circle）+ V2 的三种（triangle / cross / arc）。 */
export type FigureShape = "rect" | "bar" | "circle" | "triangle" | "cross" | "arc";

/** 注解贴在这个实体的哪个角上 */
export type NoteSpot = "tl" | "tr" | "bl" | "br";

/** 草稿线：轮廓双线（V1）+ 构造线（V1）+ 排线 / 尺寸标注（V2）。 */
export interface Sketch {
  /** 沿实体边界画两条略微抖动的线 */
  contour: boolean;
  /** 中心十字 / 对角线 */
  construction: boolean;
  /** 1 = 只中心十字；2 = 再加对角线 */
  density: number;
  /** V2：45° 细排线，用实体的实心轮廓裁剪 —— 只在实体内，绝不铺到实体之外 */
  hatch?: boolean;
  /** V2：实体下方一条尺寸线 + 刻度 / 箭头，配一行尺寸文字（达芬奇图纸那种） */
  dimension?: boolean;
}

/** 一枚几何实体。圆心是**视口百分比**（vw / vh），尺寸是 vmax 的倍数。 */
export interface Figure {
  shape: FigureShape;
  /** 圆心横坐标（视口宽度的百分比；可以超出 0~100，让实体只露出一角） */
  x: number;
  /** 圆心纵坐标（视口高度的百分比） */
  y: number;
  /** 宽（vmax 的倍数） */
  w: number;
  /** 高（vmax 的倍数） */
  h: number;
  /** 朝向（度） */
  rot: number;
  /** 颜料号（1~8）—— 色值在三套外观的令牌里，这里只说用哪一号 */
  tint: FigureTint;
  /** 这一块自己的浓度（默认 1；用不上的写 0 —— 但规格仍然写出来，换页时才不会跳变） */
  fade?: number;
  /** 草稿线种类与密度 */
  sketch: Sketch;
  /** 注解位置（贴在这枚实体的角上，随它一起动） */
  note: NoteSpot;
}

/** 一页 = 一枚主实体 + 一枚小卫星（元素数量恒定） */
export interface FigurePair {
  main: Figure;
  satellite: Figure;
}

/** 换页时实体形变的时长（毫秒）；**必须与 globals.css 的 `--figure-shift` 一致** */
export const FIGURE_SHIFT_MS = 1100;

/** 卫星比主实体晚动多少（毫秒）：看起来才像「一个东西带着一个小东西走」。
    V2 把它从 120 提到 160（配合 CSS 里卫星那条带过冲的曲线，即「二阶运动」）。 */
export const FIGURE_SATELLITE_DELAY_MS = 160;

/** 滚动联动的位移上限（vh）：实体任何时刻都要有一大半留在视口里 */
export const FIGURE_SCROLL_SHIFT_VH = 8;

/** 换页后正文渐入的时长（毫秒）；`components/PageIntro.tsx` 用它决定何时摘掉属性，
    与 globals.css 里 `page-fade-in` 的那条动画一致 */
export const PAGE_FADE_MS = 420;

export interface Decor {
  section: DecorSection;
  /** 图纸编号（实体注解上印的两位数字） */
  sheet: string;
  /** 这张图纸的语言（`/offline/` 之类没有语言段时退回站点默认语言） */
  lang: Lang;
  /** 这一页的几何实体（主实体 + 卫星），见 `FIGURES` 与 globals.css 第 5 节 */
  figure: FigurePair;
}

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
 * 路由 → 几何实体（第 15 项）。
 *
 * 与 `SHEETS` 是同一种做法（穷尽表 + 一行一页）：新加一页忘了给规格，TypeScript 直接报错。
 * **每页不一样**靠**形状 / 位置 / 尺寸 / 朝向 / 颜料**五样一起变（相邻两页一定不同）；
 * **每页两枚**（主 + 卫星），元素数量恒定 —— 用不上的写 `fade: 0` 而不是删掉。
 *
 * 文章页（这一页的主角）自 2026-10-03 起是**贴左缘的朱红半圆**：原先那枚「压在正文里的竖长方形」
 * 有人反映挡读，站长改口为「换成别的图形、尽量靠边、最多进正文 1/5」——
 * 算与取舍都写在 `FIGURES.article` 上方那段注释与 PROJECTS.md §15.9。
 * 卫星同理贴右缘（原先落在正文列正中）。
 *
 * 浓度是「整层 × 这一块」两级：整层一个 `--figure-alpha`（三套外观各一档，见 globals.css），
 * 单块再乘 `fade`。所以这里写 0.8 只是「比別页淡一点」，不是绝对透明度。
 */
const FIGURES: Record<DecorSection, FigurePair> = {
  /* 01 首页：群青大长方形压左上（整页最大的一块）+ 右上角一枚青灰小圆 */
  home: {
    main: {
      shape: "rect",
      x: 18,
      y: 30,
      w: 30,
      h: 38,
      rot: -12,
      tint: 7,
      sketch: { contour: true, construction: true, density: 2 },
      note: "bl",
    },
    satellite: {
      shape: "circle",
      x: 86,
      y: 74,
      w: 14,
      h: 14,
      rot: 0,
      tint: 3,
      fade: 0.9,
      sketch: { contour: true, construction: false, density: 1 },
      note: "tr",
    },
  },
  /* 02 文章列表：贴左边缘一条青的长条（像一栏文稿纸）+ 右上角一枚芥黄小圆 */
  posts: {
    main: {
      shape: "bar",
      x: 8,
      y: 40,
      w: 8,
      h: 64,
      rot: 8,
      tint: 6,
      sketch: { contour: true, construction: true, density: 1, hatch: true },
      note: "br",
    },
    satellite: {
      shape: "circle",
      x: 90,
      y: 22,
      w: 16,
      h: 16,
      rot: 0,
      tint: 4,
      fade: 0.85,
      sketch: { contour: true, construction: false, density: 1 },
      note: "bl",
    },
  },
  /* 03 正文：**贴左缘的朱红半圆**（这一页的主角）。
     圆心就落在视口左缘（`x: 0`），一半在屏幕外，只从左边露出一块 ——
     这是 2026-10-03 的修订：原先是一枚压在正文里的竖长方形（`x: 30` / `w: 16` / `h: 54`），
     1440×900 下压住正文列宽的 25%，有人反映挡读。

     为什么是 `x: 0` + 直径 `20vmax`：
       · 约束 = **任何屏宽下最多压住正文列宽的 1/5**。正文列左缘 = `(W - C) / 2`
         （`C` = `--reading-measure`，`.article-page` 两侧各 1.5rem 内边距正好抵消），
         最坏情况是正文列吃满屏幕（窄屏，或读者把度量拖到 72rem 上限）。
         半圆右缘 = `0.1 · vmax`，代入最窄的 390×844 是 84px → 压住 60px ≈ 列宽 17.7%；
         逐屏宽扫过（含读者把宽度拖到两端）：默认设置最坏 18.4%、极端 19.8%，都在 1/5 以内。
       · **20 是上限，别再往上调**：`22vmax` 在 592×1243 就已经 20.7%，越界。
       · 之所以允许一部分移出屏幕：窄屏两侧几乎没有留白（列左缘只剩 24px），
         「完整留在屏幕内」只能把实体缩到很小；贴边 + 允许出屏是任何屏宽都成立的规则。

     `dimension` 关掉：那条尺寸线与那行文字画在实体的**左侧**（`.figure-dim` 是 `right: 100% + 1.4rem`），
     贴了左缘之后整条都在屏幕外。注解因此改挂右下角（`br`，落在留白里）而不是原来的 `bl`（那一角出屏了）。 */
  article: {
    main: {
      shape: "circle",
      x: 0,
      y: 46,
      w: 20,
      h: 20,
      rot: 0,
      tint: 1,
      sketch: { contour: true, construction: true, density: 2, hatch: true },
      note: "br",
    },
    /* 卫星同样贴边，但贴**右**缘：原先它在 `x: 50` / `y: 80`，正好落在正文列正中间。
       直径 12vmax、注解挂左下角（`bl`）—— 挂右边那一角会跟着右半边一起跑到屏幕外。 */
    satellite: {
      shape: "circle",
      x: 98,
      y: 80,
      w: 12,
      h: 12,
      rot: 0,
      tint: 3,
      fade: 0.7,
      sketch: { contour: true, construction: false, density: 1 },
      note: "bl",
    },
  },
  /* 04 标签：右上角一枚苔绿大圆（像索引纸上的色环）+ 左下角一块陶土小方 */
  tags: {
    main: {
      shape: "circle",
      x: 78,
      y: 26,
      w: 26,
      h: 26,
      rot: 0,
      tint: 5,
      sketch: { contour: true, construction: true, density: 2 },
      note: "bl",
    },
    satellite: {
      shape: "rect",
      x: 16,
      y: 70,
      w: 12,
      h: 20,
      rot: 20,
      tint: 4,
      fade: 0.9,
      sketch: { contour: true, construction: false, density: 1 },
      note: "tr",
    },
  },
  /* 05 分类：左上角一枚紫的**三角形**（V2 新形状，像一面小旗）+ 右下角一枚暖褐小圆 */
  categories: {
    main: {
      shape: "triangle",
      x: 16,
      y: 48,
      w: 22,
      h: 22,
      rot: -6,
      tint: 8,
      sketch: { contour: true, construction: true, density: 1, hatch: true },
      note: "br",
    },
    satellite: {
      shape: "circle",
      x: 70,
      y: 78,
      w: 14,
      h: 14,
      rot: 0,
      tint: 2,
      fade: 0.85,
      sketch: { contour: true, construction: false, density: 1 },
      note: "tr",
    },
  },
  /* 06 归档：右下角一条青的长横条（时间线的意思）+ 左上角一枚朱红小圆 */
  archives: {
    main: {
      shape: "bar",
      x: 60,
      y: 70,
      w: 44,
      h: 9,
      rot: -14,
      tint: 6,
      sketch: { contour: true, construction: true, density: 1 },
      note: "tl",
    },
    satellite: {
      shape: "circle",
      x: 20,
      y: 24,
      w: 12,
      h: 12,
      rot: 0,
      tint: 1,
      fade: 0.85,
      sketch: { contour: true, construction: false, density: 1 },
      note: "br",
    },
  },
  /* 07 搜索：左上角一枚芥黄**弧**（V2 新形状，半圆穹顶，像放大镜的弧）+ 右下一条青的竖条 */
  search: {
    main: {
      shape: "arc",
      x: 32,
      y: 48,
      w: 28,
      h: 24,
      rot: 0,
      tint: 4,
      sketch: { contour: true, construction: true, density: 2 },
      note: "br",
    },
    satellite: {
      shape: "bar",
      x: 74,
      y: 72,
      w: 10,
      h: 34,
      rot: 24,
      tint: 6,
      fade: 0.8,
      sketch: { contour: true, construction: false, density: 1 },
      note: "tl",
    },
  },
  /* 08 友链：右上角一枚陶土**十字**（V2 新形状，像节点）+ 左下角一枚群青小圆 */
  links: {
    main: {
      shape: "cross",
      x: 74,
      y: 48,
      w: 22,
      h: 22,
      rot: 0,
      tint: 3,
      sketch: { contour: true, construction: true, density: 1 },
      note: "tl",
    },
    satellite: {
      shape: "circle",
      x: 20,
      y: 82,
      w: 13,
      h: 13,
      rot: 0,
      tint: 7,
      fade: 0.85,
      sketch: { contour: true, construction: false, density: 1 },
      note: "tr",
    },
  },
  /* 09 关于：右下角一枚暖褐大圆 + 左上角一块紫的小方 */
  about: {
    main: {
      shape: "circle",
      x: 82,
      y: 70,
      w: 24,
      h: 24,
      rot: 0,
      tint: 2,
      sketch: { contour: true, construction: true, density: 2 },
      note: "tl",
    },
    satellite: {
      shape: "rect",
      x: 24,
      y: 20,
      w: 16,
      h: 12,
      rot: -22,
      tint: 5,
      fade: 0.9,
      sketch: { contour: true, construction: false, density: 1 },
      note: "br",
    },
  },
  /* 10 设置：贴右边缘一条朱红竖条（这一页最窄）+ 左下角一枚青小圆 */
  settings: {
    main: {
      shape: "bar",
      x: 88,
      y: 40,
      w: 7,
      h: 52,
      rot: -6,
      tint: 1,
      sketch: { contour: true, construction: true, density: 1 },
      note: "tl",
    },
    satellite: {
      shape: "circle",
      x: 12,
      y: 76,
      w: 11,
      h: 11,
      rot: 0,
      tint: 6,
      fade: 0.75,
      sketch: { contour: true, construction: false, density: 1 },
      note: "tr",
    },
  },
  /* 11 离线：纸面最干净 —— 只有上下两片很淡的实体 */
  offline: {
    main: {
      shape: "rect",
      x: 50,
      y: 40,
      w: 26,
      h: 20,
      rot: -8,
      tint: 2,
      fade: 0.5,
      sketch: { contour: true, construction: true, density: 1 },
      note: "br",
    },
    satellite: {
      shape: "circle",
      x: 50,
      y: 88,
      w: 10,
      h: 10,
      rot: 0,
      tint: 3,
      fade: 0.35,
      sketch: { contour: true, construction: false, density: 1 },
      note: "tr",
    },
  },
  /* 00 认不出来的路径：左上角一枚紫的圆 + 右下角一块陶土的长方形 */
  unknown: {
    main: {
      shape: "circle",
      x: 24,
      y: 26,
      w: 22,
      h: 22,
      rot: 0,
      tint: 5,
      sketch: { contour: true, construction: true, density: 2 },
      note: "br",
    },
    satellite: {
      shape: "rect",
      x: 78,
      y: 72,
      w: 14,
      h: 22,
      rot: 26,
      tint: 3,
      fade: 0.8,
      sketch: { contour: true, construction: false, density: 1 },
      note: "tl",
    },
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
    sheet: SHEETS[section],
    lang: langFromPath(pathname),
    figure: FIGURES[section],
  };
}

/** 实体注解上的编号，例如 `TOB-ZH-04`（TOB = Text-Only-Blog） */
export function decorCode(decor: Decor): string {
  return `TOB-${decor.lang.toUpperCase()}-${decor.sheet}`;
}

/** 实体注解上的名字：RouteId 的图纸复用导航文案（`SITE.i18n.nav`，那一排入口现在在页脚），
    其余三张在 `SITE.i18n.decor` 里 */
export function decorLabel(section: DecorSection, lang: Lang): string {
  const t = SITE.i18n[lang];
  if (section === "article" || section === "offline" || section === "unknown") {
    return t.decor[section];
  }
  return t.nav[section];
}
