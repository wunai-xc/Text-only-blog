import HomeBlockHead from "./HomeBlockHead";
import type { PostMeta } from "@/lib/content";
import { HOME_TEXT } from "@/lib/home";
import { ARTICLE_ROUTE, type Lang } from "@/lib/site";

/**
 * 第 2 栏：文章卡片（第 9 项）
 *
 * 作者要的「部分文章卡片展示」。列表来自第 2 项的 `getHomePosts`（置顶优先、时间倒序、
 * 排除 hiddenInHomeList 与 about），条数由 app/[lang]/page.tsx 的 HOME_POST_LIMIT 决定。
 *
 * **正文页（第 12 项）还没做，所以卡片暂时不可点** —— 这里的判断与 RouteLink 是同一个约定
 * （约定第 8 条：不留会 404 的死链），落点只有一个：lib/site.ts 的 ARTICLE_ROUTE。
 * 第 12 项做完把它改成 "ready"，这些卡片会一起变成真链接，不用回来改这里。
 *
 * 卡片的排版是**紧凑的文字卡**（标题 / 日期 / 阅读时长 / 摘要 / 标签）。
 * 第 11 项（文章卡片的三档密度）落地后，这里的排版换成那边的「紧凑档」—— 那时再统一。
 *
 * 零文章时显示空状态（约定第 4 条：所有页面要有空状态）。
 */
export default function HomePostCards({ lang, posts }: { lang: Lang; posts: PostMeta[] }) {
  const text = HOME_TEXT[lang];
  const t = text.posts;
  const pending = ARTICLE_ROUTE.status !== "ready";
  const pendingHint = text.articlePending(ARTICLE_ROUTE.item);

  return (
    <>
      <HomeBlockHead id="posts" lang={lang} />
      {posts.length > 0 ? (
        <>
          <p className="home-note">{t.count(posts.length)}</p>
          <div className="home-posts">
            {posts.map((post) => (
              <article className="home-post-card" key={post.slug}>
                <h3 className="home-post-title">
                  {pending ? (
                    <span data-pending="true" title={pendingHint}>
                      {post.title}
                    </span>
                  ) : (
                    <a href={post.href}>{post.title}</a>
                  )}
                </h3>
                <p className="home-post-meta">
                  {post.date.slice(0, 10)} · {t.minutes(post.readingMinutes)}
                  {post.pinned ? " · ★" : ""}
                  {post.isAI ? " · AI" : ""}
                </p>
                {post.description ? <p className="home-post-desc">{post.description}</p> : null}
                {post.tags.length > 0 ? (
                  <p className="home-post-tags">{post.tags.map((tag) => `#${tag}`).join(" ")}</p>
                ) : null}
              </article>
            ))}
          </div>
        </>
      ) : (
        <p className="home-note">{t.empty}</p>
      )}
    </>
  );
}
