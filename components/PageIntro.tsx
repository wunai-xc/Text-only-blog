"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { PAGE_FADE_MS } from "@/lib/decor";

/**
 * 换页渐入（第 8 项的扩展）：换到新一页时，正文**淡入**一次。
 *
 * 它只做一件事：换页后在 `<html>` 上写一个 `data-page-in` 属性，420ms 后摘掉。
 * 样式全在 CSS（globals.css 第 5d 节：`html[data-page-in] .site-main { animation: page-fade-in … }`）。
 *
 * 四个刻意的取舍（都是为了「不影响阅读」）：
 *   1. **只淡不位移**：`opacity` 0.3 → 1。不加 `translateY` —— 只要 `.site-main` 上出现
 *      `transform`，它就成了 fixed 后代的包含块，文章页右侧那条可拖的进度轨、目录挂件会在
 *      动画期间跟着 `.site-main` 走，肉眼看到「跳一下再归位」。渐入的观感损失很小，这个坑很大；
 *   2. **首帧不播**：首屏是一次「已经翻开的纸」，没有「换页」这回事（与 FigureLayer 同规矩）——
 *      否则每次打开站点、每次刷新都要先把正文压暗再淡上来，反而像加载慢；
 *   3. **在布局阶段改属性**（`useLayoutEffect`）：换页那一刻 React 是「先换 DOM、再跑副作用」，
 *      如果属性在 paint 之后才挂上，读者会看到一帧**全不透明**的新页面、然后突然变暗再淡上来
 *      （一次闪光）。布局副作用在 paint 之前跑，所以新页面的**第一帧就是 0.3 的不透明度**，
 *      全程没有闪。服务端渲染时用 useEffect 顶替（避免 React 的 useLayoutEffect SSR 警告）；
 *   4. 连着快速换两页时，先摘属性、强制一次样式重算再挂回去 —— 否则浏览器认为「动画没变」，
 *      第二次渐入不会重新开始。
 *
 * `prefers-reduced-motion: reduce` 的读者：这条完全不参与（连属性都不写）。
 * 打印：与屏幕上的动画无关（纸上是静态版面）。
 */

/** 服务端渲染时不跑 layout effect（也用不到）；两边引用稳定，不违反 hooks 规则 */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function PageIntro() {
  const pathname = usePathname();
  /** 记着「上一次播过的是哪一页」：挂载时它就等于当前路径，所以首帧自然不播 ——
      这样写比一个 `mounted` 布尔更稳（开发模式下 React 会把 effect 跑两遍，
      布尔会被第一次跑掉，于是首屏也淡一次） */
  const lastPath = useRef(pathname);

  useIsoLayoutEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    // 先摘掉并强制重算，再挂回去：动画才会重新开始（见文件头第 4 条）
    root.removeAttribute("data-page-in");
    void root.offsetWidth;
    root.setAttribute("data-page-in", "");

    const timer = window.setTimeout(() => {
      root.removeAttribute("data-page-in");
    }, PAGE_FADE_MS);

    return () => {
      window.clearTimeout(timer);
      root.removeAttribute("data-page-in");
    };
  }, [pathname]);

  return null;
}
