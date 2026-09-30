import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FacetIndex from "@/components/pages/FacetIndex";
import { PAGES_TEXT } from "@/lib/pages";
import { feedAlternatesTypes, isLang } from "@/lib/site";

/**
 * 标签页（第 13 项）：`/zh/tags/` 与 `/en/tags/`
 *
 * 这一页只是个薄壳：页面本体在 `components/pages/FacetIndex.tsx`（与分类页共用一份实现），
 * 数据来自第 2 项的 `getTaxonomy`（构建期算好，服务端渲染）。这里只负责 metadata。
 *
 * `generateStaticParams` 由 `app/[lang]/layout.tsx` 提供（两语言），和列表页 / 文章页同一个机制；
 * 认不出的语言交给 404。
 *
 * ⚠️ 页面自己写了 `alternates`，根布局那份 RSS 发现表会被整体覆盖 —— 所以带上
 * `feedAlternatesTypes()`（第 5 项记下的坑，第 10 / 12 项都按这条办过）。
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const t = PAGES_TEXT[lang].tags;
  return {
    title: t.title,
    description: t.lead,
    alternates: {
      canonical: `/${lang}/tags/`,
      languages: { zh: "/zh/tags/", en: "/en/tags/", "x-default": "/zh/tags/" },
      types: feedAlternatesTypes(),
    },
  };
}

export default async function LangTags({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return <FacetIndex lang={lang} kind="tag" />;
}
