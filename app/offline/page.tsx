import type { Metadata } from "next";
import Link from "next/link";

/**
 * 离线兜底页（第 5 项：PWA）
 *
 * 静态导出后是 out/offline/index.html，被 public/sw.js 预缓存；
 * 导航请求断网且没有缓存副本时，Service Worker 就把这一页还给浏览器。
 *
 * 这页必须是**纯静态、零依赖**的：断网时它能用的只有已缓存的东西，
 * 所以这里不放任何需要联网的元素（图片、外链字体、统计脚本……都不要）。
 *
 * robots 里已把 /offline/ 排除，这里再加一层 noindex（双保险）。
 */
export const metadata: Metadata = {
  title: "离线",
  robots: { index: false, follow: false },
};

/** 已缓存的页面可以直接打开：外壳里预缓存了两个语言的首页 */
const CACHED_LINKS = [
  { href: "/zh/", label: "中文首页" },
  { href: "/en/", label: "English home" },
  { href: "/", label: "语言分流页 / start page" },
];

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm opacity-60">offline</p>
      <h1 className="text-2xl font-semibold tracking-tight">现在没有网络</h1>
      <p className="text-sm opacity-70">
        这一页是本地缓存下来的。已经打开过的文章通常还能看，没打开过的要等网络回来。
      </p>
      <p className="text-sm opacity-70">No network right now. This page is served from the cache.</p>

      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        {CACHED_LINKS.map((item) => (
          <li key={item.href}>
            <Link className="underline" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* 编辑此处：离线页想多说两句就写在这里（这页不是文章，属于 UI 文案） */}
    </main>
  );
}
