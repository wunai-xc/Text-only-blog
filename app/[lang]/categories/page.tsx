import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FacetIndex from "@/components/pages/FacetIndex";
import { PAGES_TEXT } from "@/lib/pages";
import { feedAlternatesTypes, isLang } from "@/lib/site";

/**
 * 分类页（第 13 项）：`/zh/categories/` 与 `/en/categories/`
 *
 * 与标签页共用一份页面本体（`components/pages/FacetIndex.tsx`，`kind="category"`），
 * 差别只有文案与「名字前面不带 #」这两处，都在 `lib/pages.ts` 里。
 *
 * 分类是比标签更粗的一档（frontmatter 的 `categories`，别名 cats / topics / series），
 * 与标签是并行的两套维度 —— 详情见 content/README.md 的字段表。
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const t = PAGES_TEXT[lang].categories;
  return {
    title: t.title,
    description: t.lead,
    alternates: {
      canonical: `/${lang}/categories/`,
      languages: { zh: "/zh/categories/", en: "/en/categories/", "x-default": "/zh/categories/" },
      types: feedAlternatesTypes(),
    },
  };
}

export default async function LangCategories({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return <FacetIndex lang={lang} kind="category" />;
}
