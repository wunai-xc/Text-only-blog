/**
 * lib/routes.ts —— 路由表与站内导航（从 lib/site.ts 拆出）
 *
 * 一张表管到底：路径模板 + **落地状态** + 是否进导航 + 图标。
 * 顶栏、页脚、首页入口、文章卡片都读它，所以「这一页做没做」只在这里改一次，
 * 不需要去各个页面找链接。
 *
 * 零依赖（只 import 类型），服务端组件与客户端组件都能直接用。
 */

import type { IconName } from "./icons";
import type { Lang } from "./lang";

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
 * ⚠️ 改这里就能切换「待落地」标记：做完某一页，
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
 * 文章**正文页**的落地状态（列表页是 ROUTES.posts，两者不是一回事）。
 *
 * 首页与列表页的文章卡片按它决定「可点 / 不可点」，与 RouteLink 是同一个约定
 * （约定第 8 条：没有这一页就不留会 404 的链接）。正文页已落地，
 * 所以这里是 "ready" —— 所有卡片一起变成真链接，不需要去改各个卡片组件。
 */
export const ARTICLE_ROUTE: { status: "ready" | "pending"; item: number } = {
  status: "ready",
  item: 12,
};

/**
 * 字符串是不是一个 RouteId（装饰层要把路径的段落认成「哪一页」）。
 * 用 ROUTES 自己当事实来源，加一条路由这里不用改。
 */
export function isRouteId(value: string): value is RouteId {
  return Object.prototype.hasOwnProperty.call(ROUTES, value);
}

/** 站内导航（顺序即 ROUTES 里的书写顺序）。页脚的导航栏读它，顶栏不再用它 */
export const NAV: RouteId[] = (Object.keys(ROUTES) as RouteId[]).filter((id) => ROUTES[id].nav);