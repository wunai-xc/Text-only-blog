import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleBody from "@/components/ArticleBody";
import ArticleExport from "@/components/article/ArticleExport";
import ArticlePager from "@/components/article/ArticlePager";
import ArticleProgress from "@/components/article/ArticleProgress";
import ArticleStickyTitle from "@/components/article/ArticleStickyTitle";
import ArticleToc from "@/components/article/ArticleToc";
import GiscusComments from "@/components/article/GiscusComments";
import ReadingHeader from "@/components/article/ReadingHeader";
import PostCard from "@/components/list/PostCard";
import {
  ARTICLE_TEXT,
  DOCS_ARTICLE_TEXT,
  EMPTY_POST_SLUG,
  articleNeighbors,
  parseTypographyOption,
} from "@/lib/article";
import {
  getCardGroup,
  getCardGroupRoutes,
  getPost,
  getPostSource,
  getPostWithBody,
  getPosts,
  type CardGroupMeta,
  type Collection,
} from "@/lib/content";
import { decorate } from "@/lib/decor";
import { asBoolean } from "@/lib/frontmatter";
import { LIST_TEXT, facetHref, groupHref, groupTitle, toListPost } from "@/lib/list";
import { renderMarkdown } from "@/lib/markdown";
import { feedAlternatesTypes, SITE } from "@/lib/site";

/**
 * 文章 / 资料正文页与卡组页的共用实现
 *
 * `collection` 决定内容根目录、链接前缀与 canonical；文章页与资料页各自只保留
 * 一条薄薄的 route 文件（generateStaticParams / metadata / default）。
 */
export function articleStaticParams(collection: Collection): { slug: string[] }[] {
  const params = [
    ...getPosts(collection).map((post) => ({ slug: post.slug.split("/") })),
    ...getCardGroupRoutes(collection).map((group) => ({ slug: group.slug.split("/") })),
  ];
  return params.length > 0 ? params : [{ slug: [EMPTY_POST_SLUG] }];
}

export async function articleMetadata(collection: Collection, slugPath: string): Promise<Metadata> {
  const post = getPost(collection, slugPath);
  if (!post) {
    if (slugPath === EMPTY_POST_SLUG) {
      const t = collection === "docs" ? DOCS_ARTICLE_TEXT : ARTICLE_TEXT;
      return {
        title: t.emptyTitle,
        description: t.emptyLead,
        robots: { index: false, follow: false },
      };
    }

    const group = getCardGroup(collection, slugPath);
    if (group) {
      return {
        title: groupTitle(group),
        description: group.description || LIST_TEXT.groups.pageNote,
        alternates: {
          canonical: groupHref(collection, group.slug),
          types: feedAlternatesTypes(),
        },
      };
    }
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    keywords: [...post.tags, ...post.categories],
    // ⚠️ 页面自己写了 alternates，根布局里那份 RSS 发现表就会被整体覆盖 —— 所以带上它
    alternates: { canonical: post.href, types: feedAlternatesTypes() },
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

export async function ArticleRoute({
  collection,
  slug: slugPath,
}: {
  collection: Collection;
  slug: string;
}) {
  const data = getPostWithBody(collection, slugPath);
  if (!data) {
    // 零文章时 `generateStaticParams` 保的那条保留路径
    //（`dynamicParams = false`，别的未知 slug 根本不会被生成，是交给 out/404.html 的）
    if (slugPath === EMPTY_POST_SLUG) return <EmptyArticlePage collection={collection} />;

    // 不是一篇文章，那就看它是不是一个卡组（目录）：是就渲染卡组页。
    // 「先文章、后卡组」的顺序是有意的 —— `notes/index.md` 那种目录首页的写法
    // 与目录 `notes/` 共用同一个地址，正文优先（见 lib/content.ts 的 getCardGroupRoutes）。
    const group = getCardGroup(collection, slugPath);
    if (group) return <CardGroupPage collection={collection} group={group} />;

    notFound();
  }

  const { meta, body } = data;
  const t = collection === "docs" ? DOCS_ARTICLE_TEXT : ARTICLE_TEXT;
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

  // 上下篇只在「同一组」里走（未分组也算一组，见 articleNeighbors）；这里顺便把 about 排除掉 ——
  // 「关于」是一页说明，不该出现在任何一篇的上一篇 / 下一篇里，也不该被谁串上。
  const posts = getPosts(collection, { includeAbout: false }).map(toListPost);
  const { older, newer } = articleNeighbors(posts, meta.slug);

  // 「下载 .md」给的是源文件原文（含 frontmatter，见 getPostSource）；取不到就退回渲染用的正文。
  // 文件名取 slug 的末段 —— slug 已被 assertUrlSafeSlug 约束为 ASCII，做文件名是安全的。
  const source = getPostSource(collection, meta.slug) ?? body;
  const downloadName = `${meta.slug.split("/").pop() ?? meta.slug}.md`;

  /** frontmatter 的 `comments`（缺省 true）：某一篇不想开评论就写 comments: false */
  const commentsEnabled = asBoolean(meta.frontmatter.comments ?? meta.frontmatter.comment, true);
  const date = meta.date.slice(0, 10);
  // 徽章上的小字跟着**卡片**走（「一份实现」那一条）：草稿 / AI 这两个词就是卡片上的那两个
  const badges = LIST_TEXT.card;

  return (
    <main className="page article-page">
      <ArticleToc collection={collection} toc={rendered.toc} older={older} newer={newer} />
      {/* 进度条也读同一份目录：轨道上那列章节方块就是它的第二形态（点一下跳到那一节） */}
      <ArticleProgress collection={collection} toc={rendered.toc} />
      {/* 阅读时顶栏自动收起、双击呼出（只写 <html> 的一个属性，样式在 globals.css 的 6b） */}
      <ReadingHeader />

      <article className="article" id="article-main">
        {/* 粘性标题（第 12 项）：零高、贴在 <article> 里，标题滚出视野后在顶栏下面挂一条 ——
            左边篇名、右边正在读的那一小节（小节名与目录高亮、进度条方块同一份判定） */}
        <ArticleStickyTitle collection={collection} title={meta.title} toc={rendered.toc} />

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

          <div className="article-tools">
            {meta.tags.length + meta.categories.length > 0 ? (
              <p className="article-chips">
                {meta.tags.map((tag: string) => (
                  <a className="article-chip" key={`tag-${tag}`} href={facetHref("tag", tag)}>
                    #{tag}
                  </a>
                ))}
                {meta.categories.map((category: string) => (
                  <a
                    className="article-chip"
                    data-kind="category"
                    key={`cat-${category}`}
                    href={facetHref("cat", category)}
                  >
                    {category}
                  </a>
                ))}
              </p>
            ) : null}

            {/* 导出（下载 .md / 打印存 PDF）：客户端组件，两个按钮都在浏览器里做事。
                靠右站：`.article-tools` 是两端对齐，它自己再用 margin-left: auto 顶到右边 */}
            <ArticleExport
              collection={collection}
              markdown={source}
              filename={downloadName}
              title={meta.title}
            />
          </div>
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
          <ArticlePager collection={collection} older={older} newer={newer} variant="full" />
        </footer>
      </article>

      <GiscusComments href={meta.href} enabled={commentsEnabled} />
    </main>
  );
}

/**
 * 零文章时那条保留路径（`/posts/__empty__/`）渲染的内容，见 `EMPTY_POST_SLUG`。
 *
 * 刻意**不带**悬浮目录、进度条、回顶与评论区 —— 它不是一篇文章，那四样在这里没有意义；
 * 外壳仍用文章页那一套类，所以宽度照样跟着 `--reading-*` 走（约定第 8 条）。
 * 文案分两处取，都是复用而不是重写：标题与说明在 `ARTICLE_TEXT`（这一页的事实来源），
 * 「还没有文章」那两句直接取列表页的 `LIST_TEXT` —— 同一句话不写第二遍。
 */
function EmptyArticlePage({ collection }: { collection: Collection }) {
  const t = collection === "docs" ? DOCS_ARTICLE_TEXT : ARTICLE_TEXT;
  const list = LIST_TEXT;
  const href = `/${collection}/${EMPTY_POST_SLUG}/`;

  return (
    <main className="page article-page">
      <article className="article" id="article-main">
        <header className="article-head">
          <p className="article-kicker">
            <span className="article-no">{decorate(href).sheet}</span>
            {t.kicker}
            <span className="article-rule" />
          </p>
          <h1 className="article-title">{t.emptyTitle}</h1>
          <p className="article-lead">{t.emptyLead}</p>
        </header>

        <div className="panel list-empty">
          <p>{list.empty}</p>
          <p className="list-hint">{list.emptyHint}</p>
        </div>

        <footer className="article-foot">
          <a className="site-tagline-link" href={`/${collection}/`}>
            {list.title} →
          </a>
        </footer>
      </article>
    </main>
  );
}

/**
 * 卡组页（`/posts/notes/`、`/docs/atomic-energy-for-military-purposes/`）—— 一个目录（有 `_index.md`，或只是里面有文章）自己的页面。
 *
 * 为什么需要它：列表页把文章按卡组分块显示之后，组头得有个能点的地方；
 * 而且站长在地址栏敲 `/posts/notes/`（目录名）是很自然的动作 ——
 * 以前那里是 404，现在它是这个卡组的家。
 *
 * 它**只做「清单」这件事**：组名 / 说明 / 封面 + 组内卡片（复用 `PostCard`，
 * 与列表页、首页第 2 栏同一个组件，约定第 9 条）。所以它没有悬浮目录、进度条、
 * 评论区 —— 那些是正文页的东西（第 12 项）。文章仍然要进正文页读。
 *
 * 密度写死「适中」：密度是本机偏好（localStorage 的 `tob:list-density`），
 * 构建期读不到，硬猜一个不如用默认那一档（与首页第 2 栏同一个取舍）。
 */
function CardGroupPage({ collection, group }: { collection: Collection; group: CardGroupMeta }) {
  const t = LIST_TEXT;
  const href = groupHref(collection, group.slug);
  const posts = group.posts.map(toListPost);

  return (
    <div className="page list-page">
      <header className="list-head">
        <p className="list-kicker">
          <span className="list-no">{decorate(href).sheet}</span>
          {t.groups.kicker}
          <span className="list-rule" />
        </p>
        <h1 className="list-title">{groupTitle(group)}</h1>
        <p className="list-lead">{group.description || t.groups.pageNote}</p>
        <p className="list-meta">
          {t.groups.count(group.count)}
          {" · "}
          <a className="site-tagline-link" href={`/${collection}/`}>
            {t.groups.backAll}
          </a>
        </p>
        {/* 组封面（`_index.md` 的 cover，缺省时退回组内第一篇的封面）：没有就不渲染 */}
        {group.cover ? (
          <img className="list-group-cover" src={group.cover} alt="" loading="lazy" />
        ) : null}
      </header>

      <div className="list">
        <div className="list-grid" data-density="cozy">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} density="cozy" />
          ))}
        </div>
      </div>
    </div>
  );
}
