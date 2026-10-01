"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/offline";

import {
  ARTICLE_TEXT,
  BACK_TO_TOP_AFTER,
  PROGRESS_PAGE_STEP,
  PROGRESS_STEP,
} from "@/lib/article";
import { icons } from "@/lib/icons";
import type { Lang } from "@/lib/site";

/**
 * 回顶进度环的半径与周长（viewBox 是 36×36 的正方形坐标系）。
 *
 * 按钮本身是 2.4rem 的正圆，SVG 铺满它，所以 18 就是圆的边缘；半径取 16.8、
 * 描边 2 时最外圈刚好落到 17.8 —— 差一点点不碰到边，避免被 SVG 视口裁掉半像素。
 * 周长的算法**只在这里写一次**：`stroke-dashoffset` 与它对得上才画得准。
 */
const RING_RADIUS = 16.8;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/**
 * 阅读进度 + 进度条滑块 + 回顶进度环（第 12 项）
 *
 * 右侧那条 2px 的细线是**整页**的滚动进度（不是正文的进度）：读到页面底部就是 100%，
 * 不会出现「正文读完了、百分比却停在 87%」这种让人不放心的数字。百分比小牌子在宽屏才显示
 * （窄屏上它会挤到正文，见 globals.css 的「6e. 文章页」）。
 *
 * 做法是**一次 scroll 监听**（passive + requestAnimationFrame 节流），三件事共用：
 *   - 进度 = scrollY / (scrollHeight - innerHeight)，钳在 0~100；
 *   - 滚动超过 `BACK_TO_TOP_AFTER` 才显示回顶按钮；
 *   - 同一个进度还画成回顶按钮上那一圈进度环（`stroke-dashoffset`），所以「读了多久」
 *     与「现在在哪」这两件事永远一致，不需要第二套刻度。
 * 没有用 IntersectionObserver 是因为这几件事本来就是「页面滚了多少」，与元素位置无关。
 *
 * **滑块**：细线尽头那颗小方块可以拖 —— 指针事件（Pointer Events，一套同时管鼠标与触摸）
 * 加上 `setPointerCapture`，所以拖出视口也不掉；拖到哪就滚到哪。它同时是一个真滑块：
 * 键盘上（`role="slider"`）方向键一档 `PROGRESS_STEP`、PageUp/PageDown 一档
 * `PROGRESS_PAGE_STEP`、Home/End 到两头。没滚动的页面（`span <= 0`，一屏就读完的短文章）
 * 上这是个空操作，直接返回，不做除零。
 *
 * 回顶按钮：`prefers-reduced-motion: reduce` 的读者用瞬时跳转（不做平滑滚动）；
 * 不可见时 `aria-hidden` + `tabIndex={-1}`，键盘不会 Tab 到一个看不见的按钮上。
 * 右下角本来印着图纸图签（装饰），文章页把它让给这颗按钮 —— 见 globals.css。
 */
export default function ArticleProgress({ lang }: { lang: Lang }) {
  const t = ARTICLE_TEXT[lang];
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [dragging, setDragging] = useState(false);
  /** 拖拽中：拖拽期间 scroll 事件照旧跑（进度还是由滚动算），这个标记只用来加视觉反馈 */
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

  function prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** 整页可滚动的像素数；短到不用滚的页面上是 0 */
  function scrollSpan(): number {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  function toTop(): void {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  /**
   * 把视口里的一个 y 坐标换算成整页的位置，直接滚过去。
   *
   * 拖动时一律用瞬时（`behavior: "auto"`）：手指还按着的时候再做平滑滚动，
   * 表现是「越拖越滞后」，比不平滑难用得多。滑块与滚动条的轨道上下各内缩了
   * 0.4rem（见 CSS），换算时按整个视口高算，差的那几个像素在拖动里感觉不出来。
   */
  function seek(clientY: number): void {
    const span = scrollSpan();
    if (span <= 0) return;
    const ratio = Math.min(Math.max(clientY / window.innerHeight, 0), 1);
    window.scrollTo({ top: ratio * span, behavior: "auto" });
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    // 拖的是滑块，不要在页面上再触发一次选区 / 原生拖拽
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    setDragging(true);
    seek(event.clientY);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    if (!draggingRef.current) return;
    seek(event.clientY);
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>): void {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const span = scrollSpan();
    if (span <= 0) return;

    let top: number;
    switch (event.key) {
      case "ArrowUp":
        top = window.scrollY - (span * PROGRESS_STEP) / 100;
        break;
      case "ArrowDown":
        top = window.scrollY + (span * PROGRESS_STEP) / 100;
        break;
      case "PageUp":
        top = window.scrollY - (span * PROGRESS_PAGE_STEP) / 100;
        break;
      case "PageDown":
        top = window.scrollY + (span * PROGRESS_PAGE_STEP) / 100;
        break;
      case "Home":
        top = 0;
        break;
      case "End":
        top = span;
        break;
      default:
        return;
    }

    event.preventDefault();
    window.scrollTo({
      top: Math.min(Math.max(top, 0), span),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  return (
    <>
      <div className="article-progress">
        <span className="article-progress-fill" aria-hidden="true" style={{ height: `${progress}%` }} />

        {/* 滑块：位置就是进度百分比（与左边那条线同一个坐标系，所以永远对齐） */}
        <div
          className="article-progress-knob"
          role="slider"
          tabIndex={0}
          aria-label={t.progressLabel}
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={`${progress}%`}
          title={t.progressSeek}
          data-dragging={dragging ? "true" : "false"}
          style={{ top: `${progress}%` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
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
        {/* 进度环：轨道一整圈 + 一段跟着进度长的弧。开始画的位置由 CSS 的
            rotate(-90deg) 转到 12 点方向，所以「从顶上顺时针长」。 */}
        <svg className="article-top-ring" viewBox="0 0 36 36" aria-hidden="true">
          <circle className="article-top-ring-track" cx="18" cy="18" r={RING_RADIUS} />
          <circle
            className="article-top-ring-fill"
            cx="18"
            cy="18"
            r={RING_RADIUS}
            style={{
              strokeDasharray: RING_LENGTH,
              strokeDashoffset: RING_LENGTH * (1 - progress / 100),
            }}
          />
        </svg>
        <Icon icon={icons["mdi:arrow-up"]} width="1.1em" height="1.1em" />
      </button>
    </>
  );
}