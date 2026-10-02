"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/offline";

import ArticlePager from "./ArticlePager";
import { useActiveHeading } from "./useActiveHeading";
import { ARTICLE_TEXT, TOC_MAX_DEPTH, tocIndent, type PagerTarget } from "@/lib/article";
import { icons } from "@/lib/icons";
import type { TocEntry } from "@/lib/markdown";
import type { Lang } from "@/lib/site";

/**
 * 悬浮目录（第 12 项）
 *
 * 位置与形态对齐 wunai-blog 参考稿：**视口左上角、浮动件基准线（--chrome-top）下沿的一颗方形挂件**，
 * 点开才在它下面弹出面板。宽屏窄屏是同一套 —— 不再分「宽屏默认展开 / 窄屏收进左下角」。
 *
 * 五个设计决定：
 *   1. **它就是一组真锚点**（`<a href="#heading-id">`）：没有 JS 也能跳（只是不会高亮），
 *      id 是第 3 项 `rehype-slug` 给的，与正文标题、`#` 锚点同一套，不需要另造一套 slug；
 *   2. **高亮当前小节**：判定只有一份 —— 在 ./useActiveHeading.ts（IntersectionObserver
 *      取「顶栏下方 → 视口 30% 处」那条带，带里的第一条就是正在读的小节）。右侧进度条的
 *      节点层要的是**同一个答案**，所以两处共用它，不各观察一遍；
 *   3. 层级只用于缩进，不折叠：纯文字博客的目录通常十几条，折叠反而要多点一次；
 *      深于 `TOC_MAX_DEPTH` 的标题不列（缩进到第 3 档就没法再区分了）；
 *   4. 上下篇挂在面板底部（面板默认收起，所以文章末尾还有一份 `full` 档的上下篇
 *      —— 两个位置共用同一个组件，不是两份实现）；点一条目录就顺势收起（挡住正文就没意义了）；
 *   5. **面板可以收起来**：`data-open` 由这里写，收起时只剩那颗挂件。顶栏在阅读时会收起
 *      （components/article/ReadingHeader），届时 `--chrome-top` 归零，挂件与面板一起上移贴到视口顶。
 *
 * `toc` 是**嵌套**结构（`TocEntry` 自己套自己），页面把 `renderMarkdown` 的返回原样传进来。
 * 这里刻意**不**从 lib/markdown.ts 值导入 `flattenToc()`：那个文件里是整条 unified 管线，
 * 一旦值导入就会被打进浏览器包（见 lib/article.ts 头部注释）。
 *
 * 层序 `z-index: 18`（在 globals.css 的「6e. 文章页」里）：低于进度与回顶（19）、
 * 顶栏（20）与设置抽屉（50），高于粘性标题（17）。
 */

/** 面板内容区的 id：开关上的 `aria-controls` 要指向一个**真实存在**的元素 */
const TOC_BODY_ID = "article-toc-body";

export default function ArticleToc({
  lang,
  toc,
  older,
  newer,
}: {
  lang: Lang;
  toc: TocEntry[];
  /** 上下篇的格子：可能是一篇文章，也可能是「全部文章」出口（见 lib/article.ts） */
  older: PagerTarget | null;
  newer: PagerTarget | null;
}) {
  const t = ARTICLE_TEXT[lang];
  const [open, setOpen] = useState(false);
  const active = useActiveHeading(toc);
  const root = useRef<HTMLElement | null>(null);

  /** 面板是浮层：点面板外面、或按 Esc，都要收起来（与设置抽屉同一种做法） */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent): void => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  /** 点一条目录就顺势收起：面板是从左上角弹出来的浮层，留着只会挡住正文 */
  function onFollowAnchor(event: React.MouseEvent<HTMLElement>): void {
    const target = event.target;
    if (target instanceof Element && target.closest("a") !== null) setOpen(false);
  }

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
    <nav
      ref={root}
      className="article-toc"
      aria-label={t.tocLabel}
      data-open={open ? "true" : "false"}
      onClick={onFollowAnchor}
    >
      {/* 开关：收起时它就是整个挂件，展开时它是面板上方那颗方形按钮 */}
      <button
        type="button"
        className="article-toc-toggle"
        aria-expanded={open}
        aria-controls={TOC_BODY_ID}
        aria-label={open ? t.tocCollapse : t.tocExpand}
        title={open ? t.tocCollapse : t.tocExpand}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon
          icon={open ? icons["mdi:close"] : icons["mdi:format-list-bulleted"]}
          width="1em"
          height="1em"
        />
      </button>

      <div className="article-toc-body" id={TOC_BODY_ID}>
        {/* 面板的标题行：对应参考稿的 .toc-panel-head */}
        <p className="article-toc-head">
          <Icon icon={icons["mdi:format-list-bulleted"]} width="1em" height="1em" />
          <span>{t.tocLabel}</span>
        </p>
        {hasHeadings ? renderList(toc) : <p className="article-toc-empty">{t.tocEmpty}</p>}
        {hasHeadings ? <p className="article-toc-note">{t.tocNote}</p> : null}
        <ArticlePager lang={lang} older={older} newer={newer} variant="compact" />
      </div>
    </nav>
  );
}