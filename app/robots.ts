import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

/**
 * robots.txt（第 5 项：构建产物）
 *
 * 静态导出下求值成 out/robots.txt。
 *
 * 禁止抓取的只有三类，都不是给人读的内容：
 *   /offline/          Service Worker 的离线兜底页（没有索引价值）
 *   /search-index.json 搜索索引（几百 KB 的数据文件，站内自己取）
 *   /changelog.json    更新日志的 JSON 副本
 * 正文、标签、归档这些页面一律允许。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/offline/", "/search-index.json", "/changelog.json"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
