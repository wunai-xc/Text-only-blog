"use client";

import { useEffect } from "react";

/**
 * 离线时把站内链接改成整页导航。
 *
 * 为什么需要它：Next 的客户端路由在点击 <Link> 时会额外请求 RSC 载荷，
 * 而 Service Worker 预缓存的是整页 HTML（见 public/sw.js）。断网时那条
 * RSC 请求没有缓存副本，客户端路由会停在原地；切到 location.assign 之后，
 * 浏览器直接打开已经缓存好的 HTML，正文、上下篇、列表链接都能继续走。
 *
 * 只在 navigator.onLine === false 时接管，联网时仍走 Next 的客户端导航。
 */
export default function OfflineNav() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (navigator.onLine) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      const anchor =
        target instanceof Element ? target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.hash &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      window.location.assign(url.href);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
