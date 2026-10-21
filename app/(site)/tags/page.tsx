import type { Metadata } from "next";

import FacetIndex from "@/components/pages/FacetIndex";
import { PAGES_TEXT } from "@/lib/pages";
import { feedAlternatesTypes } from "@/lib/site";

/**
 * 标签页（第 13 项）：`/tags/`
 *
 * 这一页只是个薄壳：页面本体在 `components/pages/FacetIndex.tsx`（与分类页共用一份实现），
 * 数据来自第 2 项的 `getTaxonomy`（构建期算好，服务端渲染）。这里只负责 metadata。
 *
 * ⚠️ 页面自己写了 `alternates`，根布局那份 RSS 发现表会被整体覆盖 —— 所以带上
 * `feedAlternatesTypes()`（第 5 项记下的坑，第 10 / 12 项都按这条办过）。
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = PAGES_TEXT.tags;
  return {
    title: t.title,
    description: t.lead,
    alternates: {
      canonical: "/tags/",
      types: feedAlternatesTypes(),
    },
  };
}

export default async function TagsPage() {
  return <FacetIndex kind="tag" />;
}
