"use client";

import { useEffect } from "react";

/**
 * 注册 Service Worker（第 5 项：PWA）
 *
 * 为什么是客户端组件：Service Worker 只能由浏览器自己注册，而且必须等页面加载完
 * —— 注册本身不该拖慢首屏（它跑在 load 之后，不参与 LCP）。
 *
 * 只在生产构建里注册：`next dev` 的产物每次热更新都会变，缓存住反而会看到
 * 上一个版本的页面（常见坑），所以 dev 下直接不注册。
 *
 * 卸载（返回的 cleanup）里也顺手注销：dev 下如果之前用 `npm run preview` 访问过同源，
 * 浏览器里可能已经躺着旧 SW，注销掉可以少一次「明明改了却没生效」的困惑。
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // dev：把可能存在的旧 SW 清掉（本站路径下注册过的都算）
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((item) => item.unregister())))
        .catch(() => undefined);
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error: unknown) => console.warn("[pwa] Service Worker 注册失败：", error));
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
