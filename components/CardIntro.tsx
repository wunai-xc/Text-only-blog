"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 文章卡片的入场动画（第 11 项的卡片，全站统一）
 *
 * 卡片出现在三个地方（首页第 2 栏、列表页 / 搜索页、卡组页），它们共用
 * `components/list/PostCard.tsx`，所以动画也只做一处：**在这里给卡片加属性，样式全在 CSS**。
 *
 * 渐进增强的顺序与顶栏（components/HeaderIntro.tsx）同一条规矩：
 *   卡片**默认可见** → 只有被观察器认领的卡片才先藏起来（`data-card-ready="hidden"`）→
 *   进入视口时改成 `"in"` 播过渡。
 * 所以禁用 JS、JS 报错、或者 `IntersectionObserver` 不存在时，卡片一直都在 ——
 * 绝不出现「内容永远隐形」。`prefers-reduced-motion: reduce` 的人只拿到 `"in"`，一帧到位。
 *
 * 三个决定：
 *   1. **错开**：同一屏最多错开 8 张（每张 45ms）—— 再多就成了「依次冒出」，扫读时反而慢；
 *      延迟写成 `--card-delay`，样式里读它（组件里不写 transition）；
 *   2. **只算当前这一页的首次出现**：换页后（pathname 变）重新扫一遍。客户端筛选换出的新卡片
 *      **不再播动画** —— 每敲一个字都让整屏卡片重新冒一遍，是干扰不是效果；
 *   3. 观察器**一直挂着**（进入视口才 reveal 一次），所以「先藏起来」的卡片一定有观察者，
 *      不会因为筛选把它们挪进视口就永远看不见。
 */
export default function CardIntro() {
  const pathname = usePathname();

  useEffect(() => {
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".post-card:not([data-card-ready])"),
    );
    if (cards.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      cards.forEach((card) => card.setAttribute("data-card-ready", "in"));
      return;
    }

    cards.forEach((card, index) => {
      card.style.setProperty("--card-delay", `${Math.min(index, 7) * 45}ms`);
      card.setAttribute("data-card-ready", "hidden");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).setAttribute("data-card-ready", "in");
          observer.unobserve(entry.target);
        }
      },
      // 底部提前 8% 触发：卡片刚露出一点就开始揭，滚到眼前时已经就位
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
