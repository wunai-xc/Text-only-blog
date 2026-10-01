"use client";

import { useEffect, useState } from "react";

import { ARTICLE_TEXT } from "@/lib/article";
import type { Lang } from "@/lib/site";

/**
 * 粘性标题（第 12 项）
 *
 * 长文读到中段时「这是哪一篇」会丢掉 —— 顶栏只印站名，正文的 h1 早滚上去了。
 * 所以 h1 一离开视口上方，就在顶栏下面贴一条窄条：图纸编号 + 标题（超长省略号截断）。
 *
 * 三个取舍：
 *   1. **判据是 h1 的位置，不是滚动量**：用 IntersectionObserver 盯标题本身，
 *      「不在视口里 + 在视口上方」才算滚过去了。写死一个像素阈值的话，换字号档
 *      （--reading-* 是设置中心调得到的）标题高度就变了，那条线就不准了。
 *   2. **不抢正文的位置**：它是 `position: fixed`，只在视觉上盖住正文顶部一条，
 *      所以文章页标题的 `scroll-margin-top` 里加了它的高度（见 globals.css 的「6e.」），
 *      目录跳过去的小节不会被它压住。
 *   3. **收着的时候用 `visibility: hidden`**：既看不见，也退出无障碍树与 Tab 顺序
 *      （组件本身不是 aria-hidden —— 展开时它是「现在读的是哪一篇」这条信息，
 *      读屏用户同样需要）。
 *
 * 文案与编号都从外面传：标题来自 `meta.title`、编号来自 `decorate(meta.href).sheet`
 * —— 与页头那颗编号同一份，这里不重新推。
 */
export default function ArticleStickyTitle({
  lang,
  title,
  sheet,
}: {
  lang: Lang;
  /** 这一篇的标题（就是页头 h1 的那一句） */
  title: string;
  /** 图纸编号（页头 .article-no 上那颗，来自 lib/decor.ts 的 sheet） */
  sheet: string;
}) {
  const t = ARTICLE_TEXT[lang];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 认的是页头那颗 h1；这一页只有一个 .article-title（卡组页与保留页不渲染本组件）
    const heading = document.querySelector<HTMLElement>(".article-page .article-title");
    if (!heading || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([record]) => {
        setVisible(!record.isIntersecting && record.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );

    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="article-sticky"
      data-visible={visible ? "true" : "false"}
      role="note"
      aria-label={t.stickyLabel}
    >
      <p className="article-sticky-inner">
        <span className="article-sticky-no">{sheet}</span>
        <span className="article-sticky-title">{title}</span>
      </p>
    </div>
  );
}