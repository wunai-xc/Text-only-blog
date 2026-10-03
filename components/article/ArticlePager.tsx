import { Icon } from "@iconify/react/offline";

import { ARTICLE_TEXT, type PagerTarget } from "@/lib/article";
import { icons } from "@/lib/icons";
import type { Lang } from "@/lib/lang";

/**
 * 上下篇（第 12 项）
 *
 * 没有 hook、没有 state，所以服务端组件与客户端组件都能用 —— 一处在文章末尾（`full`），
 * 一处在悬浮目录的底部（`compact`），**只有一份实现**（约定：列表与卡片各只有一份实现那一条）。
 *
 * 「上/下」的解释只有一份，在 lib/article.ts 的 `articleNeighbors()`：
 * `older` 是时间更早的那一篇、`newer` 是更新的那一篇，两个方向都带日期，读不出歧义。
 * 卡组（目录）里的文章只在这个卡组内前后走，走到组的两头时那一头换成「全部文章」出口
 * （`kind: "all"`）—— 这里只负责画：普通文章那一格有标签 + 日期 + 标题，出口只有一行字；
 * 没有目标就不画那一格（不留空框），`full` 一档在宽屏左右各占一列。
 */
export default function ArticlePager({
  lang,
  older,
  newer,
  variant = "full",
}: {
  lang: Lang;
  older: PagerTarget | null;
  newer: PagerTarget | null;
  /** full = 文章末尾两栏；compact = 悬浮目录里的窄条 */
  variant?: "full" | "compact";
}) {
  const t = ARTICLE_TEXT[lang];
  if (!older && !newer) return null;

  /** 箭头跟着方向走：上一篇在左侧、下一篇在右侧（都在标签文字的外侧） */
  const arrowLeft = <Icon icon={icons["mdi:arrow-left"]} width="1em" height="1em" />;
  const arrowRight = <Icon icon={icons["mdi:arrow-right"]} width="1em" height="1em" />;

  /** 一格：出口（一行字）与普通文章（标签 + 日期 + 标题）长得不一样，所以在这里分开画 */
  const cell = (target: PagerTarget, direction: "older" | "newer") => {
    if (target.kind === "all") {
      return (
        <a
          className="article-pager-link"
          data-dir={direction}
          data-kind="all"
          href={target.href}
          title={t.allPosts}
          key={`all-${direction}`}
        >
          <span className="article-pager-label">
            {direction === "older" ? arrowLeft : null}
            {t.allPosts}
            {direction === "newer" ? arrowRight : null}
          </span>
        </a>
      );
    }

    const post = target.post;
    return (
      <a
        className="article-pager-link"
        data-dir={direction}
        href={post.href}
        title={post.title}
        key={post.slug}
      >
        <span className="article-pager-label">
          {direction === "older" ? arrowLeft : null}
          {direction === "older" ? t.older : t.newer}
          {direction === "newer" ? arrowRight : null}
          <span className="article-pager-date">{post.date.slice(0, 10)}</span>
        </span>
        <span className="article-pager-title">{post.title}</span>
      </a>
    );
  };

  return (
    // 刻意用 div 而不是 nav：`compact` 那一份是嵌在悬浮目录（本身就是 <nav>）里的，
    // 里面再放一个 nav 会在无障碍树里出现两层同名地标，读屏用户要多跳一次。
    <div
      className="article-pager"
      data-variant={variant}
      role="group"
      aria-label={t.pagerLabel}
    >
      {older ? cell(older, "older") : null}
      {newer ? cell(newer, "newer") : null}
    </div>
  );
}