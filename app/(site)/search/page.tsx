import type { Metadata } from "next";

import PostList from "@/components/list/PostList";
import { COLLECTIONS, getCardGroups, getPosts, getTaxonomy } from "@/lib/content";
import { decorate } from "@/lib/decor";
import { toListGroup, toListPost, yearsOf, type ListFacets } from "@/lib/list";
import { PAGES_TEXT } from "@/lib/pages";
import { SEARCH_INDEX_VERSION } from "@/lib/search-index";
import { feedAlternatesTypes } from "@/lib/site";

/**
 * 搜索页（第 13 项）：`/search/`
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
 *   3. 图纸编号（`decorate("/search/")` = 07，点阵图案），与右下角图签同一个来源。
 *
 * 数据仍然在构建期取（`getPosts` / `getTaxonomy`）：**不用搜索也能读这一页**，
 * 工具栏只是增强（约定第 4 条）。零文章时与列表页一样只出空状态，不出工具栏。
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = PAGES_TEXT.search;
  return {
    title: t.title,
    description: t.lead,
    alternates: {
      canonical: "/search/",
      types: feedAlternatesTypes(),
    },
    // 搜索页自己不需要被索引（内容都在文章页上），省得爬虫把一份空壳收进去
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage() {
  const t = PAGES_TEXT.search;
  const decor = decorate("/search/");
  const posts = COLLECTIONS.flatMap((collection) => getPosts(collection));
  const list = posts.map(toListPost);
  /** 文章与资料两张清单的标签 / 分类合并计数：搜索页的结果不分集合 */
  const mergeTaxonomy = (kind: "tags" | "categories") => {
    const merged = new Map<string, number>();
    for (const collection of COLLECTIONS) {
      for (const { name, count } of getTaxonomy(kind, collection)) {
        merged.set(name, (merged.get(name) ?? 0) + count);
      }
    }
    return [...merged].map(([name, count]) => ({ name, count }));
  };
  const facets: ListFacets = {
    tags: mergeTaxonomy("tags"),
    categories: mergeTaxonomy("categories"),
    years: yearsOf(list),
  };
  /** 卡组（目录）投影：文章与资料的目录都在这里，搜索命中同样按目录分块显示 */
  const groups = COLLECTIONS.flatMap((collection) =>
    getCardGroups(collection).map(toListGroup),
  );

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
          collection="all"
          posts={list}
          facets={facets}
          groups={groups}
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
