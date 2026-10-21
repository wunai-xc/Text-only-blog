/**
 * /feed.xml —— 全站 RSS 订阅源（第 5 项：构建产物）。
 *
 * `dynamic = "force-static"` 是静态导出的硬要求：output: "export" 下只有
 * 「静态求值」的 GET Route Handler 会被导出成文件（见 Next 文档 Static Exports）。
 * 产物是 out/feed.xml。
 */

import { buildRssFeed } from "@/lib/feeds";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildRssFeed(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
