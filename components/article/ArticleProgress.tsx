"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/offline";

import { ARTICLE_TEXT, BACK_TO_TOP_AFTER } from "@/lib/article";
import { icons } from "@/lib/icons";
import type { Lang } from "@/lib/site";

/**
 * 阅读进度 + 回到顶部（第 12 项）
 *
 * 右侧那条 2px 的细线是**整页**的滚动进度（不是正文的进度）：读到页面底部就是 100%，
 * 不会出现「正文读完了、百分比却停在 87%」这种让人不放心的数字。百分比小牌子在宽屏才显示
 * （窄屏上它会挤到正文，见 globals.css 的「6e. 文章页」）。
 *
 * 做法是**一次 scroll 监听**（passive + requestAnimationFrame 节流），两件事共用：
 *   - 进度 = scrollY / (scrollHeight - innerHeight)，钳在 0~100；
 *   - 滚动超过 `BACK_TO_TOP_AFTER` 才显示回顶按钮。
 * 没有用 IntersectionObserver 是因为这两件事本来就是「页面滚了多少」，与元素位置无关。
 *
 * 回顶按钮：`prefers-reduced-motion: reduce` 的读者用瞬时跳转（不做平滑滚动）；
 * 不可见时 `aria-hidden` + `tabIndex={-1}`，键盘不会 Tab 到一个看不见的按钮上。
 * 右下角本来印着图纸图签（装饰），文章页把它让给这颗按钮 —— 见 globals.css。
 */
export default function ArticleProgress({ lang }: { lang: Lang }) {
  const t = ARTICLE_TEXT[lang];
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

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

  function toTop(): void {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <>
      <div className="article-progress" aria-hidden="true">
        <span className="article-progress-fill" style={{ height: `${progress}%` }} />
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
        <Icon icon={icons["mdi:arrow-up"]} width="1.1em" height="1.1em" />
      </button>
    </>
  );
}
