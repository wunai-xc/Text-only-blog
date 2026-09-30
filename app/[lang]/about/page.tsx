import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleBody from "@/components/ArticleBody";
import { ARTICLE_TEXT, parseTypographyOption } from "@/lib/article";
import { getAboutPost, getPostWithBody } from "@/lib/content";
import { decorate } from "@/lib/decor";
import type { RenderedMarkdown } from "@/lib/markdown";
import { renderMarkdown } from "@/lib/markdown";
import { PAGES_TEXT } from "@/lib/pages";
import { feedAlternatesTypes, isLang } from "@/lib/site";

/**
 * 关于页（第 13 项）：`/zh/about/` 与 `/en/about/`
 *
 * 「关于」不是另写一份页面内容，而是**一篇文章**：第 2 项的 `getAboutPost` 取
 * frontmatter 里 `about: true` 的最新一篇（每语言各取一篇）。所以：
 *   - 正文渲染完全复用第 3 项的 `renderMarkdown` 与 `components/ArticleBody.tsx`
 *     （GFM / 公式 / 代码高亮 / 五类图表 / 参考文献 / 目录 id 都在），
 *     与文章页同一个管线 —— 不在这里写第二条渲染路径；
 *   - frontmatter 的 `typography` 字段同样接上（第 4 项留的接口，第 12 项已经用了一遍）；
 *   - 参考文献列表、`updated` 那一行小字都沿用文章页的写法（同一套 `.article-*` 类）。
 *
 * 与文章页**刻意的差别**：没有悬浮目录（关于页通常没有小节）、没有进度条与回顶
 * （它是一页说明，不是一篇长文）、没有评论区（评论跟着文章走）。
 * 没有文章时是空状态 + 怎么写的说明（约定第 2 条：需要作者补内容的地方写「编辑此处」）。
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const t = PAGES_TEXT[lang].about;
  const post = getAboutPost(lang);

  return {
    title: post?.title ?? t.title,
    description: post?.description || t.lead,
    alternates: {
      canonical: `/${lang}/about/`,
      languages: { zh: "/zh/about/", en: "/en/about/", "x-default": "/zh/about/" },
      types: feedAlternatesTypes(),
    },
  };
}

export default async function LangAbout({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const t = PAGES_TEXT[lang].about;
  const decor = decorate(`/${lang}/about/`);
  const meta = getAboutPost(lang);
  const data = meta ? getPostWithBody(lang, meta.slug) : null;

  let rendered: RenderedMarkdown | null = null;
  if (data) {
    const typography = parseTypographyOption(data.meta.frontmatter.typography);
    rendered = await renderMarkdown(data.body, {
      references: data.meta.references,
      ...(typography === undefined ? {} : { typography }),
    });
    // 「不致命但该改」的问题走构建日志（与文章页同一个口径）
    for (const warning of rendered.warnings) {
      console.warn(`[about] ${data.meta.file}：${warning}`);
    }
  }

  return (
    <div className="page about-page">
      <header className="list-head">
        <p className="list-kicker">
          <span className="list-no">{decor.sheet}</span>
          {t.kicker}
          <span className="list-rule" />
        </p>
        <h1 className="list-title">{t.title}</h1>
        <p className="list-lead">{t.lead}</p>
      </header>

      {data && rendered ? (
        <article className="article">
          <header className="article-head">
            <h1 className="article-title">{data.meta.title}</h1>
            {data.meta.description ? <p className="article-lead">{data.meta.description}</p> : null}
            <p className="article-meta">
              <span>{data.meta.date.slice(0, 10)}</span>
              {data.meta.updated ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{ARTICLE_TEXT[lang].updated(data.meta.updated.slice(0, 10))}</span>
                </>
              ) : null}
            </p>
          </header>

          <ArticleBody html={rendered.html} />

          {rendered.referencesHtml ? (
            <div
              className="article-body article-references"
              dangerouslySetInnerHTML={{ __html: rendered.referencesHtml }}
            />
          ) : null}
        </article>
      ) : (
        <div className="panel list-empty">
          <p>{t.empty}</p>
          <p className="list-hint">{t.emptyHint}</p>
        </div>
      )}
    </div>
  );
}
