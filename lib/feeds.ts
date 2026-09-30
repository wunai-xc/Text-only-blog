/**
 * lib/feeds.ts —— RSS 2.0 订阅源（第 5 项：构建产物）
 *
 * 每语言一份：`/zh/feed.xml`、`/en/feed.xml`（app/[lang]/feed.xml/route.ts），
 * 另有 `/feed.xml` 指向默认语言（app/feed.xml/route.ts），方便「一个地址订阅全站」的习惯。
 *
 * 只输出 RSS 2.0（不另做 Atom / JSON Feed）：对纯文字博客够用，且所有阅读器都认。
 * 每条只给摘要 + 链接，不带全文（`content:encoded`）——
 * 全文要在这里把每篇 Markdown 都渲染一遍，构建成本换来的是阅读器里不点链接，
 * 与「让人来站点读书」的目标相反，所以不做。要改就改 `renderItems`。
 *
 * 零文章时输出合法的空 channel（有标题 / 链接 / 描述，没有 item），不会产生坏 XML。
 */

import { getPosts, type PostMeta } from "./content";
import { SITE, type Lang } from "./site";

/** RSS 里最多放多少条 */
export const FEED_LIMIT = 30;

/** 语言的 RSS 语言标签（channel 的 <language>） */
const FEED_LANGUAGE: Record<Lang, string> = {
  zh: "zh-CN",
  en: "en",
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** 去掉控制字符：XML 1.0 不允许它们，留着会让阅读器整份订阅报错 */
function sanitize(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function absolute(hrefOrPath: string): string {
  if (/^[a-z]+:\/\//i.test(hrefOrPath)) return hrefOrPath;
  return `${SITE.url}${hrefOrPath.startsWith("/") ? "" : "/"}${hrefOrPath}`;
}

/** RFC 822（RSS 的 pubDate 格式）；时间非法时退回 epoch 1970 而不是让构建失败 */
function rfc822(iso: string): string {
  const date = new Date(iso);
  return (Number.isNaN(date.getTime()) ? new Date(0) : date).toUTCString();
}

/** 站点级更新时间：取最新一篇文章的 updated/date；没有文章时退回构建时刻（1970 看着像坏了） */
function channelDate(posts: PostMeta[]): string {
  let latest = 0;
  for (const post of posts) {
    const stamp = new Date(post.updated ?? post.date).getTime();
    if (!Number.isNaN(stamp) && stamp > latest) latest = stamp;
  }
  return new Date(latest === 0 ? Date.now() : latest).toUTCString();
}

function renderItems(posts: PostMeta[]): string {
  return posts
    .map((post) => {
      const link = absolute(post.href);
      const summary = sanitize(post.description || post.excerpt);

      return [
        "    <item>",
        `      <title>${escapeXml(sanitize(post.title))}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${rfc822(post.date)}</pubDate>`,
        `      <description>${escapeXml(summary)}</description>`,
        ...post.tags.map((tag) => `      <category>${escapeXml(sanitize(tag))}</category>`),
        `      <author>${escapeXml(SITE.author)}</author>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");
}

/**
 * 生成一份 RSS 2.0 文档。
 *
 * ```ts
 * buildRssFeed("zh"); // → "<?xml version="1.0" encoding="utf-8"?>…"
 * ```
 */
export function buildRssFeed(lang: Lang, limit = FEED_LIMIT): string {
  const posts = getPosts(lang).slice(0, Math.max(0, limit));
  const self = absolute(`/${lang}/feed.xml`);
  const home = absolute(`/${lang}/`);

  const lines = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(SITE.title)}</title>`,
    `    <link>${escapeXml(home)}</link>`,
    `    <description>${escapeXml(sanitize(SITE.description))}</description>`,
    `    <language>${FEED_LANGUAGE[lang]}</language>`,
    `    <lastBuildDate>${channelDate(posts)}</lastBuildDate>`,
    `    <generator>text-only-blog</generator>`,
    `    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>`,
    renderItems(posts),
    "  </channel>",
    "</rss>",
  ];

  // 没有文章时 renderItems 返回空串，过滤掉它就不会多出一个空行
  return `${lines.filter((line) => line !== "").join("\n")}\n`;
}
