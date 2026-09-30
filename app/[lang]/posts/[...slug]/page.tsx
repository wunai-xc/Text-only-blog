import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleBody from "@/components/ArticleBody";
import ArticlePager from "@/components/article/ArticlePager";
import ArticleProgress from "@/components/article/ArticleProgress";
import ArticleToc from "@/components/article/ArticleToc";
import GiscusComments from "@/components/article/GiscusComments";
import { ARTICLE_TEXT, articleNeighbors, parseTypographyOption } from "@/lib/article";
import { getPost, getPostWithBody, getPosts } from "@/lib/content";
import { decorate } from "@/lib/decor";
import { asBoolean } from "@/lib/frontmatter";
import { LIST_TEXT, facetHref, toListPost } from "@/lib/list";
import { renderMarkdown } from "@/lib/markdown";
import { feedAlternatesTypes, isLang, LANGS, SITE } from "@/lib/site";

/**
 * 文章页（第 12 项）：`/zh/posts/<slug>/`（slug 可能带目录，见 content/README.md 第 1 节）
 *
 * 这一页只做四件事，其余都在别处：
 *   1. **构建期**把这一篇读出来渲染成 HTML（`getPostWithBody` → `renderMarkdown`）——
 *      静态导出后这一页的 HTML 里就有完整正文，没有 JS、爬虫、离线时都能读（约定第 4 条）；
 *   2. 把 frontmatter 的 `typography` 接到渲染层（第 4 项留给第 12 项的接口）；
 *   3. 把目录、进度、评论交给三个客户端组件（悬浮件与第三方 iframe 只能客户端）；
 *   4. 版式与文案走 `lib/article.ts`，页面里不写文案、不排「上/下」，也不手写图纸编号。
 *
 * 几个来路：
 *   - 正文与元信息：第 2 项的 `getPostWithBody`（生产构建不含草稿）；
 *   - 渲染：第 3 项的 `renderMarkdown`（GFM / KaTeX / 高亮 / 五类图表占位 / 角标 / 目录）；
 *   - 图纸编号（页头那个 03）：第 8 项的 `decorate()`，与右下角图签同一个来源；
 *   - 上下篇：`articleNeighbors()`（lib/article.ts），顺序就是 `getPosts` 的时间倒序，
 *     这里不再排一遍；
 *   - 评论：第 12 项的 giscus（配置在 lib/site.ts 的 `COMMENTS`，没填就显示「编辑此处」）。
 *   - 标签 / 分类片的地址：`facetHref()`（lib/list.ts），与第 13 项的标签页同一个来源。
 *
 * ⚠️ 正文宽度一律由 `--reading-*` 令牌决定（约定第 8 条）：这一页的宽度是
 * `calc(var(--reading-measure) + 3rem)`（见 globals.css 的「6e. 文章页」），
 * 所以读者在设置中心把正文调窄调宽，标题、正文、上下篇、评论会一起跟着走。
 * **别在这里写死 42rem。**
 */

export function generateStaticParams() {
  return LANGS.flatMap((lang) =>
    getPosts(lang).map((post) => ({ lang, slug: post.slug.split("/") })),
  );
}

/** 静态导出：只认 `generateStaticParams` 里列出的路径，别的 slug 交给 out/404.html */
export const dynamicParams = false;

/** 跨语言配对（同一 slug 的另一种语言，用于 hreflang 与 canonical 的选用） */
function languageUrls(slug: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const lang of LANGS) {
    if (getPost(lang, slug)) languages[lang] = `/${lang}/posts/${slug}/`;
  }
  return languages;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string[] }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};

  const post = getPost(lang, slug.join("/"));
  if (!post) return {};

  const languages = languageUrls(post.slug);
  const fallback = languages[SITE.defaultLang] ?? post.href;

  return {
    title: post.title,
    description: post.description,
    keywords: [...post.tags, ...post.categories],
    // ⚠️ 页面自己写了 alternates，根布局里那份 RSS 发现表就会被整体覆盖 —— 所以带上它
    //（地址表在 lib/site.ts 的 feedAlternatesTypes，别在页面里手抄；第 5 项记下的坑）
    alternates: {
      canonical: post.href,
      languages: { ...languages, "x-default": fallback },
      types: feedAlternatesTypes(),
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: post.href,
      publishedTime: post.date,
      ...(post.updated ? { modifiedTime: post.updated } : {}),
      authors: [SITE.author],
      tags: [...post.tags, ...post.categories],
    },
  };
}

export default async function LangPost({
  params,
}: {
  params: Promise<{ lang: string; slug: string[] }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();

  const data = getPostWithBody(lang, slug.join("/"));
  if (!data) notFound();

  const { meta, body } = data;
  const t = ARTICLE_TEXT[lang];
  const decor = decorate(meta.href);

  const typography = parseTypographyOption(meta.frontmatter.typography);
  const rendered = await renderMarkdown(body, {
    references: meta.references,
    ...(typography === undefined ? {} : { typography }),
  });

  // 「不致命但该改」的问题（缺引用、公式没渲染成功、frontmatter 里 id 重复……）走构建日志，
  // 不让整篇构建失败 —— 与第 3 项的口径一致
  for (const warning of rendered.warnings) {
    console.warn(`[article] ${meta.file}：${warning}`);
  }

  const posts = getPosts(lang).map(toListPost);
  const { older, newer } = articleNeighbors(posts, meta.slug);

  /** frontmatter 的 `comments`（缺省 true）：某一篇不想开评论就写 comments: false */
  const commentsEnabled = asBoolean(meta.frontmatter.comments ?? meta.frontmatter.comment, true);
  const date = meta.date.slice(0, 10);
  // 徽章上的小字跟着**卡片**走（「一份实现」那一条）：草稿 / AI 这两个词就是卡片上的那两个
  const badges = LIST_TEXT[lang].card;

  return (
    <main className="page article-page">
      <ArticleToc lang={lang} toc={rendered.toc} older={older} newer={newer} />
      <ArticleProgress lang={lang} />

      <article className="article" id="article-main">
        <header className="article-head">
          <p className="article-kicker">
            <span className="article-no">{decor.sheet}</span>
            {t.kicker}
            <span className="article-rule" />
          </p>

          <h1 className="article-title">{meta.title}</h1>
          {meta.description ? <p className="article-lead">{meta.description}</p> : null}

          <p className="article-meta">
            <span>{date}</span>
            <span aria-hidden="true">·</span>
            <span>{t.minutes(meta.readingMinutes)}</span>
            <span aria-hidden="true">·</span>
            <span>{t.words(meta.wordCount)}</span>
            {meta.updated ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{t.updated(meta.updated.slice(0, 10))}</span>
              </>
            ) : null}
            {meta.draft ? (
              <span className="article-badge" data-badge="draft">
                {badges.draft}
              </span>
            ) : null}
            {meta.isAI ? (
              <span className="article-badge" data-badge="ai">
                {badges.ai}
              </span>
            ) : null}
          </p>

          {meta.tags.length + meta.categories.length > 0 ? (
            <p className="article-chips">
              {meta.tags.map((tag) => (
                <a className="article-chip" key={`tag-${tag}`} href={facetHref(lang, "tag", tag)}>
                  #{tag}
                </a>
              ))}
              {meta.categories.map((category) => (
                <a
                  className="article-chip"
                  data-kind="category"
                  key={`cat-${category}`}
                  href={facetHref(lang, "cat", category)}
                >
                  {category}
                </a>
              ))}
            </p>
          ) : null}
        </header>

        <ArticleBody html={rendered.html} />

        {/* 文末参考列表（第 3 项）：与正文同一套度量，所以套同一个 .article-body */}
        {rendered.referencesHtml ? (
          <div
            className="article-body article-references"
            dangerouslySetInnerHTML={{ __html: rendered.referencesHtml }}
          />
        ) : null}

        <footer className="article-foot">
          {/* 文章末尾的上下篇（`full` 档）：窄屏上悬浮目录整块不显示，所以这一份是必需的 */}
          <ArticlePager lang={lang} older={older} newer={newer} variant="full" />
        </footer>
      </article>

      <GiscusComments lang={lang} href={meta.href} enabled={commentsEnabled} />
    </main>
  );
}
