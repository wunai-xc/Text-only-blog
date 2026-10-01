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
 * 悬浮目录 + 窄屏目录按钮（第 12 项）
 *
 * 五个设计决定：
 *   1. **它就是一组真锚点**（`<a href="#heading-id">`）：没有 JS 也能跳（只是不会高亮），
 *      id 是第 3 项 `rehype-slug` 给的，与正文标题、`#` 锚点同一套，不需要另造一套 slug；
 *   2. **高亮用 IntersectionObserver**（不挂滚动监听）：判定带取「顶栏下方 → 视口 30% 处」
 *      这一条带，带里的第一条就是「正在读的小节」。带里一条都没有时**保留上一次的高亮**
 *      （不清空），否则小节之间会闪；这一条与首页侧边指示器（HomeIndex）是同一个做法；
 *   3. 层级只用于缩进，不折叠：纯文字博客的目录通常十几条，折叠反而要多点一次；
 *      深于 `TOC_MAX_DEPTH` 的标题不列（缩进到第 3 档就没法再区分了）；
 *   4. 上下篇挂在目录底部（窄屏时整块目录默认收着，所以文章末尾**还有一份** `full` 档的
 *      上下篇 —— 两个位置共用同一个组件，不是两份实现）；
 *   5. **宽屏目录常驻、窄屏收成左侧抽屉**（同一棵 DOM，只换 CSS 与一次开关状态）：
 *      78rem 以下正文列两侧放不下 12rem 目录，不收起来就会挤正文。所以窄屏多一颗
 *      「目录」按钮（`aria-expanded` / `aria-controls` 指向这块 nav），打开后从左边滑出，
 *      点遮罩 / Esc / 点目录里任意一条都关掉，打开期间锁 body 滚动（与设置抽屉同一套做法）。
 *      **没有 JS 时按钮不工作、目录整块不显示** —— 这不是缺陷：目录在这里只是加速器，
 *      正文里 `rehype-autolink-headings` 给的 `#` 锚点、以及文章末尾的上下篇都不依赖它。
 *
 * `toc` 是**嵌套**结构（`TocEntry` 自己套自己），页面把 `renderMarkdown` 的返回原样传进来。
 * 这里刻意**不**从 lib/markdown.ts 值导入 `flattenToc()`：那个文件里是整条 unified 管线，
 * 一旦值导入就会被打进浏览器包（见 lib/article.ts 头部注释）。
 *
 * 层序（globals.css 的「6e. 文章页」）：宽屏目录 18（低于顶栏 20 与设置抽屉 50）；
 * 窄屏抽屉 42 / 遮罩 41（盖住正文与左下角齿轮，但设置抽屉 50 打开时还是压过它）。
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
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
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

  /**
   * 窄屏抽屉：打开时锁 body 滚动、Esc 关闭、焦点移到面板上（与 SettingsDock 同一套）。
   *
   * 那条 `matchMedia` 是防「开着抽屉把窗口拉宽」：宽屏下 CSS 把面板还原成常驻左栏，
   * 而 body 的 overflow 还锁着 —— 桌面端就整页滚不动了，且看不出是谁干的。
   * 断点必须与 CSS 里那条 `min-width: 78rem` 一致。
   */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const wide = window.matchMedia("(min-width: 78rem)");
    const onWide = () => {
      if (wide.matches) setOpen(false);
    };
    wide.addEventListener("change", onWide);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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
    <>
      {/* 目录按钮：只有窄屏显示（宽屏目录常驻，CSS 在 78rem 以上把它藏掉）。
          没有标题的篇章不放它 —— 点开只有一句「没有小节标题」，那是白点一次。 */}
      {hasHeadings ? (
        <button
          type="button"
          className="article-toc-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="article-toc"
          aria-label={open ? t.tocClose : t.tocToggle}
          title={open ? t.tocClose : t.tocToggle}
        >
          <Icon
            icon={open ? icons["mdi:close"] : icons["mdi:format-list-bulleted"]}
            width="1.1em"
            height="1.1em"
          />
        </button>
      ) : null}

      {open ? (
        <div className="article-toc-scrim" onClick={() => setOpen(false)} aria-hidden="true" />
      ) : null}

      <nav
        className="article-toc"
        id="article-toc"
        data-open={open ? "true" : "false"}
        aria-label={t.tocLabel}
        tabIndex={-1}
        ref={panelRef}
        // 抽屉里点任意一条（跳标题、翻上下篇）都把抽屉收起来 —— 跳完还挡着正文没有道理
        onClick={() => setOpen(false)}
      >
        <p className="article-toc-title">
          <Icon icon={icons["mdi:format-list-bulleted"]} width="1em" height="1em" />
          {t.tocLabel}
        </p>
        {hasHeadings ? renderList(toc) : <p className="article-toc-empty">{t.tocEmpty}</p>}
        {hasHeadings ? <p className="article-toc-note">{t.tocNote}</p> : null}
        <ArticlePager lang={lang} older={older} newer={newer} variant="compact" />
      </nav>
    </>
  );
}
