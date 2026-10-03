"use client";

import { useEffect, useState } from "react";

import type { TocEntry } from "@/lib/markdown";

import { flattenToc, useActiveHeading } from "./useActiveHeading";
import { ARTICLE_TEXT, STICKY_TITLE_OFFSET } from "@/lib/article";
import type { Lang } from "@/lib/lang";

/**
 * 粘性标题（第 12 项）
 *
 * 正文的大标题滚出视野之后，在**吸顶顶栏下面**挂一条紧凑标题 ——
 * 读长文时不必往回滚就知道自己在读哪一篇（读到底部看评论区时尤其明显）。
 *
 * 横条上两段信息，左边是这一篇（`title`），右边是**正在读的那一小节**：
 *   - 小节名来自 `useActiveHeading(toc)` —— 与悬浮目录的高亮、右侧进度条点亮的方块
 *     是**同一份判定**（只写在那一个 hook 里），所以三处永远不会各说各话；
 *   - 还没读到第一个小节标题（或这一篇没有小标题）时右边为空，整条横条只剩篇名 ——
 *     空着的那一段由 CSS 的 `:empty` 收掉，不留一个孤零零的分隔符。
 *
 * 五个设计决定：
 *   1. **零高容器，贴在 `<article>` 里面**（`.article-sticky` 是 `position: sticky` + `height: 0`）：
 *      不占版面（正文第一行不会被推下去），而且**随文章一起结束** —— 滚过文章末尾它自己就没了。
 *      用 `position: fixed` 的话它会一直压在评论区上面（评论不是这一篇的正文）；
 *   2. 出现 / 消失看**正文的 `<h1>`**（IntersectionObserver）：h1 还在视野里就藏着
 *      （它和页头是同一块信息，重复显示只是噪音），滚过去才出现；退回顶部它自己消失。
 *      判定带的上边界是 `STICKY_TITLE_OFFSET`（= 顶栏下沿，与目录高亮那条同值）；
 *   3. 它对读屏是 `aria-hidden` —— 那两串字与正文的 `<h1>` / 小节标题一模一样，报第二遍是噪音；
 *      所以容器里**不放任何能点的东西**（一个 aria-hidden 的链接是键盘与读屏的坑）；
 *   4. 顶部位置读令牌 `--header-h`（在 globals.css 里）—— 顶栏高度只有一个事实来源，
 *      顶栏改高改矮时这里跟着走，不手写 rem（与文章页标题的 `scroll-margin-top` 同一条规矩）；
 *   5. 小节名与篇名都是**一行到底 + 尾巴省略号**（横条只有两行字那么高，不该被撑成两行）。
 *
 * 层序 `z-index: 17`（在 globals.css 的「6e. 文章页」里）：高于正文，但**低于**
 * 悬浮目录（18）、进度与回顶（19）与吸顶顶栏（20）—— 窗口很窄、正文又调得很宽时，
 * 目录面板与它可能重叠，那时让目录压在上面（读者正在点的是目录）。
 */
export default function ArticleStickyTitle({
  lang,
  title,
  toc,
}: {
  lang: Lang;
  /** 这一篇的标题（正文 `<h1>` 的那串字） */
  title: string;
  /** 正文目录（第 3 项收集的）；当前小节名从它里面查 */
  toc: TocEntry[];
}) {
  const t = ARTICLE_TEXT[lang];
  const [visible, setVisible] = useState(false);
  // 与目录 / 进度条同一个判定；toc 为空时恒为 null，右边那一段自然不出现
  const active = useActiveHeading(toc);
  const currentSection = active
    ? flattenToc(toc).find((entry) => entry.id === active)?.text ?? ""
    : "";

  useEffect(() => {
    // 页头那个大标题：只有文章页挂这个组件，empty 页与卡组页都不会渲染它
    const heading = document.querySelector(".article-page .article-title");
    if (heading === null || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (records) => {
        const record = records[records.length - 1];
        if (record) setVisible(!record.isIntersecting);
      },
      // 上边界避开吸顶顶栏：h1 越过这条线（滚过去了）才轮到这条粘性标题出场
      { rootMargin: `-${STICKY_TITLE_OFFSET}px 0px 0px 0px` },
    );

    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="article-sticky" data-visible={visible ? "true" : "false"} aria-hidden="true">
      <p className="article-sticky-bar">
        <span className="article-sticky-label">{t.kicker}</span>
        <span className="article-sticky-title">{title}</span>
        {/* 正在读的那一小节：空串时由 CSS 的 :empty 整段收掉（分隔符挂在它的 ::before 上） */}
        <span className="article-sticky-section">{currentSection}</span>
      </p>
    </div>
  );
}
