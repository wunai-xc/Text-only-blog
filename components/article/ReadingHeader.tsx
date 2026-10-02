"use client";

import { useEffect, useState } from "react";

/**
 * 阅读文章时的顶栏行为（对齐 wunai-blog 参考稿的 ReadingHeader）
 *
 * 滚进正文之后顶栏自动收起，双击（鼠标或触屏）再把它请出来。
 * 只在文章页渲染（挂在 PostNav 位置，也就是 page.tsx 的正文分支里），
 * 因此不影响首页、列表页等需要常驻导航的地方。
 *
 * 三个设计决定：
 *   1. **滚离顶部才收起。** 顶栏是 sticky 的，它的占位仍在文档最顶上；
 *      若在 scrollY = 0 就把它上移，页面顶部会露出一条与顶栏等高的空白带。
 *      滚过 TOP_ZONE 之后，那块占位已经在视口之上，上移只会揭出被它盖住的内容。
 *   2. **双击切的是「临时呼出」，不是「永久显示」。** 双击后顶栏保持展开，
 *      回滚到页面顶部时自动复位，回到「跟随滚动」的常态 ——
 *      不会因为一次误触就把「阅读时收起」永久关掉。
 *   3. 实现方式是往 `<html>` 上写 `data-reading` 属性，样式在 globals.css（6b. 框架 UI）：
 *      顶栏 `translateY(-100%)`，同时 `--chrome-top` 归零，目录挂件 / 粘性标题顺势上移补位。
 *      组件卸载时摘掉该属性，离开文章页顶栏立刻恢复正常。
 *
 * 与参考稿一样用 document 级的 dblclick / touchend：阅读页上「双击」没有别的用途，
 * 让它来开关顶栏最顺手。
 */

/** 距顶多少像素内不收顶栏（sticky 占位还没滚出视口，收起来会露出空白带） */
const TOP_ZONE = 120;
/** 两次轻触 / 点击的间隔上限（超过就算两次单击，不算双击） */
const DOUBLE_TAP_MS = 320;
/** 同一次手势会同时触发 touch 与 mouse 两路事件，去重窗口 */
const SWALLOW_MS = 400;

export default function ReadingHeader() {
  const [pastTop, setPastTop] = useState(false);
  const [revealed, setRevealed] = useState(false);

  /* 滚动：是否已离开顶部（rAF 节流，多次事件合并到一帧） */
  useEffect(() => {
    let frame = 0;

    const measure = (): void => {
      frame = 0;
      const y = window.scrollY;
      setPastTop(y > TOP_ZONE);
      // 回到顶部即复位手动呼出状态，避免它一直粘着
      if (y <= TOP_ZONE) setRevealed(false);
    };

    const onScroll = (): void => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* 双击（鼠标 dblclick / 触屏双轻触）：呼出与收回 */
  useEffect(() => {
    let lastTap = 0;
    let lastHandled = 0;

    const toggle = (): void => {
      lastHandled = Date.now();
      setRevealed((value) => !value);
    };

    /**
     * 鼠标：一次 `dblclick` 本身就是一次「双击」手势 —— 直接切换。
     * （不要像触屏那样再去等第二下：`dblclick` 一次手势只派发一次，
     * 当成「第一下」的话鼠标双击永远唤不回顶栏。）
     */
    const onDoubleClick = (): void => {
      if (Date.now() - lastHandled < SWALLOW_MS) return; // 触屏双轻触之后浏览器补的 dblclick，去重
      toggle();
    };

    /** 触屏：`touchend` 每轻触一次派发一次，两次间隔够近才算「双击」 */
    const onTouchEnd = (): void => {
      const now = Date.now();
      if (now - lastHandled < SWALLOW_MS) return;
      const gap = now - lastTap;
      lastTap = now;
      if (gap > DOUBLE_TAP_MS) return; // 第一次，等第二下
      lastTap = 0;
      toggle();
    };

    document.addEventListener("dblclick", onDoubleClick);
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("dblclick", onDoubleClick);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  /* 把状态写到 <html> 上（样式在 globals.css 的 6b） */
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-reading",
      pastTop && !revealed ? "hidden" : "shown",
    );
  }, [pastTop, revealed]);

  /* 离开文章页时清理，恢复各页共用的顶栏行为 */
  useEffect(() => {
    return () => document.documentElement.removeAttribute("data-reading");
  }, []);

  return null;
}