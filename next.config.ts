import type { NextConfig } from "next";

/**
 * 静态导出配置（Cloudflare Pages 用）。
 * 注意：output: "export" 下不能用 rewrites / redirects / 图片优化 / API 路由。
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
