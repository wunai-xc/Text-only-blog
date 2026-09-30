import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostList from "@/components/list/PostList";
import { getPosts, getTaxonomy } from "@/lib/content";
import { decorate } from "@/lib/decor";
import { toListPost, yearsOf, type ListFacets } from "@/lib/list";
import { PAGES_TEXT } from "@/lib/pages";
import { SEARCH_INDEX_VERSION } from "@/lib/search-index";
import { feedAlternatesTypes, isLang } from "@/lib/site";

/**
 * 搜索页（第 13 项）：`/zh/search/` 与 `/en/search/`
 *
 * ⚠️ 这一页**没有第二份搜索实现**：它渲染的就是列表页那个组件
 * （`components/list/PostList.tsx`，只多传一个 `autoFocusSearch`）。
 * 理由写在约定第 9 条里 —— 搜索 / 筛选 / 密度的规则只有在 `lib/list.ts` + `PostList`
 * 这一处实现，第 13 项不另写一份「搜索页专用」的检索逻辑（那样两边的字段与权重迟早会不一样）。
 *
 * 与列表页的差别只有三处：
 *   1. 页头与文案（`lib/pages.ts` 的 `search`）—— 这一页要讲清楚「索引是构建期生成的、
 *      断网也能搜、第一次输入才去读它」；
 *   2. 搜索框自动获得光标（列表页不抢焦点，理由写在 PostList 的 props 注释里）；
 *   3. 图纸编号（`decorate("/zh/search/")` = 07，点阵图案），与右下角图签同一个来源。
 *
 * 数据仍然在构建期取（`getPosts` / `getTaxonomy`）：**不用搜索也能读这一页**，
 * 工具栏只是增强（约定第 4 条）。零文章时与列表页一样只出空状态，不出工具栏。
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const t = PAGES_TEXT[lang].search;
  return {
    title: t.title,
    description: t.lead,
    alternates: {
      canonical: `/${lang}/search/`,
      languages: { zh: "/zh/search/", en: "/en/search/", "x-default": "/zh/search/" },
      types: feedAlternatesTypes(),
    },
    // 搜索页自己不需要被索引（内容都在文章页上），省得爬虫把一份空壳收进去
    robots: { index: false, follow: true },
  };
}

export default async function LangSearch({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const t = PAGES_TEXT[lang].search;
  const decor = decorate(`/${lang}/search/`);
  const posts = getPosts(lang);
  const list = posts.map(toListPost);
  const facets: ListFacets = {
    tags: getTaxonomy(lang, "tags").map(({ name, count }) => ({ name, count })),
    categories: getTaxonomy(lang, "categories").map(({ name, count }) => ({ name, count })),
    years: yearsOf(list),
  };

  return (
    <div className="page list-page">
      <header className="list-head">
        <p className="list-kicker">
          <span className="list-no">{decor.sheet}</span>
          {t.kicker}
          <span className="list-rule" />
        </p>
        <h1 className="list-title">{t.title}</h1>
        <p className="list-lead">{t.lead}</p>
        <p className="list-meta">{t.note}</p>
      </header>

      {posts.length > 0 ? (
        <PostList
          lang={lang}
          posts={list}
          facets={facets}
          indexVersion={SEARCH_INDEX_VERSION}
          autoFocusSearch
        />
      ) : (
        <div className="panel list-empty">
          <p>{t.empty}</p>
          <p className="list-hint">{t.emptyHint}</p>
        </div>
      )}
    </div>
  );
}
