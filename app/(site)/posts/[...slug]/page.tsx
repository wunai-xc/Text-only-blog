import type { Metadata } from "next";

import { ArticleRoute, articleMetadata, articleStaticParams } from "@/components/article/ArticleRoute";

/**
 * 文章页 + 卡组页：`/posts/<slug>/`
 *
 * 正文与卡组共用同一个地址空间，实现全在 `components/article/ArticleRoute.tsx`
 * （资料页 `/docs/<slug>/` 复用同一份）。
 */
export function generateStaticParams() {
  return articleStaticParams("posts");
}

/** 静态导出：只认 `generateStaticParams` 里列出的路径，别的 slug 交给 out/404.html */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata("posts", slug.join("/"));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <ArticleRoute collection="posts" slug={slug.join("/")} />;
}
