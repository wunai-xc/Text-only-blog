"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react/offline";

import { flattenToc, useActiveHeading } from "./useActiveHeading";
import {
  ARTICLE_TEXT,
  BACK_TO_TOP_AFTER,
  PROGRESS_KEY_STEP,
  PROGRESS_NEAR_THRESHOLD,
  TOC_MAX_DEPTH,
} from "@/lib/article";
import { icons } from "@/lib/icons";
import { READING_EVENT } from "@/lib/prefs";
import type { TocEntry } from "@/lib/markdown";
import type { Lang } from "@/lib/site";

/**
 * 阅读进度（**可拖动的滑块**）+ 轨道上的**章节节点** + 回到顶部（**带进度环**）（第 12 项）
 *
 * 右侧那条 2px 的细线是**整页**的滚动进度（不是正文的进度）：读到页面底部就是 100%，
 * 不会出现「正文读完了、百分比却停在 87%」这种让人不放心的数字。百分比小牌子在宽屏才显示
 * （窄屏上它会挤到正文，见 globals.css 的「6e. 文章页」）。
 *
 * 做法是**一次 scroll 监听**（passive + requestAnimationFrame 节流），三件事共用：
 *   - 进度 = scrollY / (scrollHeight - innerHeight)，钳在 0~100；
 *   - 滚动超过 `BACK_TO_TOP_AFTER` 才显示回顶按钮；
 *   - 进度环（回顶按钮里那一圈）与百分比牌子读的是同一个数字。
 * 没有用 IntersectionObserver 是因为这几件事本来就是「页面滚了多少」，与元素位置无关。
 *
 * **滑块**（第 12 项那一轮加的）：那条细线同时是 `role="slider"` 的轨道 ——
 *   1. 轨道**铺满视口高度**，所以「鼠标纵坐标 / 视口高」就是百分比，拖动是线性的、跟手的
 *      （视觉上仍是右边缘那 2px，命中区在 CSS 里放宽到 ~0.9rem，否则 2px 根本抓不住）；
 *   2. **先承认这是拖动、再动页面**：触屏上先把指针移动 `DRAG_THRESHOLD` 像素才生效 ——
 *      手机右边缘常被拿来滚页面，一按就跳会吓人（轨道上 `touch-action: none`，
 *      所以那一下不会同时滚页面）。鼠标不受这条限制：按一下轨道就跳过去，那是滚动条的手感；
 *   3. 拖动用 `setPointerCapture`：拖出轨道、拖出窗口都还继续跟手；
 *   4. **键盘也能走**（`PROGRESS_KEY_STEP`）：↑/↓ 或 ←/→ 一步、PageUp/PageDown 三步、
 *      Home/End 到两头 —— 一个只有鼠标能用的控件不算做完了。
 *
 * **章节节点**（这一轮加的，对齐参考稿的 scroll-rail）：轨道上每一颗方块 = 正文的一个小节，
 * 位置 = 该标题的文档纵坐标 / 可滚动高度 —— 与滑块百分比**同一把尺子**，所以「滑块压在哪一颗
 * 方块上」就等于「滚到那一节」。四件事：
 *   1. **点方块 → 跳到那一节**：`scrollIntoView`，与目录面板的锚点是同一个落点 ——
 *      吸顶顶栏那一段让位由 CSS 的 `scroll-margin-top` 负责，这里不再自己减一个像素数；
 *   2. **悬停 / 聚焦 → 方块旁弹出标题签**；指尖设备没有 hover，那条路靠拖动时「离滑块最近」
 *      触发（`PROGRESS_NEAR_THRESHOLD`）；
 *   3. **三种状态**：读到过（越过它 = 填墨）、正在读（与目录高亮共用一份判定，
 *      见 ./useActiveHeading.ts）、拖动靠近（放大 + 报标题）；
 *   4. 节点层是**独立的一层**（`.article-progress-marks`），**不是**滑块 div 的子元素：
 *      `role="slider"` 里塞按钮是 ARIA 上的坑（滑块应当是个叶子控件，它自己只含
 *      aria-hidden 的装饰）。所以节点层自己铺满视口、`pointer-events: none`，只有方块收指针 ——
 *      空白处的按压照旧漏给下面那条可拖动的轨道。
 *
 * 回顶按钮：**进度环 + 箭头**，环与右边那条线读同一个 `progress`（`stroke-dashoffset`）。
 * `prefers-reduced-motion: reduce` 的读者用瞬时跳转（不做平滑滚动）；
 * 不可见时 `aria-hidden` + `tabIndex={-1}`，键盘不会 Tab 到一个看不见的按钮上。
 * 右下角本来印着图纸图签（装饰），文章页把它让给这颗按钮 —— 见 globals.css。
 */

/** 进度环的几何：viewBox 是 36×36、半径 16.5（留出描边宽度）；环本身在 globals.css 里画 */
const RING_RADIUS = 16.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** 触屏上要移动够这么多像素才算「拖动」（鼠标不受限制，见文件头第 2 条） */
const DRAG_THRESHOLD = 6;

/** 轨道上的一颗方块：一个小节 + 它在整页里的位置（0~1，与滑块百分比同一把尺子） */
interface ProgressMark {
  id: string;
  text: string;
  depth: number;
  pos: number;
}

export default function ArticleProgress({ lang, toc }: { lang: Lang; toc: TocEntry[] }) {
  const t = ARTICLE_TEXT[lang];
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [dragging, setDragging] = useState(false);
  /** 每颗方块的位置（量出来的，不是猜的） */
  const [marks, setMarks] = useState<ProgressMark[]>([]);
  /** 指针停在哪一颗上 / 键盘落在哪一颗上（显示它的标题签） */
  const [hovered, setHovered] = useState<string | null>(null);
  /** 拖动时滑块附近的那一颗（指尖设备没有 hover，标题只能靠它报出来） */
  const [near, setNear] = useState<string | null>(null);
  /** 正在读的小节：与悬浮目录高亮的那一条是**同一个答案**（见 ./useActiveHeading.ts） */
  const active = useActiveHeading(toc);

  /** 按住那一刻的纵坐标（null = 现在没按住） */
  const press = useRef<number | null>(null);
  /** 是否已越过阈值、进入「真的在拖」的状态（state 只用于 CSS，判断走 ref 免得慢一帧） */
  const draggingRef = useRef(false);

  /** 要做成方块的小节：与目录面板列出来的是**同一批**（深于 TOC_MAX_DEPTH 的不列） */
  const sections = useMemo(
    () => flattenToc(toc).filter((entry) => entry.depth <= TOC_MAX_DEPTH),
    [toc],
  );

  /** 量一遍每颗方块该待的位置：标题的文档纵坐标 / 可滚动高度 */
  const measureMarks = useCallback((): void => {
    const span = document.documentElement.scrollHeight - window.innerHeight;
    setMarks(
      sections.map((section) => {
        const element = document.getElementById(section.id);
        if (element === null || span <= 0) return { ...section, pos: 0 };
        const top = element.getBoundingClientRect().top + window.scrollY;
        return { ...section, pos: Math.min(Math.max(top / span, 0), 1) };
      }),
    );
  }, [sections]);

  useEffect(() => {
    measureMarks();

    // 正文的高度是**后到的**：图表 `import()` 进来、图片解码、字体换掉，都会把后面的标题
    // 往下推。所以盯住 body 的高度（ResizeObserver），而不是猜两个延迟 —— 高度一变就重新量。
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measureMarks);
    if (observer !== null) observer.observe(document.body);
    window.addEventListener("resize", measureMarks);
    // 读者在设置里改了正文宽度 / 字号，标题的位置也跟着变（第 7 项那条偏好事件）
    window.addEventListener(READING_EVENT, measureMarks);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measureMarks);
      window.removeEventListener(READING_EVENT, measureMarks);
    };
  }, [measureMarks]);

  useEffect(() => {
    let frame = 0;

    const measure = (): void => {
      frame = 0;
      const root = document.documentElement;
      const y = window.scrollY || root.scrollTop || 0;
      const span = root.scrollHeight - window.innerHeight;
      const ratio = span > 0 ? y / span : y > 0 ? 1 : 0;
      setProgress(Math.round(Math.min(Math.max(ratio, 0), 1) * 100));
      setShowTop(y > BACK_TO_TOP_AFTER);
    };

    const onScroll = (): void => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  /** 把「整页的百分之几」滚过去：拖动、点轨道、键盘都走这一个落点（只有一处算法） */
  function seekTo(ratio: number): void {
    const root = document.documentElement;
    const span = root.scrollHeight - window.innerHeight;
    if (span <= 0) return;
    const clamped = Math.min(Math.max(ratio, 0), 1);
    window.scrollTo({ top: clamped * span, behavior: "auto" });
    // 立刻反映到界面上：scroll 事件要等下一帧才回来，拖动时差这一帧就看得见「跟不上手」
    setProgress(Math.round(clamped * 100));
  }

  /** 离给定比例最近的那一颗方块；超过 `PROGRESS_NEAR_THRESHOLD` 就算没靠近（返回 null） */
  function nearestMark(ratio: number): string | null {
    let id: string | null = null;
    let distance = Infinity;
    for (const mark of marks) {
      const gap = Math.abs(mark.pos - ratio);
      if (gap < distance) {
        distance = gap;
        id = mark.id;
      }
    }
    return distance <= PROGRESS_NEAR_THRESHOLD ? id : null;
  }

  /** 视觉上仍是「百分比高度」的填充与环 —— 分量都从这一个数来 */
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    press.current = event.clientY;
    // 指针捕获：拖出轨道（甚至拖出窗口）之后仍然收得到 move 事件
    event.currentTarget.setPointerCapture(event.pointerId);
    if (event.pointerType === "mouse") {
      // 鼠标：按一下轨道就跳过去（滚动条的手感），不必先移动
      draggingRef.current = true;
      setDragging(true);
      const ratio = event.clientY / window.innerHeight;
      seekTo(ratio);
      setNear(nearestMark(ratio));
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    if (press.current === null) return;
    if (!draggingRef.current) {
      // 触屏：先移动够阈值才承认这是拖动（否则「想滚页面却点到轨道」会当场跳走）
      if (Math.abs(event.clientY - press.current) < DRAG_THRESHOLD) return;
      draggingRef.current = true;
      setDragging(true);
    }
    const ratio = event.clientY / window.innerHeight;
    seekTo(ratio);
    setNear(nearestMark(ratio));
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>): void {
    if (press.current === null) return;
    press.current = null;
    if (draggingRef.current) {
      draggingRef.current = false;
      setDragging(false);
    }
    setNear(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  /** 键盘：↑/↓ 或 ←/→ 一步、PageUp/PageDown 三步、Home/End 到两头 */
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const step = PROGRESS_KEY_STEP;
    let next: number;
    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
        next = progress + step;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        next = progress - step;
        break;
      case "PageUp":
        next = progress + step * 3;
        break;
      case "PageDown":
        next = progress - step * 3;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = 100;
        break;
      default:
        return;
    }
    event.preventDefault();
    seekTo(next / 100);
  }

  /** 点方块 = 跳到那一节。平滑与否交给 CSS：`html:has(.article-page)` 只在允许动效时开 smooth */
  function goToMark(id: string): void {
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }

  function toTop(): void {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <>
      {/*
        轨道 = 右边缘那条 2px 细线的命中区（CSS 里放宽、平时几乎看不见）。
        它铺满视口高度，所以 `event.clientY / window.innerHeight` 就是百分比 —— 拖到哪就是哪。
      */}
      <div
        className="article-progress"
        role="slider"
        tabIndex={0}
        aria-label={t.progressLabel}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        title={t.progressHint}
        data-dragging={dragging ? "true" : "false"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <span className="article-progress-rail" aria-hidden="true" />
        <span
          className="article-progress-fill"
          aria-hidden="true"
          style={{ height: `${progress}%` }}
        />
        <span
          className="article-progress-thumb"
          aria-hidden="true"
          style={{ top: `${progress}%` }}
        />
      </div>

      {/*
        章节节点：压在轨道上的一列方块。它**不是**上面那个滑块的子元素（见文件头第 4 条），
        所以自己铺满视口、平时不吃指针（`pointer-events: none`），只把方块本身让出来。
      */}
      {marks.length > 0 && (
        <div className="article-progress-marks" role="group" aria-label={t.progressSections}>
          {marks.map((mark) => {
            const current = active === mark.id;
            const reached = mark.pos <= progress / 100;
            const named = hovered === mark.id || near === mark.id;
            return (
              <button
                key={mark.id}
                type="button"
                className="article-progress-dot"
                style={{ top: `${mark.pos * 100}%` }}
                data-depth={mark.depth}
                data-reached={reached ? "true" : "false"}
                data-active={current ? "true" : "false"}
                data-near={near === mark.id ? "true" : "false"}
                aria-current={current ? "true" : undefined}
                aria-label={mark.text}
                /* 方块压在轨道上：按下要停在这里，别让底下的滑块把它当成一次「点轨道就跳」 */
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => goToMark(mark.id)}
                onMouseEnter={() => setHovered(mark.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(mark.id)}
                onBlur={() => setHovered(null)}
              >
                <span className="article-progress-dot-core" aria-hidden="true" />
                {/* 标题签：平时 opacity 0，悬停 / 聚焦 / 拖动靠近时才浮出来 */}
                <span
                  className="article-progress-dot-label"
                  data-show={named ? "true" : "false"}
                  aria-hidden="true"
                >
                  {mark.text}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p
        className="article-progress-value"
        aria-hidden="true"
        title={`${t.progressLabel} ${progress}%`}
      >
        {progress}%
      </p>

      <button
        type="button"
        className="article-top"
        data-visible={showTop ? "true" : "false"}
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        aria-label={t.backToTop}
        title={t.backToTop}
        onClick={toTop}
      >
        {/* 环 = 同一份进度：`stroke-dashoffset` 从满到空，起点在 12 点方向（CSS 里转 -90°） */}
        <svg className="article-top-ring" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
          <circle className="article-top-ring-track" cx="18" cy="18" r={RING_RADIUS} />
          <circle
            className="article-top-ring-fill"
            cx="18"
            cy="18"
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
          />
        </svg>
        <Icon icon={icons["mdi:arrow-up"]} width="1.1em" height="1.1em" />
      </button>
    </>
  );
}