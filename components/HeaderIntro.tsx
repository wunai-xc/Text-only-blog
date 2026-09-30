"use client";

import { useEffect } from "react";

/**
 * 顶栏入场动画与光标控制（顶栏改版时对齐 wunai-blog 的 HeaderIntro）
 *
 * 从 SiteHeader 里抽出来只有一个原因：SiteHeader 是**服务端组件**（它要在构建期读一次
 * 内容统计，那些数字直接进 HTML），而这两件事只能跑在浏览器里。
 *
 * 这两件事都很小，但都不该省：
 *   1. **级联入场**：三段（品牌 / 友链 / 图片位）依次淡入，每段错开 90ms ——
 *      顶栏是每页都会看到的东西，一次性整块出现会显得硬；
 *   2. **光标暂停**：站名后面那根闪烁光标是常驻的无限动画。标签页切到后台时把它停掉
 *      （`document.hidden`），省电，切回来也不会闪成一片 —— 与第 6 项
 *      「动效一律尊重 prefers-reduced-motion」是同一条约定下的做法。
 *
 * ⚠️ 渐进增强的顺序很关键，写反了会让顶栏在 JS 失败时**永久不可见**：
 *   默认（CSS 里）就是可见的 → JS 就绪后才加 `.fade-ready` 把它藏起来 → 下一帧再加
 *   `.is-visible` 播过渡。所以 `next dev` 里看到的是可见 → 淡入，而禁用 JS 时顶栏一直都在。
 *   `prefers-reduced-motion: reduce` 的人不参与：直接给 `.is-visible`，一帧到位。
 */
export default function HeaderIntro() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("[data-fade]");

    if (items.length > 0) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        items.forEach((el) => el.classList.add("is-visible"));
      } else {
        items.forEach((el) => el.classList.add("fade-ready"));

        const timers: number[] = [];
        const raf = requestAnimationFrame(() => {
          items.forEach((el, index) => {
            timers.push(window.setTimeout(() => el.classList.add("is-visible"), index * 90));
          });
        });

        return () => {
          cancelAnimationFrame(raf);
          timers.forEach(clearTimeout);
        };
      }
    }
  }, []);

  useEffect(() => {
    const cursor = document.querySelector<HTMLElement>(".cursor");
    if (!cursor) return;

    const sync = () => cursor.classList.toggle("is-paused", document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return null;
}
