import type { NextConfig } from "next";

/**
 * 静态导出配置（Cloudflare Pages 用）。
 *
 * output: "export" 下可用的：Server Component、prerender 出来的 GET Route Handler
 * （必须标 `dynamic = "force-static"`）、sitemap.ts / robots.ts / manifest.ts 这些元数据约定。
 * 见 app/feed.xml、app/search-index.json、app/changelog.json、app/sitemap.ts。
 * 不可用的：rewrites / redirects / headers、依赖 Request 的动态 Route Handler、
 * 服务端图片优化（所以 images.unoptimized）。
 * 根路径 "/" 的语言跳转由 app/page.tsx 在浏览器端完成。
 */
const nextConfig: NextConfig = {
  output: "export",
  // 导出成 /zh/posts/foo/index.html 形式，静态托管更省心
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  // 站内图表库体积大，按需动态 import；这里只声明成外部资源不打包的例外（保持默认打包，便于离线 PWA）
  experimental: {
    // 大型 markdown/图表依赖只在文章页用到，摇树后仍可接受
    optimizePackageImports: ["@iconify/icons-mdi", "fuse.js"],
  },
};

export default nextConfig;
