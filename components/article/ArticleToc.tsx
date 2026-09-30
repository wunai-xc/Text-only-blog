"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/offline";

import ArticlePager from "./ArticlePager";
import { ARTICLE_TEXT, TOC_ACTIVE_OFFSET, TOC_MAX_DEPTH, tocIndent } from "@/lib/article";
import { icons } from "@/lib/icons";
import type { ListPost } from "@/lib/list";
import type { TocEntry } from "@/lib/markdown";
import type { Lang } from "@/lib/site";

/**
 * 悬浮目录（第 12 项）
 *
 * 四个设计决定：
 *   1. **它就是一组真锚点**（`<a href="#heading-id">`）：没有 JS 也能跳（只是不会高亮），
 *      id 是第 3 项 `rehype-slug` 给的，与正文标题、`#` 锚点同一套，不需要另造一套 slug；
 *   2. **高亮用 IntersectionObserver**（不挂滚动监听）：判定带取「顶栏下方 → 视口 30% 处」
 *      这一条带，带里的第一条就是「正在读的小节」。带里一条都没有时**保留上一次的高亮**
 *      （不清空），否则小节之间会闪；这一条与首页侧边指示器（HomeIndex）是同一个做法；
 *   3. 层级只用于缩进，不折叠：纯文字博客的目录通常十几条，折叠反而要多点一次；
 *      深于 `TOC_MAX_DEPTH` 的标题不列（缩进到第 3 档就没法再区分了）；
 *   4. 上下篇挂在目录底部（窄屏时整块目录不显示，所以文章末尾**还有一份** `full` 档的
 *      上下篇 —— 两个位置共用同一个组件，不是两份实现）。
 *
 * `toc` 是**嵌套**结构（`TocEntry` 自己套自己），页面把 `renderMarkdown` 的返回原样传进来。
 * 这里刻意**不**从 lib/markdown.ts 值导入 `flattenToc()`：那个文件里是整条 unified 管线，
 * 一旦值导入就会被打进浏览器包（见 lib/article.ts 头部注释）。
 *
 * 层序 `z-index: 18`（在 globals.css 的「6e. 文章页」里）：低于顶栏（20）与设置抽屉（50）。
 */
export default function ArticleToc({
  lang,
  toc,
  older,
  newer,
}: {
  lang: Lang;
  toc: TocEntry[];
  older: ListPost | null;
  newer: ListPost | null;
}) {
  const t = ARTICLE_TEXT[lang];
  const [active, setActive] = useState<string | null>(null);
  const visible = useRef<Set<string>>(new Set());

  useEffect(() => {
    /** 文档顺序的 id 表：高亮要「带里的第一条」，所以顺序是这件事的关键 */
    const ids: string[] = [];
    const collect = (entries: TocEntry[]): void => {
      for (const entry of entries) {
        ids.push(entry.id);
        collect(entry.children);
      }
    };
    collect(toc);

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) visible.current.add(record.target.id);
          else visible.current.delete(record.target.id);
        }
        const first = ids.find((id) => visible.current.has(id));
        if (first) setActive(first);
      },
      // 上边界避开吸顶顶栏，下边界收掉 70%：中间那条带就是「正在读」的位置
      { rootMargin: `-${TOC_ACTIVE_OFFSET}px 0px -70% 0px` },
    );

    for (const element of elements) observer.observe(element);
    return () => {
      observer.disconnect();
      visible.current.clear();
    };
  }, [toc]);

  const hasHeadings = toc.length > 0;

  const renderList = (entries: TocEntry[]): React.ReactNode => (
    <ol className="article-toc-list">
      {entries.map((entry) => {
        const indent = tocIndent(entry.depth);
        const current = active === entry.id;
        return (
          <li className="article-toc-item" key={entry.id} data-indent={indent}>
            {entry.depth > TOC_MAX_DEPTH ? null : (
              <a
                className="article-toc-link"
                href={`#${entry.id}`}
                aria-current={current ? "true" : undefined}
                title={entry.text}
              >
                {entry.text}
              </a>
            )}
            {entry.children.length > 0 ? renderList(entry.children) : null}
          </li>
        );
      })}
    </ol>
  );

  return (
    <nav className="article-toc" aria-label={t.tocLabel}>
      <p className="article-toc-title">
        <Icon icon={icons["mdi:format-list-bulleted"]} width="1em" height="1em" />
        {t.tocLabel}
      </p>
      {hasHeadings ? renderList(toc) : <p className="article-toc-empty">{t.tocEmpty}</p>}
      {hasHeadings ? <p className="article-toc-note">{t.tocNote}</p> : null}
      <ArticlePager lang={lang} older={older} newer={newer} variant="compact" />
    </nav>
  );
}
