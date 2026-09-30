import { Icon } from "@iconify/react/offline";

import { icons } from "@/lib/icons";
import { LIST_TEXT, type Density, type ListPost } from "@/lib/list";
import { ARTICLE_ROUTE, type Lang } from "@/lib/site";

/**
 * 文章卡片（第 11 项：紧凑 / 适中 / 内容 三档密度）
 *
 * 「三档」在结构上只有两处差别（摘要要不要出现、元信息展开到什么程度），
 * 其余全交给 CSS 的 `.post-card[data-density="…"]` —— 组件里没有按密度写的样式分支。
 *
 * 两处使用（第 10 项的列表页、第 9 项首页的第 2 栏）共用这一个组件：
 * 首页是**服务端组件**、列表页是客户端组件，而它自己两边都能用（没有 hook、没有 state）。
 *
 * 标题可点与否看正文页的落地状态 —— 判断与 RouteLink 是同一个约定（约定第 8 条：
 * 不留会 404 的死链），落点只有一个：lib/site.ts 的 ARTICLE_ROUTE。第 12 项把它改成了
 * `"ready"`，所以这里现在是真 `<a>`；哪天把状态改回 `"pending"`（例如换了 slug 规则），
 * 卡片的标题会一起退回「不可点 + 说明」的形态，不需要回来改这个文件。
 *
 * 卡片上的文案跟着**卡片自己**走（lib/list.ts 的 LIST_TEXT），不从父组件透传 ——
 * 首页与列表页因此不会各写一份「几分钟」。
 */
export default function PostCard({
  post,
  lang,
  density,
}: {
  post: ListPost;
  lang: Lang;
  density: Density;
}) {
  const t = LIST_TEXT[lang];
  /** 紧凑档只有一行：标题 + 日期与时长 */
  const compact = density === "compact";
  const full = density === "full";
  const pending = ARTICLE_ROUTE.status !== "ready";
  const date = post.date.slice(0, 10);

  return (
    <article className="post-card" data-density={density} data-lang={post.lang}>
      <h3 className="post-card-title">
        {pending ? (
          <span data-pending="true" title={t.articlePending(ARTICLE_ROUTE.item)}>
            {post.title}
          </span>
        ) : (
          <a href={post.href}>{post.title}</a>
        )}
      </h3>

      <p className="post-card-meta">
        <span>{date}</span>
        <span aria-hidden="true">·</span>
        <span>{t.card.minutes(post.readingMinutes)}</span>
        {post.pinned ? (
          <span className="post-card-badge" title={t.card.pinned}>
            {t.card.pinned}
          </span>
        ) : null}
        {post.draft ? (
          <span className="post-card-badge" data-badge="draft">
            {t.card.draft}
          </span>
        ) : null}
        {post.isAI ? (
          <span className="post-card-badge" data-badge="ai">
            <Icon icon={icons["mdi:robot-outline"]} width="1em" height="1em" />
            {t.card.ai}
          </span>
        ) : null}
      </p>

      {!compact && post.description ? (
        <p className="post-card-desc">{post.description}</p>
      ) : null}

      {full ? (
        <>
          {post.excerpt && post.excerpt !== post.description ? (
            <p className="post-card-excerpt">{post.excerpt}</p>
          ) : null}
          <p className="post-card-meta">
            <span>{t.card.words(post.words)}</span>
            {post.updated ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{t.card.updated(post.updated.slice(0, 10))}</span>
              </>
            ) : null}
            {post.group ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.group}/</span>
              </>
            ) : null}
          </p>
          {post.tags.length + post.categories.length > 0 ? (
            <p className="post-card-chips">
              {post.tags.map((tag) => (
                <span className="post-card-chip" key={`tag-${tag}`}>
                  #{tag}
                </span>
              ))}
              {post.categories.map((category) => (
                <span className="post-card-chip" data-kind="category" key={`cat-${category}`}>
                  {category}
                </span>
              ))}
            </p>
          ) : null}
          <p className="post-card-note">{t.card.fullNote}</p>
        </>
      ) : post.tags.length > 0 ? (
        <p className="post-card-tags">{post.tags.map((tag) => `#${tag}`).join(" ")}</p>
      ) : null}
    </article>
  );
}
