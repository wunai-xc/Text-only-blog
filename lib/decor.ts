/**
 * lib/decor.ts —— 装饰层（第 8 项：装饰与动效）
 *
 * 「背景图案随路由变」这件事的事实来源就在这一个文件里：**路径 → 图纸编号 + 图案名 + 图签文字**。
 * 全是纯函数与常量表（零依赖），服务端与浏览器都能 import；真正调用它的是客户端组件
 * `components/BlueprintBackground.tsx` —— 静态导出下服务端不知道当前路径，
 * 只有客户端的 `usePathname()` 能给出（构建期那一次由 Next 自己渲染，见组件的注释）。
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

export interface Decor {
  section: DecorSection;
  pattern: DecorPattern;
  /** 图纸编号（图签上印的两位数字） */
  sheet: string;
  /** 这张图纸的语言（`/offline/` 之类没有语言段时退回站点默认语言） */
  lang: Lang;
}

/**
 * 路由 → 图案。顺序与 lib/site.ts 的 ROUTES 无关（这里按 DecorSection 排），
 * 改一张图纸的图案只动这一行。
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
    pattern: PATTERNS[section],
    sheet: SHEETS[section],
    lang: langFromPath(pathname),
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
