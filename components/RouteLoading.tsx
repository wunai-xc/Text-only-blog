"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * 全站加载动画（换页时顶栏下面那条细线）
 *
 * 为什么需要它：静态导出**没有服务端流式渲染**，App Router 的 `loading.tsx` 在这种模式下
 * 不会生效，换页时浏览器只会「卡住」一下再换出整页 —— 读者看不出「点了、正在过去」。
 * 这条线补的就是这一下反馈（与参考项目 wunai-Blog 的 RouteLoading 是同一件事，
 * 这里按纸面气质做成一条「描线」：从左边画到右边，收尾时淡出）。
 *
 * 三条触发路径，都只听真实事件，不猜时间：
 *   1. **站内点击**：document 上挂一个捕获阶段的 click 监听（不给每个 `<a>` 挂 onClick，
 *      于是页脚、卡片、目录、随手写的链接全都自动带上）。外链、`target`、`download`、
 *      按住修饰键、点击位置不在链接上、以及**点了当前这一页**的链接，都不启动；
 *   2. **前进 / 后退**：popstate 启动；
 *   3. **首屏**：`document.readyState` 还不是 complete 时先画上（样式 / 图片 / 字体真的在加载），
 *      到 `load` 收尾。首屏本来就加载完了（缓存命中）则不画 —— 不假装在加载。
 *
 * 「完成」的信号是 `usePathname()` 变了（App Router 渲染完新页面才会变），所以这条线的进度
 * 不是定时器编出来的：它只负责**爬到 88% 停住等**（见 CSS 的 route-loading-run），
 * 真正的收尾由换页完成触发。
 *
 * 无障碍与动效：整条线 `aria-hidden`（它是装饰，不是状态播报 —— 搜索索引那种真状态
 * 由页面自己的文案说）；`prefers-reduced-motion: reduce` 时不画爬升动画，
 * 只用一次 0.18s 的淡入淡出把「正在换页」这件事说出来。
 */

/** done 之后停留多久再收起（给 100% 那一下留出看得见的时间） */
const DONE_MS = 240;

type Phase = "idle" | "loading" | "done";

/** 这次点击会不会导致换页（不会就别启动动画） */
function isInternalNavigation(event: MouseEvent): boolean {
  // 只认左键单击，且没有按着修饰键（那是「新标签页 / 新窗口 / 下载」的意思）
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  if (event.defaultPrevented) return false;

  const target = event.target;
  if (!(target instanceof Element)) return false;

  const anchor = target.closest("a");
  if (!anchor) return false;
  if (anchor.target !== "" && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href");
  if (href === null || href === "" || href.startsWith("#")) return false;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // 同一页（只差查询串 / 哈希）也启动：列表页的筛选是客户端状态、点了会立刻变，
  // 但「换到另一页」这件事仍然值得给一条线（例如从 /posts/ 跳到文章页）。
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

export default function RouteLoading() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  /** 与 phase 同步的一份，避免在 effect 里读过期的 state */
  const phaseRef = useRef<Phase>("idle");
  /** 首帧不播收尾：挂载时那次 pathname 不是「换页完成」 */
  const mounted = useRef(false);
  const timer = useRef<number | null>(null);

  const setPhaseBoth = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setPhaseBoth("loading");
  }, [clearTimer, setPhaseBoth]);

  const finish = useCallback(() => {
    clearTimer();
    setPhaseBoth("done");
    timer.current = window.setTimeout(() => setPhaseBoth("idle"), DONE_MS);
  }, [clearTimer, setPhaseBoth]);

  /* 1. 站内点击 / 2. 前进后退 / 3. 首屏资源 */
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (isInternalNavigation(event)) start();
    }
    function onPopState() {
      start();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    let onLoad: (() => void) | null = null;
    if (document.readyState !== "complete") {
      start();
      onLoad = () => finish();
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      if (onLoad) window.removeEventListener("load", onLoad);
      clearTimer();
    };
  }, [start, finish, clearTimer]);

  /* 换页完成（App Router 换了 pathname）→ 收尾 */
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (phaseRef.current === "loading") finish();
  }, [pathname, finish]);

  return (
    <div className="route-loading" data-phase={phase} aria-hidden="true">
      <span className="route-loading-bar" />
    </div>
  );
}
