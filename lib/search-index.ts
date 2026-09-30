/**
 * lib/search-index.ts —— 搜索索引（第 5 项：构建产物）
 *
 * 索引在**构建期**生成，站点上就是一个静态文件 `/search-index.json`
 * （app/search-index.json/route.ts 里 `dynamic = "force-static"`）。
 * 浏览器端用 Fuse.js 检索（第 10 项的列表页接上），没有后端、没有运行时服务。
 *
 * 为什么把正文也塞进索引：本站是纯文字博客，全文检索才有意义；
 * 但整站正文进索引会让文件很大（离线 PWA 也要预缓存它），所以每篇只取前
 * `SEARCH_BODY_LIMIT` 个字符，标题/摘要/标签则是完整的。
 * 想改这个折中，改 `SEARCH_BODY_LIMIT` 一个常量即可。
 *
 * 索引格式变了就 +1 `SEARCH_INDEX_VERSION`：列表页据此判断本地缓存的索引是否过期。
 */

import { getPostWithBody, getPosts, stripMarkdown } from "./content";
import { LANGS, type Lang } from "./site";

/** 索引结构版本；改动 SearchDoc 字段时 +1 */
export const SEARCH_INDEX_VERSION = 1;

/** 每篇正文进索引的最大字符数（去掉 Markdown 标记之后） */
export const SEARCH_BODY_LIMIT = 1200;

export interface SearchDoc {
  lang: Lang;
  slug: string;
  /** 站内路径，形如 /zh/posts/hello/ */
  href: string;
  title: string;
  description: string;
  excerpt: string;
  /** 正文纯文本，最多 SEARCH_BODY_LIMIT 个字符 */
  body: string;
  tags: string[];
  categories: string[];
  group: string;
  /** ISO 8601 */
  date: string;
  updated: string | null;
  pinned: boolean;
  isAI: boolean;
  words: number;
  readingMinutes: number;
  cover: string | null;
}

export interface SearchIndex {
  version: number;
  /** 生成时刻（ISO 8601）；纯静态站点用它显示「索引更新于」 */
  generated: string;
  /** 条目总数 */
  count: number;
  /** 可检索字段（列表页配 Fuse.js 用；顺序即默认权重顺序） */
  fields: string[];
  docs: SearchDoc[];
}

/** Fuse.js 的检索字段；列表页应当直接读索引里的 fields，别写死 */
export const SEARCH_FIELDS = [
  "title",
  "tags",
  "categories",
  "description",
  "excerpt",
  "body",
] as const;

/** 正文 → 可检索的一段纯文本（去 Markdown、压空白、截断） */
function searchableBody(markdown: string, limit = SEARCH_BODY_LIMIT): string {
  const text = stripMarkdown(markdown).replace(/\s+/g, " ").trim();
  return text.length <= limit ? text : text.slice(0, limit);
}

/** 某语言的索引条目，时间倒序（getPosts 已经排好） */
function docsFor(lang: Lang): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const meta of getPosts(lang)) {
    // 用 getPostWithBody 而不是再解析一次文件：它复用 lib/content.ts 的缓存
    const withBody = getPostWithBody(lang, meta.slug);
    docs.push({
      lang: meta.lang,
      slug: meta.slug,
      href: meta.href,
      title: meta.title,
      description: meta.description,
      excerpt: meta.excerpt,
      body: searchableBody(withBody?.body ?? ""),
      tags: meta.tags,
      categories: meta.categories,
      group: meta.group,
      date: meta.date,
      updated: meta.updated,
      pinned: meta.pinned,
      isAI: meta.isAI,
      words: meta.wordCount,
      readingMinutes: meta.readingMinutes,
      cover: meta.cover,
    });
  }

  return docs;
}

/**
 * 全部语言的搜索索引（零文章时是一份合法的空索引：count 0 / docs []）。
 * draft 在生产构建里不会出现（lib/content.ts 的默认行为）。
 */
export function buildSearchIndex(): SearchIndex {
  const docs = LANGS.flatMap((lang) => docsFor(lang));

  return {
    version: SEARCH_INDEX_VERSION,
    generated: new Date().toISOString(),
    count: docs.length,
    fields: [...SEARCH_FIELDS],
    docs,
  };
}
