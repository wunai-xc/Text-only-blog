import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleBody from "@/components/ArticleBody";
import ArticlePager from "@/components/article/ArticlePager";
import ArticleProgress from "@/components/article/ArticleProgress";
import ArticleStickyTitle from "@/components/article/ArticleStickyTitle";
import ArticleToc from "@/components/article/ArticleToc";
import GiscusComments from "@/components/article/GiscusComments";
import ReadingHeader from "@/components/article/ReadingHeader";
import PostCard from "@/components/list/PostCard";
import {
  ARTICLE_TEXT,
  EMPTY_POST_SLUG,
  articleNeighbors,
  parseTypographyOption,
} from "@/lib/article";
import {
  getCardGroup,
  getCardGroupRoutes,
  getPost,
  getPostWithBody,
  getPosts,
  type CardGroupMeta,
} from "@/lib/content";
import { decorate } from "@/lib/decor";
import { asBoolean } from "@/lib/frontmatter";
import { LIST_TEXT, facetHref, groupHref, groupTitle, toListPost } from "@/lib/list";
import { renderMarkdown } from "@/lib/markdown";
import { feedAlternatesTypes, isLang, LANGS, SITE, type Lang } from "@/lib/site";

/**
 * 文章页（第 12 项）+ **卡组页**：`/zh/posts/<slug>/`（slug 可能带目录，见 content/README.md 第 1 节）
 *
 * 为什么卡组页也在这里（而不是另开一条路由）：两者共用同一个地址空间 ——
 * `notes/index.md`（目录首页）与目录 `notes/` 都会落到 `/zh/posts/notes/`，
 * 分成两条路由会直接撞车。所以这一页按「先文章、后卡组」的顺序认领：
 *   1. `getPostWithBody` 找到就渲染正文（第 12 项的四件事）；
 *   2. 找不到再看 `getCardGroup` —— 是个卡组就渲染卡组页（组名 / 说明 / 组内卡片）；
 *   3. 都不是才 `notFound()`（静态导出下等于 out/404.html）。
 *
 * 这一页只做四件事，其余都在别处：
 *   1. **构建期**把这一篇读出来渲染成 HTML（`getPostWithBody` → `renderMarkdown`）——
 *      静态导出后这一页的 HTML 里就有完整正文，没有 JS、爬虫、离线时都能读（约定第 4 条）；
 *   2. 把 frontmatter 的 `typography` 接到渲染层（第 4 项留给第 12 项的接口）；
 *   3. 把目录、粘性标题、进度（含可拖滑块与回顶进度环）、评论交给四个客户端组件，
 *      再加上阅读时收顶栏的 ReadingHeader（悬浮件与第三方 iframe 只能客户端）；
 *   4. 版式与文案走 `lib/article.ts` / `lib/list.ts`，页面里不写文案、不排「上/下」，
 *      也不手写图纸编号（卡组页的组名 / 篇数 / 卡片都复用列表页那一套）。
 *
 * 几个来路：
 *   - 正文与元信息：第 2 项的 `getPostWithBody`（生产构建不含草稿）；
 *   - 卡组页的数据：第 2 项的 `getCardGroup` / `getCardGroupRoutes`（后者同时给 sitemap 用），
 *     地址由 `lib/list.ts` 的 `groupHref()` 生成 —— 与列表页组头指向同一个地方；
 *   - 渲染：第 3 项的 `renderMarkdown`（GFM / KaTeX / 高亮 / 五类图表占位 / 角标 / 目录）；
 *   - 图纸编号（页头那个 03）：第 8 项的 `decorate()`，与右下角图签同一个来源；
 *   - 上下篇：`articleNeighbors()`（lib/article.ts），顺序就是 `getPosts` 的时间倒序，
 *     这里不再排一遍；卡组里的文章只在组内前后走，组的两头换成「全部文章」出口
 *     （那一头本来就没有邻居，现在是回列表页的链接）；
 *   - 评论：第 12 项的 giscus（配置在 lib/site.ts 的 `COMMENTS`，没填就显示「编辑此处」）。
 *   - 标签 / 分类片的地址：`facetHref()`（lib/list.ts），与第 13 项的标签页同一个来源。
 *
 * ⚠️ 正文宽度一律由 `--reading-*` 令牌决定（约定第 8 条）：这一页的宽度是
 * `calc(var(--reading-measure) + 3rem)`（见 globals.css 的「6e. 文章页」），
 * 所以读者在设置中心把正文调窄调宽，标题、正文、上下篇、评论会一起跟着走。
 * **别在这里写死 42rem。**
 */

export function generateStaticParams() {
  // 文章与卡组页共用这一条路由，所以两张表都要列出来
  //（卡组页的路由表在 lib/content.ts，sitemap 用的是同一份 —— 别在这里重推一遍）
  const params = LANGS.flatMap((lang) => [
    ...getPosts(lang).map((post) => ({ lang, slug: post.slug.split("/") })),
    ...getCardGroupRoutes(lang).map((group) => ({ lang, slug: group.slug.split("/") })),
  ]);
  if (params.length > 0) return params;

  // 一篇文章都没有时**仍然要返回一条路径**：静态导出不允许动态路由一条路由都不生成，
  // 空数组会让构建在 `Collecting page data` 阶段失败：
  //   Error: Page "/[lang]/posts/[...slug]" returned an empty array from "generateStaticParams()".
  // 所以保一条保留 slug（`EMPTY_POST_SLUG`，见 lib/article.ts），渲染成「还没有文章」那一页；
  // 作者写下第一篇之后它自动消失。默认语言的那一条就够了 —— 这条路径是构建用的占位，
  // 不是某一个语言的页面。
  return [{ lang: SITE.defaultLang, slug: [EMPTY_POST_SLUG] }];
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

/** 卡组页的跨语言配对（同一个目录在另一种语言里也有文章时才有） */
function groupLanguageUrls(slug: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const lang of LANGS) {
    if (getCardGroup(lang, slug)) languages[lang] = groupHref(lang, slug);
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

  const slugPath = slug.join("/");
  const post = getPost(lang, slugPath);
  if (!post) {
    // 零文章时那条保留路径（见 generateStaticParams）：给个说得过去的标题，
    // 并且**不让搜索引擎收** —— 它是个构建占位，不是内容
    if (slugPath === EMPTY_POST_SLUG) {
      const t = ARTICLE_TEXT[lang];
      return {
        title: t.emptyTitle,
        description: t.emptyLead,
        robots: { index: false, follow: false },
      };
    }

    // 卡组页：标题用组名（`_index.md` 没写 title 时用目录名兜底），
    // 描述优先用 `_index.md` 的 description，没有就用那一句通用说明
    const group = getCardGroup(lang, slugPath);
    if (group) {
      const t = LIST_TEXT[lang];
      const languages = groupLanguageUrls(group.slug);
      const fallback = languages[SITE.defaultLang] ?? groupHref(lang, group.slug);
      return {
        title: groupTitle(group),
        description: group.description || t.groups.pageNote,
        alternates: {
          canonical: groupHref(lang, group.slug),
          languages: { ...languages, "x-default": fallback },
          types: feedAlternatesTypes(),
        },
      };
    }
    return {};
  }

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

  const slugPath = slug.join("/");
  const data = getPostWithBody(lang, slugPath);
  if (!data) {
    // 零文章时 `generateStaticParams` 保的那条保留路径
    //（`dynamicParams = false`，别的未知 slug 根本不会被生成，是交给 out/404.html 的）
    if (slugPath === EMPTY_POST_SLUG) return <EmptyArticlePage lang={lang} />;

    // 不是一篇文章，那就看它是不是一个卡组（目录）：是就渲染卡组页。
    // 「先文章、后卡组」的顺序是有意的 —— `notes/index.md` 那种目录首页的写法
    // 与目录 `notes/` 共用同一个地址，正文优先（见 lib/content.ts 的 getCardGroupRoutes）。
    const group = getCardGroup(lang, slugPath);
    if (group) return <CardGroupPage lang={lang} group={group} />;

    notFound();
  }

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
      {/* 进度条也读同一份目录：轨道上那列章节方块就是它的第二形态（点一下跳到那一节） */}
      <ArticleProgress lang={lang} toc={rendered.toc} />
      {/* 阅读时顶栏自动收起、双击呼出（只写 <html> 的一个属性，样式在 globals.css 的 6b） */}
      <ReadingHeader />

      <article className="article" id="article-main">
        {/* 粘性标题（第 12 项）：零高、贴在 <article> 里，标题滚出视野后在顶栏下面挂一条 */}
        <ArticleStickyTitle lang={lang} title={meta.title} />

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

/**
 * 零文章时那条保留路径（`/<lang>/posts/__empty__/`）渲染的内容，见 `EMPTY_POST_SLUG`。
 *
 * 刻意**不带**悬浮目录、进度条、回顶与评论区 —— 它不是一篇文章，那四样在这里没有意义；
 * 外壳仍用文章页那一套类，所以宽度照样跟着 `--reading-*` 走（约定第 8 条）。
 * 文案分两处取，都是复用而不是重写：标题与说明在 `ARTICLE_TEXT`（这一页的事实来源），
 * 「还没有文章」那两句直接取列表页的 `LIST_TEXT` —— 同一句话不写第二遍。
 */
function EmptyArticlePage({ lang }: { lang: Lang }) {
  const t = ARTICLE_TEXT[lang];
  const list = LIST_TEXT[lang];
  const href = `/${lang}/posts/${EMPTY_POST_SLUG}/`;

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
          <a className="site-tagline-link" href={`/${lang}/posts/`}>
            {list.title} →
          </a>
        </footer>
      </article>
    </main>
  );
}

/**
 * 卡组页（`/zh/posts/notes/`）—— 一个目录（有 `_index.md`，或只是里面有文章）自己的页面。
 *
 * 为什么需要它：列表页把文章按卡组分块显示之后，组头得有个能点的地方；
 * 而且站长在地址栏敲 `/zh/posts/notes/`（目录名）是很自然的动作 ——
 * 以前那里是 404，现在它是这个卡组的家。
 *
 * 它**只做「清单」这件事**：组名 / 说明 / 封面 + 组内卡片（复用 `PostCard`，
 * 与列表页、首页第 2 栏同一个组件，约定第 9 条）。所以它没有悬浮目录、进度条、
 * 评论区 —— 那些是正文页的东西（第 12 项）。文章仍然要进正文页读。
 *
 * 密度写死「适中」：密度是本机偏好（localStorage 的 `tob:list-density`），
 * 构建期读不到，硬猜一个不如用默认那一档（与首页第 2 栏同一个取舍）。
 */
function CardGroupPage({ lang, group }: { lang: Lang; group: CardGroupMeta }) {
  const t = LIST_TEXT[lang];
  const href = groupHref(lang, group.slug);
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
          <a className="site-tagline-link" href={`/${lang}/posts/`}>
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
            <PostCard key={post.slug} post={post} lang={lang} density="cozy" />
          ))}
        </div>
      </div>
    </div>
  );
}
