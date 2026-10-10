import Link from "next/link";
import { Icon } from "@iconify/react/offline";

import { icons } from "@/lib/icons";
import { LIST_TEXT, type Density, type ListPost } from "@/lib/list";
import type { Lang } from "@/lib/lang";
import { ARTICLE_ROUTE } from "@/lib/routes";

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
 * `"ready"`，所以这里现在是真链接；哪天把状态改回 `"pending"`（例如换了 slug 规则），
 * 卡片的标题会一起退回「不可点 + 说明」的形态，不需要回来改这个文件。
 *
 * 可点时用 `next/link` 的 `<Link>` 而**不是**原生 `<a>`：原生 `<a>` 走整页刷新，
 * App Router 的 `usePathname()` 不会变，挂在根布局的 RouteLoading（顶部描线）与
 * PageIntro（正文淡入）就永远等不到「换页完成」，从卡片进文章时看着像直接载入。
 * 这一点对首页 / 列表页 / 卡组页三处入口（都走这个组件）一起生效。
 *
 * 卡片上的文案跟着**卡片自己**走（lib/list.ts 的 LIST_TEXT），不从父组件透传 ——
 * 首页与列表页因此不会各写一份「几分钟」。
 *
 * **文章与笔记是两种卡片**（站长要的细分）：`group === ""` 的是「单篇文章」，
 * 在一张卡组目录里的（卡组页 / 列表页的组内）算「笔记」。差别落在 `data-kind`，
 * 样式全在 CSS 的 `.post-card[data-kind="…"]` 那几行：笔记是虚线描边 + 画布底色 +
 * 一枚「笔记 · 卡组名」的角标，文章保持实线描边 + 面底色。组件里没有第二套结构。
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
  /** 卡组目录里的一篇 = 笔记（见文件头注释） */
  const note = post.group !== "";
  const date = post.date.slice(0, 10);

  return (
    <article
      className="post-card"
      data-density={density}
      data-lang={post.lang}
      data-kind={note ? "note" : "post"}
    >
      <h3 className="post-card-title">
        {pending ? (
          <span data-pending="true" title={t.articlePending(ARTICLE_ROUTE.item)}>
            {post.title}
          </span>
        ) : (
          <Link href={post.href}>{post.title}</Link>
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
        {note ? (
          <span className="post-card-badge" data-badge="note" title={t.card.noteHint(post.group)}>
            <Icon icon={icons["mdi:folder-outline"]} width="1em" height="1em" />
            {t.card.note}
            <span className="post-card-badge-group">{post.group}/</span>
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
