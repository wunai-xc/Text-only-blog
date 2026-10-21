import type { Metadata } from "next";

import { getPosts } from "@/lib/content";

/**
 * 离线兜底页（第 5 项：PWA）
 *
 * 静态导出后是 out/offline/index.html，被 public/sw.js 预缓存；
 * 导航请求断网且没有缓存副本时，Service Worker 就把这一页还给浏览器。
 *
 * 这页必须是**纯静态、零依赖**的：断网时它能用的只有已缓存的东西，
 * 所以这里不放任何需要联网的元素（图片、外链字体、统计脚本……都不要）。
 *
 * Service Worker 会把搜索索引里的全部文章页预缓存下来，所以这一页直接
 * 列出全部文章。链接刻意用原生 <a>：离线时整页导航才能命中
 * 缓存的 HTML；<Link> 会去要 RSC 载荷（见 components/OfflineNav.tsx）。
 */
export const metadata: Metadata = {
  title: "离线",
  robots: { index: false, follow: false },
};

/** 已缓存的页面可以直接打开：外壳里预缓存了首页、文章列表与资料列表（见 public/sw.js） */
const CACHED_LINKS = [
  { href: "/", label: "首页" },
  { href: "/posts/", label: "全部文章" },
  { href: "/docs/", label: "资料" },
];

export default function OfflinePage() {
  const posts = getPosts();

  return (
    <main className="page flex flex-col items-center gap-6 py-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <p className="font-mono text-sm text-ink-subtle">offline</p>
        <h1 className="text-2xl font-semibold tracking-tight">现在没有网络</h1>
        <p className="text-sm text-ink-muted">
          这一页是本地缓存下来的。全部文章已经预存到这台设备上，
          下面列出的每一篇都可以直接打开。
        </p>
      </div>

      <ul className="panel flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        {CACHED_LINKS.map((item) => (
          <li key={item.href}>
            <a className="text-accent underline underline-offset-2" href={item.href}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {posts.length > 0 ? (
        <section className="panel w-full max-w-3xl text-left">
          <p className="font-mono text-sm text-ink-subtle">
            离线可读文章 · {posts.length}
          </p>
          <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {posts.map((post) => (
              <li key={post.slug}>
                <a
                  className="text-accent underline underline-offset-2"
                  href={post.href}
                >
                  {post.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
