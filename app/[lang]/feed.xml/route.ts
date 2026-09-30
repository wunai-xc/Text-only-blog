/**
 * /{zh,en}/feed.xml —— 每语言的 RSS 订阅源（第 5 项：构建产物）
 *
 * 动态段必须配 generateStaticParams，否则静态导出会报
 * 「Dynamic Routes without generateStaticParams」（见 Next 文档 Static Exports）。
 * dynamicParams = false：只认 generateStaticParams 列出的两种语言，其它路径直接 404。
 */

import { buildRssFeed } from "@/lib/feeds";
import { isLang, LANGS } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { lang: string }[] {
  return LANGS.map((lang) => ({ lang }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
): Promise<Response> {
  const { lang } = await params;
  if (!isLang(lang)) return new Response("Not Found", { status: 404 });

  return new Response(buildRssFeed(lang), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
