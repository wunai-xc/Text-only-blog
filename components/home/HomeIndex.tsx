"use client";

import { useEffect, useRef, useState } from "react";

import { HOME_ORDER, HOME_TEXT, homeNumber, type HomeBlockId } from "@/lib/home";
import type { Lang } from "@/lib/site";

/**
 * 侧边指示器（第 9 项）：固定在右侧的一列锚点，当前所在的那一栏会亮起来。
 *
 * 三个设计决定：
 *   1. **它就是一组真锚点**（`<a href="#home-…">`）：没有 JS 也能跳；
 *      滚动动画交给 CSS（`html:has(.home-flow)` 的 `scroll-behavior: smooth`，
 *      且只在 `prefers-reduced-motion: no-preference` 里开），所以这里一行滚动逻辑都不用写；
 *   2. **高亮用 IntersectionObserver**，判定带取「正跨过视口中线」的那一带
 *      （rootMargin -45%）：一栏一屏，所以带里通常只有一栏 —— 它亮着就是「你在这一栏」。
 *      可见项累积在 ref 的 Set 里：IO 每次只给变化的那几条，不累积就会闪；
 *   3. 栏名常驻 DOM、靠 CSS 展开（不是 `display: none`），所以读屏与键盘用户也读得到；
 *      窄屏整列隐藏（`.home-index`，见 globals.css），那点宽度留给正文 ——
 *      每栏的栏号本来就印在栏头（HomeBlockHead），不会因此不知道自己在哪一栏。
 *
 * 层序：`z-index: 18` —— 低于顶栏（20）与设置抽屉（50），所以抽屉打开时它被盖住。
 */
export default function HomeIndex({ lang }: { lang: Lang }) {
  const text = HOME_TEXT[lang];
  const [active, setActive] = useState<HomeBlockId[]>([]);
  const visible = useRef<Set<HomeBlockId>>(new Set());

  useEffect(() => {
    const sections = HOME_ORDER.map((id) => document.getElementById(`home-${id}`)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id.replace("home-", "") as HomeBlockId;
          if (entry.isIntersecting) visible.current.add(id);
          else visible.current.delete(id);
        }
        setActive([...visible.current]);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="home-index" aria-label={text.indexLabel}>
      <p className="home-index-note">{text.indexNote}</p>
      {HOME_ORDER.map((id) => {
        const current = active.includes(id);
        return (
          <a
            key={id}
            className="home-index-entry"
            href={`#home-${id}`}
            aria-current={current ? "true" : undefined}
          >
            <span className="home-index-name">{text.blocks[id].title}</span>
            <span className="home-index-no">{homeNumber(id)}</span>
          </a>
        );
      })}
    </nav>
  );
}
