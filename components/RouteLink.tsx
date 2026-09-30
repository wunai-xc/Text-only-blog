import Link from "next/link";
import type { ReactNode } from "react";

import { ROUTES, SITE, routeHref, type Lang, type RouteId } from "@/lib/site";

/**
 * 「按落地状态渲染」的站内链接（第 7 项）
 *
 * 第 7 项做的是框架，第 9~13 项才做页面。为了让顶栏 / 页脚 / 首页可以一次性照**最终形态**
 * 写好，又不往站点里塞会 404 的死链，统一走这个组件：
 *
 *   - lib/site.ts 里状态是 `ready` 的 → 真正的 <Link>，正常跳转与预取；
 *   - 状态是 `pending` 的 → 不可点的 <span data-pending>，悬停提示「第 N 项落地后可点」，
 *     样式由 app/globals.css 的 `[data-pending="true"]` 统一压暗。
 *
 * 于是「这一页什么时候能点」只有一个事实来源：lib/site.ts 的 ROUTES.status。
 * 做完一项改一个字，全站的入口一起生效。
 */
export default function RouteLink({
  route,
  lang,
  className,
  children,
}: {
  route: RouteId;
  lang: Lang;
  className?: string;
  children: ReactNode;
}) {
  const entry = ROUTES[route];

  if (entry.status === "ready") {
    return (
      <Link className={className} href={routeHref(route, lang)}>
        {children}
      </Link>
    );
  }

  return (
    <span className={className} data-pending="true" title={SITE.i18n[lang].navPending(entry.item)}>
      {children}
    </span>
  );
}
