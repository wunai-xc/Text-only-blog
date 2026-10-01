"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/offline";

import ArticlePager from "./ArticlePager";
import {
  ARTICLE_TEXT,
  TOC_ACTIVE_OFFSET,
  TOC_MAX_DEPTH,
  TOC_WIDE_QUERY,
  tocIndent,
} from "@/lib/article";
import { icons } from "@/lib/icons";
import type { ListPost } from "@/lib/list";
import type { TocEntry } from "@/lib/markdown";
import type { Lang } from "@/lib/site";

/**
 * 悬浮目录（第 12 项）
 *
 * 五个设计决定：
 *   1. **它就是一组真锚点**（`<a href="#heading-id">`）：没有 JS 也能跳（只是不会高亮），
 *      id 是第 3 项 `rehype-slug` 给的，与正文标题、`#` 锚点同一套，不需要另造一套 slug；
 *   2. **高亮用 IntersectionObserver**（不挂滚动监听）：判定带取「顶栏下方 → 视口 30% 处」
 *      这一条带，带里的第一条就是「正在读的小节」。带里一条都没有时**保留上一次的高亮**
 *      （不清空），否则小节之间会闪；这一条与首页侧边指示器（HomeIndex）是同一个做法；
 *   3. 层级只用于缩进，不折叠：纯文字博客的目录通常十几条，折叠反而要多点一次；
 *      深于 `TOC_MAX_DEPTH` 的标题不列（缩进到第 3 档就没法再区分了）；
 *   4. 上下篇挂在目录底部（**窄屏时目录默认收起，所以文章末尾还有一份** `full` 档的
 *      上下篇 —— 两个位置共用同一个组件，不是两份实现）；
 *   5. **整块面板可以收起来**（面板第一行就是那个开关）：
 *      - 宽屏（≥78rem，断点是 `TOC_WIDE_QUERY`）默认展开，位置与以前一样贴在左侧顶栏下面；
 *      - 窄屏默认收起 —— 收起后只剩一个「目录」小挂件，在**左下角**（左上角被吸顶顶栏占着、
 *        右下角是回顶按钮，左下角才是空的；它叠在设置齿轮上方）；点开才从那里弹出面板，
 *        弹层本身自己滚（`max-height`），点一条目录就顺势收起（挡住正文就没意义了）。
 *      「默认状态」写在 CSS 里（`data-open` **不写**就是这个默认值），组件只在读者点过之后
 *      才写死 `true` / `false` —— 这样**没有 JS 的宽屏读者照旧看得到目录**（与第 12 项落地时一样）。
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
  older: ListPost | null;
  newer: ListPost | null;
}) {
  const t = ARTICLE_TEXT[lang];
  const [active, setActive] = useState<string | null>(null);
  /** `null` = 读者还没点过，默认状态交给 CSS；点过之后就是他的选择（本次浏览内记住） */
  const [open, setOpen] = useState<boolean | null>(null);
  /** 是不是宽屏（≥78rem）：只用来把 `aria-expanded` 与「点一条要不要收起」说准 */
  const [wide, setWide] = useState(false);
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
   * 宽屏 / 窄屏只用来把 `aria-expanded` 与「点一条要不要收起」说准 ——
   * **默认状态本身写在 CSS 里**（`data-open` 不写 = 宽屏展开、窄屏收起），
   * 所以没有 JS 的宽屏读者照旧看得到目录，而窄屏那个浮层也不会默认弹出来挡正文。
   * 没有 `matchMedia` 的老浏览器当宽屏算（那样说法与 CSS 的默认一致）。
   */
  useEffect(() => {
    const media = window.matchMedia?.(TOC_WIDE_QUERY);
    if (!media) {
      setWide(true);
      return;
    }
    const sync = (): void => setWide(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  /** 读者点过之后按他的选择，没点过就按断点（= CSS 里那套默认值） */
  const expanded = open ?? wide;

  function onFollowAnchor(event: React.MouseEvent<HTMLElement>): void {
    // 窄屏：面板是从左下角弹出来的浮层，点完一条它还挡着正文就没意义了 —— 顺势收起。
    // 宽屏不收：读者多半会连着点几条，每点一条都要重新点开很难受。
    if (wide) return;
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
      className="article-toc"
      aria-label={t.tocLabel}
      /* 不写 `data-open` 就是「按 CSS 的默认」：宽屏展开、窄屏收起（见文件头的决定 5） */
      data-open={open === null ? undefined : open ? "true" : "false"}
      onClick={onFollowAnchor}
    >
      {/* 面板的第一行就是这个开关：收起时只剩它自己（一个挂件），展开时它是面板的标题行 */}
      <button
        type="button"
        className="article-toc-toggle"
        aria-expanded={expanded}
        aria-controls={TOC_BODY_ID}
        aria-label={expanded ? t.tocCollapse : t.tocExpand}
        title={expanded ? t.tocCollapse : t.tocExpand}
        onClick={() => setOpen(!expanded)}
      >
        <Icon icon={icons["mdi:format-list-bulleted"]} width="1em" height="1em" />
        <span className="article-toc-toggle-label">{t.tocLabel}</span>
        <Icon
          className="article-toc-chevron"
          icon={icons["mdi:chevron-left"]}
          width="1em"
          height="1em"
        />
      </button>

      <div className="article-toc-body" id={TOC_BODY_ID}>
        {hasHeadings ? renderList(toc) : <p className="article-toc-empty">{t.tocEmpty}</p>}
        {hasHeadings ? <p className="article-toc-note">{t.tocNote}</p> : null}
        <ArticlePager lang={lang} older={older} newer={newer} variant="compact" />
      </div>
    </nav>
  );
}
