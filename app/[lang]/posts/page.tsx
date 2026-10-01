import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostList from "@/components/list/PostList";
import { getCardGroups, getPosts, getTaxonomy } from "@/lib/content";
import { decorate } from "@/lib/decor";
import { LIST_TEXT, toListGroup, toListPost, yearsOf, type ListFacets } from "@/lib/list";
import { SEARCH_INDEX_VERSION } from "@/lib/search-index";
import { feedAlternatesTypes, feedHref, isLang } from "@/lib/site";

/**
 * 文章列表页（第 10 项）：/zh/posts/ 与 /en/posts/
 *
 * 这一页只做三件事，其余全在别处：
 *   1. 构建期把**这一页要用的数据**算好（文章、标签、分类、年份）—— 服务端渲染出来的 HTML 里
 *      就有完整列表，没有 JS、爬虫、离线时都能读（约定第 4 条）；
 *   2. 把数据交给 components/list/PostList.tsx（客户端：搜索 / 筛选 / 密度 / 地址栏状态）；
 *   3. 排版与文案走 lib/list.ts，页面里**不写**任何筛选逻辑与选项表。
 *
 * 几个来路：
 *   - 文章：第 2 项的 `getPosts`（时间倒序、生产构建排除草稿）；
 *   - 卡组（`content/README.md` 第 5 节）：第 2 项的 `getCardGroups`，投影成
 *     `ListGroup`（`toListGroup`）后交给客户端组件 —— **客户端拿不到 fs**，
 *     目录结构只能在服务端读；把文章按目录分块显示也因此在客户端做（只需这个投影）；
 *   - 标签 / 分类：第 2 项的 `getTaxonomy`（按出现次数倒序），这里只取「名字 + 篇数」；
 *   - 年份：`yearsOf` 从这一页的文章推出来（lib/list.ts），不另建一张表；
 *   - 图纸编号（页头那个 02）：第 8 项的 `decorate()` —— 与右下角图签同一个来源，
 *     不在这里手写数字；
 *   - 搜索索引版本：第 5 项的 `SEARCH_INDEX_VERSION` 当 props 传给客户端（客户端不能
 *     值导入 lib/search-index.ts，那会把 node:fs 拉进浏览器包）。
 *
 * 零文章时是空状态（约定第 4 条），并且**不渲染工具栏** —— 一份连文章都没有的清单上，
 * 筛选器只会让人以为点坏了。
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const t = LIST_TEXT[lang];
  return {
    title: t.title,
    description: t.lead,
    // ⚠️ 页面自己写了 alternates，根布局里那份 RSS 发现表就会被整体覆盖 —— 所以带上它
    //（地址表在 lib/site.ts 的 feedAlternatesTypes，别在页面里手抄）
    alternates: {
      canonical: `/${lang}/posts/`,
      languages: { zh: "/zh/posts/", en: "/en/posts/", "x-default": "/zh/posts/" },
      types: feedAlternatesTypes(),
    },
  };
}

export default async function LangPosts({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const t = LIST_TEXT[lang];
  const posts = getPosts(lang);
  const list = posts.map(toListPost);

  const facets: ListFacets = {
    tags: getTaxonomy(lang, "tags").map(({ name, count }) => ({ name, count })),
    categories: getTaxonomy(lang, "categories").map(({ name, count }) => ({ name, count })),
    years: yearsOf(list),
  };
  /** 卡组（目录）：`_index.md` 定的那些，加上「目录里真有文章」的那些，按 order 排 */
  const groups = getCardGroups(lang).map(toListGroup);

  return (
    <div className="page list-page">
      <header className="list-head">
        <p className="list-kicker">
          <span className="list-no">{decorate(`/${lang}/posts/`).sheet}</span>
          {t.kicker}
          <span className="list-rule" />
        </p>
        <h1 className="list-title">{t.title}</h1>
        <p className="list-lead">{t.lead}</p>
        <p className="list-meta">
          {t.total(posts.length)}
          {" · "}
          <a className="site-tagline-link" href={feedHref(lang)}>
            {t.rss}
          </a>
        </p>
      </header>

      {posts.length > 0 ? (
        <PostList
          lang={lang}
          posts={list}
          facets={facets}
          groups={groups}
          indexVersion={SEARCH_INDEX_VERSION}
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
