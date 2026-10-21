import type { Metadata } from "next";

import FacetIndex from "@/components/pages/FacetIndex";
import { PAGES_TEXT } from "@/lib/pages";
import { feedAlternatesTypes } from "@/lib/site";

/**
 * 分类页（第 13 项）：`/categories/`
 *
 * 与标签页共用一份页面本体（`components/pages/FacetIndex.tsx`，`kind="category"`），
 * 差别只有文案与「名字前面不带 #」这两处，都在 `lib/pages.ts` 里。
 *
 * 分类是比标签更粗的一档（frontmatter 的 `categories`，别名 cats / topics / series），
 * 与标签是并行的两套维度 —— 详情见 content/README.md 的字段表。
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = PAGES_TEXT.categories;
  return {
    title: t.title,
    description: t.lead,
    alternates: {
      canonical: "/categories/",
      types: feedAlternatesTypes(),
    },
  };
}

export default async function CategoriesPage() {
  return <FacetIndex kind="category" />;
}
