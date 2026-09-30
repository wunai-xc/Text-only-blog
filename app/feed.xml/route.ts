/**
 * /feed.xml —— 默认语言的 RSS 订阅源（第 5 项：构建产物）
 *
 * 习惯上「一个地址订阅全站」，所以这里指向 SITE.defaultLang 的源；
 * 每语言各自的源在 /zh/feed.xml、/en/feed.xml（app/[lang]/feed.xml/route.ts）。
 *
 * `dynamic = "force-static"` 是静态导出的硬要求：output: "export" 下只有
 * 「静态求值」的 GET Route Handler 会被导出成文件（见 Next 文档 Static Exports）。
 * 产物是 out/feed.xml。
 */

import { buildRssFeed } from "@/lib/feeds";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildRssFeed(SITE.defaultLang), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
