"use client";

import { useEffect, useRef, useState } from "react";

import { TOC_ACTIVE_OFFSET } from "@/lib/article";
import type { TocEntry } from "@/lib/markdown";

/**
 * 「正在读哪一个小节」的唯一一份判定（第 12 项）
 *
 * 悬浮目录（ArticleToc）要用它高亮当前那一条，右侧轨道上的章节节点（ArticleProgress）要用它
 * 点亮当前那一颗方块 —— 两处要的是**同一个答案**，所以判定只写在这里一份，不各写一份。
 *
 * 做法与首页侧边指示器（HomeIndex）同一条：IntersectionObserver 取「顶栏下方 → 视口 70% 处」
 * 这一条带，**带里的第一条**就是正在读的小节。带里一条都没有时**保留上一次的结果**（不清空），
 * 否则两个小节之间会闪一下。不挂滚动监听：读到哪一节与「滚了多少」无关。
 *
 * 嵌套的 `TocEntry` 观察前先按**文档顺序**摊平（见 `flattenToc`）：目录是套起来的，
 * 「带里的第一条」只有在文档顺序的一维表上才能直接比较。
 */

/** 摊平后的一条：只留节点层画方块需要的三样 */
export interface FlatTocEntry {
  id: string;
  /** 标题文字（节点旁的签、aria-label 都用它） */
  text: string;
  /** 1–6，对应 h1–h6 */
  depth: number;
}

/** 嵌套目录 → 文档顺序的一维表（`TocEntry` 自己套自己，摊平只此一处） */
export function flattenToc(toc: TocEntry[]): FlatTocEntry[] {
  const list: FlatTocEntry[] = [];
  const walk = (entries: TocEntry[]): void => {
    for (const entry of entries) {
      list.push({ id: entry.id, text: entry.text, depth: entry.depth });
      walk(entry.children);
    }
  };
  walk(toc);
  return list;
}

/** 当前读到的小节 id；还没滚到第一个小节、或这一篇没有小标题时是 null */
export function useActiveHeading(toc: TocEntry[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  /** 此刻落在判定带里的 id：判定带每帧都在变，用 ref 收着，不进 state */
  const visible = useRef<Set<string>>(new Set());

  useEffect(() => {
    const ids = flattenToc(toc).map((entry) => entry.id);
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

  return active;
}