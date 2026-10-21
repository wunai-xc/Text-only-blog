import PostList from "@/components/list/PostList";
import { getCardGroups, getPosts, getTaxonomy, type Collection } from "@/lib/content";
import { decorate } from "@/lib/decor";
import {
  toListGroup,
  toListPost,
  yearsOf,
  type ListFacets,
  type ListText,
} from "@/lib/list";
import { SEARCH_INDEX_VERSION } from "@/lib/search-index";
import { feedHref } from "@/lib/site";
import type { Metadata } from "next";

/**
 * 列表页正文（文章 / 资料共用）
 *
 * 服务端组件：构建期把文章、标签、分类、年份与卡组算好，再交给客户端 PostList。
 * `collection` 决定内容根目录与链接前缀；`text` 只换称谓（文章 / 资料）。
 */
export function ListPage({
  collection,
  text,
  canonical,
}: {
  collection: Collection;
  text: ListText;
  canonical: string;
}) {
  /**
   * 「关于」（frontmatter 里 `about: true`）不进这张清单 —— 它不是一篇普通文章，
   * 是 `/about/` 那一页的正文（第 13 项）。它有自己的地址、自己的页头，
   * 混进「全部文章」里既多出一条重复入口，也让「共 N 篇」这个数字对不上。
   */
  const posts = getPosts(collection, { includeAbout: false });
  const list = posts.map(toListPost);

  const facets: ListFacets = {
    tags: getTaxonomy("tags", collection).map(({ name, count }) => ({ name, count })),
    categories: getTaxonomy("categories", collection).map(({ name, count }) => ({ name, count })),
    years: yearsOf(list),
  };
  /** 卡组（目录）：`_index.md` 定的那些，加上「目录里真有文章」的那些，按 order 排 */
  const groups = getCardGroups(collection).map(toListGroup);

  return (
    <div className="page list-page">
      <header className="list-head">
        <p className="list-kicker">
          <span className="list-no">{decorate(canonical).sheet}</span>
          {text.kicker}
          <span className="list-rule" />
        </p>
        <h1 className="list-title">{text.title}</h1>
        <p className="list-lead">{text.lead}</p>
        <p className="list-meta">
          {text.total(posts.length)}
          {text.rss ? (
            <>
              {" · "}
              <a className="site-tagline-link" href={feedHref()}>
                {text.rss}
              </a>
            </>
          ) : null}
        </p>
      </header>

      {posts.length > 0 ? (
        <PostList
          collection={collection}
          posts={list}
          facets={facets}
          groups={groups}
          indexVersion={SEARCH_INDEX_VERSION}
        />
      ) : (
        <div className="panel list-empty">
          <p>{text.empty}</p>
          <p className="list-hint">{text.emptyHint}</p>
        </div>
      )}
    </div>
  );
}

