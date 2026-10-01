"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/offline";

import { ARTICLE_TEXT, BACK_TO_TOP_AFTER, PROGRESS_KEY_STEP } from "@/lib/article";
import { icons } from "@/lib/icons";
import type { Lang } from "@/lib/site";

/**
 * 阅读进度（**可拖动的滑块**）+ 回到顶部（**带进度环**）（第 12 项）
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
 * **滑块**（这一轮新增）：那条细线同时是 `role="slider"` 的轨道 ——
 *   1. 轨道**铺满视口高度**，所以「鼠标纵坐标 / 视口高」就是百分比，拖动是线性的、跟手的
 *      （视觉上仍是右边缘那 2px，命中区在 CSS 里放宽到 ~0.9rem，否则 2px 根本抓不住）；
 *   2. **先承认这是拖动、再动页面**：触屏上先把指针移动 `DRAG_THRESHOLD` 像素才生效 ——
 *      手机右边缘常被拿来滚页面，一按就跳会吓人（轨道上 `touch-action: none`，
 *      所以那一下不会同时滚页面）。鼠标不受这条限制：按一下轨道就跳过去，那是滚动条的手感；
 *   3. 拖动用 `setPointerCapture`：拖出轨道、拖出窗口都还继续跟手；
 *   4. **键盘也能走**（`PROGRESS_KEY_STEP`）：↑/↓ 或 ←/→ 一步、PageUp/PageDown 三步、
 *      Home/End 到两头 —— 一个只有鼠标能用的控件不算做完了。
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

export default function ArticleProgress({ lang }: { lang: Lang }) {
  const t = ARTICLE_TEXT[lang];
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [dragging, setDragging] = useState(false);
  /** 按住那一刻的纵坐标（null = 现在没按住） */
  const press = useRef<number | null>(null);
  /** 是否已越过阈值、进入「真的在拖」的状态（state 只用于 CSS，判断走 ref 免得慢一帧） */
  const draggingRef = useRef(false);

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
      seekTo(event.clientY / window.innerHeight);
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
    seekTo(event.clientY / window.innerHeight);
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>): void {
    if (press.current === null) return;
    press.current = null;
    if (draggingRef.current) {
      draggingRef.current = false;
      setDragging(false);
    }
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
