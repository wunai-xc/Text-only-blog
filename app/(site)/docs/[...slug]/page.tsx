import type { Metadata } from "next";

import { ArticleRoute, articleMetadata, articleStaticParams } from "@/components/article/ArticleRoute";

/**
 * 资料正文页 + 卡组页：`/docs/<slug>/`
 *
 * 与文章页共用同一份实现，只把内容集合换成 content/docs。
 */
export function generateStaticParams() {
  return articleStaticParams("docs");
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata("docs", slug.join("/"));
}

export default async function DocsArticlePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <ArticleRoute collection="docs" slug={slug.join("/")} />;
}
