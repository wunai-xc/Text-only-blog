/**
 * /search-index.json —— 搜索索引（第 5 项：构建产物）
 *
 * 构建期生成，站点上就是一个静态 JSON（out/search-index.json）。
 * 浏览器端取它、交给 Fuse.js（第 10 项的列表页接上），没有后端。
 *
 * 索引格式与字段约定见 lib/search-index.ts；零文章时是合法的空索引。
 */

import { buildSearchIndex } from "@/lib/search-index";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(JSON.stringify(buildSearchIndex()), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // 静态托管上是真文件，但 dev 下也别让中间层缓存住
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
