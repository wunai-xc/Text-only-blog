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
 * 第 6 项的蓝图背景层是纯 CSS，在离线状态下同样成立（它跟着样式表一起被缓存）。
 *
 * robots 里已把 /offline/ 排除，这里再加一层 noindex（双保险）。
 */
export const metadata: Metadata = {
  title: "离线",
  robots: { index: false, follow: false },
};

/** 已缓存的页面可以直接打开：外壳里预缓存了两个语言的首页与文章列表（见 public/sw.js） */
const CACHED_LINKS = [
  { href: "/zh/", label: "中文首页" },
  { href: "/en/", label: "English home" },
  { href: "/zh/posts/", label: "中文文章列表" },
  { href: "/en/posts/", label: "English post list" },
  { href: "/", label: "语言分流页 / start page" },
];

export default function OfflinePage() {
  return (
    <main className="page flex flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-sm text-ink-subtle">offline</p>
      <h1 className="text-2xl font-semibold tracking-tight">现在没有网络</h1>
      <p className="text-sm text-ink-muted">
        这一页是本地缓存下来的。已经打开过的文章通常还能看，没打开过的要等网络回来。
      </p>
      <p className="text-sm text-ink-muted">
        标签 / 分类 / 归档 / 关于这几页是纯清单（由构建期的数据生成），网络回来之前打不开新的一份，
        但文章地址一旦访问过就会进缓存 —— 断网时从地址栏直接敲文章地址往往也打得开。
      </p>
      <p className="text-sm text-ink-muted">
        No network right now. This page is served from the cache.
      </p>

      <ul className="panel flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        {CACHED_LINKS.map((item) => (
          <li key={item.href}>
            <Link className="text-accent underline underline-offset-2" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* 编辑此处：离线页想多说两句就写在这里（这页不是文章，属于 UI 文案） */}
    </main>
  );
}
