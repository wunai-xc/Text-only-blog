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
 * **滑块**（第 12 项那一轮加的，这一轮补上触屏与鼠标两套手势）：那条细线同时是
 * `role="slider"` 的轨道 ——
 *   1. 轨道从顶 / 底**内缩一段**（让开粘性标题与回顶按钮，见 globals.css 的 --progress-inset-*），
 *      「指针纵坐标落在轨道里多少」就是百分比（`ratioFromY` 量轨道自己的矩形），
 *      视觉上仍是右边缘那 2px，命中区在 CSS 里放宽到 ~0.9rem；
 *   2. **中间那颗圆钮（抓手）始终可见**，而且它自己 `touch-action: none` —— 触屏没有 hover，
 *      藏起来或等悬停就等于没有滑块。抓住它，鼠标与指尖都是**一按下就进入拖动**（不必等阈值）；
 *   3. 轨道本身是 `touch-action: pan-y`：在右边缘上下滑仍然是**滚页面**（浏览器接管，
 *      拖到一半会收到 pointercancel），不会因为手指蹭到这条线就跳页。触屏若真的移动过阈值
 *      （浏览器没接管），才承认是拖动；鼠标不受这条限制：按一下轨道就跳过去，那是滚动条的手感；
 *   4. 拖动用 `setPointerCapture`（捕获在轨道上）：拖出轨道、拖出窗口都还继续跟手；
 *   5. **键盘也能走**（`PROGRESS_KEY_STEP`）：↑/↓ 或 ←/→ 一步、PageUp/PageDown 三步、
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
 * 回顶按钮：**进度环 + 圆心读数**，环与右边那条线读同一个 `progress`（`stroke-dashoffset`）。
 * 圆心读的东西跟着进度走：没到底时显示当前百分比，读到 100% 才换成「回到顶部」的箭头
 * （那时按钮的用意才明确 —— 上面已经没有可滚的了）。
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

  /** 轨道元素（`.article-progress`）：指针映射与指针捕获都基于它自己的矩形 */
  const railRef = useRef<HTMLDivElement | null>(null);
  /** 按住那一刻的纵坐标（null = 现在没按住） */
  const press = useRef<number | null>(null);
  /** 按住的触点 id：捕获到轨道上之后，move / up 才回到轨道 */
  const pressId = useRef<number | null>(null);
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

  /**
   * 指针纵坐标 → 0~1：相对**轨道自己的矩形**。
   * 轨道已从顶 / 底内缩（让开粘性标题与回顶按钮，见 globals.css 的 --progress-inset-*），
   * 不再是整个视口高，所以这里不能再用 `clientY / innerHeight`。
   */
  function ratioFromY(clientY: number): number {
    const rect = railRef.current?.getBoundingClientRect();
    if (rect === undefined || rect.height <= 0) return 0;
    return (clientY - rect.top) / rect.height;
  }

  /** 真正开始拖动：捕获指针（拖出轨道、拖出窗口都还跟手）+ 立刻滚到指针处 */
  function startDrag(event: React.PointerEvent<HTMLElement>): void {
    draggingRef.current = true;
    setDragging(true);
    // 捕获到**轨道**上：之后 move / up 都回到轨道的处理器，抓手那边不用再写一套
    railRef.current?.setPointerCapture(event.pointerId);
    const ratio = ratioFromY(event.clientY);
    seekTo(ratio);
    setNear(nearestMark(ratio));
  }

  /** 在轨道空白处按下 */
  function onRailDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    press.current = event.clientY;
    pressId.current = event.pointerId;
    // 鼠标：点一下轨道就跳过去（滚动条的手感），不必先移动。
    // 触屏：先按着、不捕获 —— 让浏览器照常滚页面；等移动够阈值（onMove）再承认这是拖动。
    if (event.pointerType === "mouse") startDrag(event);
  }

  /** 在「抓手」（圆钮）上按下：不管是鼠标还是指尖，抓住了就是要拖，不必等阈值 */
  function onThumbDown(event: React.PointerEvent<HTMLSpanElement>): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // 别让轨道再把它当成一次「按轨道就跳」
    event.stopPropagation();
    press.current = event.clientY;
    pressId.current = event.pointerId;
    startDrag(event);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    if (press.current === null || event.pointerId !== pressId.current) return;
    if (!draggingRef.current) {
      // 触屏：先移动够阈值才承认这是拖动（否则「想滚页面却点到轨道」会当场跳走）
      if (Math.abs(event.clientY - press.current) < DRAG_THRESHOLD) return;
      // 浏览器没把这一下当成滚动（否则会给 pointercancel）：现在接管，开始拖
      railRef.current?.setPointerCapture(event.pointerId);
      draggingRef.current = true;
      setDragging(true);
    }
    const ratio = ratioFromY(event.clientY);
    seekTo(ratio);
    setNear(nearestMark(ratio));
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>): void {
    if (press.current === null || event.pointerId !== pressId.current) return;
    press.current = null;
    pressId.current = null;
    if (draggingRef.current) {
      draggingRef.current = false;
      setDragging(false);
    }
    setNear(null);
    if (railRef.current?.hasPointerCapture(event.pointerId)) {
      railRef.current.releasePointerCapture(event.pointerId);
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

  /** 读到底了吗：决定圆心那点位置显示百分比还是箭头 */
  const done = progress >= 100;

  return (
    <>
      {/*
        轨道 = 右边缘那条 2px 细线的命中区（CSS 里放宽）。它从顶 / 底内缩一段
        （让开粘性标题与回顶按钮），所以百分比是「指针纵坐标落在轨道里多少」（ratioFromY），
        拖到哪就是哪。鼠标按一下轨道即跳；指尖抓住中间那颗圆钮拖动（触屏在轨道上滑仍是滚页面）。
      */}
      <div
        className="article-progress"
        ref={railRef}
        role="slider"
        tabIndex={0}
        aria-label={t.progressLabel}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        title={t.progressHint}
        data-dragging={dragging ? "true" : "false"}
        onPointerDown={onRailDown}
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
        {/* 抓手（圆钮）：它自己收指针 —— 抓住它拖动，鼠标与指尖都是一按下就生效 */}
        <span
          className="article-progress-thumb"
          aria-hidden="true"
          style={{ top: `${progress}%` }}
          onPointerDown={onThumbDown}
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
        /* 圆心显示百分比时，可见文字要进无障碍名（Label in Name）；读到底只剩箭头，名字就是「回到顶部」 */
        aria-label={done ? t.backToTop : `${t.backToTop} ${progress}%`}
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
        {/* 圆心：没读到底报百分比，读到底（100%）才亮出「回到顶部」的箭头 */}
        {done ? (
          <Icon icon={icons["mdi:arrow-up"]} width="1.1em" height="1.1em" />
        ) : (
          <span className="article-top-value">{progress}%</span>
        )}
      </button>
    </>
  );
}