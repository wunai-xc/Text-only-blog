"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/offline";

import {
  ARTICLE_TEXT,
  GISCUS_ORIGIN,
  GISCUS_SCRIPT_SRC,
  GISCUS_THEMES,
  commentsTerm,
} from "@/lib/article";
import { icons } from "@/lib/icons";
import { COMMENTS, commentsReady, type Lang } from "@/lib/site";
import { currentTheme, subscribeTheme, type Theme } from "@/lib/theme";

/**
 * giscus 评论（第 12 项）
 *
 * giscus 是一个**第三方 iframe**（数据存在仓库的 GitHub Discussions 里），所以这一节的
 * 取舍写在明面上，也写在页面上：
 *   1. **懒加载**：先用 IntersectionObserver 等到读者滚到评论区附近（rootMargin 600px）
 *      才把 giscus.app 的 `<script>` 插进去 —— 不读评论的读者，一个字节都不会连到那边；
 *   2. **没配置就说明白**：`lib/site.ts` 的 `COMMENTS` 四个值还空着时（仓库现状），
 *      显示「编辑此处」与怎么配，而不是一个空白框（约定第 2 条）；
 *   3. **外观跟着站点走**：三套外观映射成 giscus 的 light / dark（表在 lib/article.ts）。
 *      换外观时用 `postMessage` 通知 iframe 换配色（giscus 的官方接口），**不重新加载**
 *      整个评论区 —— 重载会丢掉读了一半的评论列表；
 *   4. **失败要说话**：iframe 被插件拦掉 / 断网时给一行提示；正文不受影响。
 *
 * 讨论的标题用 `mapping: "specific"` + 文章的站内路径（`commentsTerm`）：同一篇文章的
 * 中英版本、以及带 `?tag=` 之类查询串的地址，都会落到同一个讨论上（按 pathname 映射就没有这份保证）。
 */
export default function GiscusComments({
  lang,
  href,
  enabled,
}: {
  lang: Lang;
  /** 文章的站内路径（`meta.href`），用作 giscus 的 discussion term */
  href: string;
  /** frontmatter 的 `comments`（缺省 true）；false 表示这一篇不要评论区 */
  enabled: boolean;
}) {
  const t = ARTICLE_TEXT[lang];
  const ready = commentsReady();
  const hostRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => currentTheme());

  // 外观变化（设置中心、系统深浅色）→ 下面用它 postMessage 给 iframe
  useEffect(() => subscribeTheme((detail) => setTheme(detail.theme)), []);

  /* ---- 滚到附近才加载 ---- */
  useEffect(() => {
    if (!ready || !enabled) return;
    const host = hostRef.current;
    if (!host) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true); // 老浏览器：不懒加载，直接用
      return;
    }
    const observer = new IntersectionObserver(
      (records) => {
        if (records.some((record) => record.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [ready, enabled]);

  /* ---- 注入 giscus 的 script（它会把自己换成 iframe） ---- */
  useEffect(() => {
    if (!near) return;
    const host = hostRef.current;
    if (!host) return;

    host.replaceChildren();
    const script = document.createElement("script");
    script.src = GISCUS_SCRIPT_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";

    // 当前外观直接读 <html>（首帧脚本已经写好），不放进依赖：换外观走下面的 postMessage
    const data: Record<string, string> = {
      repo: COMMENTS.repo,
      repoId: COMMENTS.repoId,
      category: COMMENTS.category,
      categoryId: COMMENTS.categoryId,
      mapping: "specific",
      term: commentsTerm(href),
      strict: "0",
      reactionsEnabled: "1",
      emitMetadata: "0",
      inputPosition: "top",
      theme: GISCUS_THEMES[currentTheme()],
      lang: lang === "zh" ? "zh-CN" : "en",
      loading: "lazy",
    };
    for (const [key, value] of Object.entries(data)) script.dataset[key] = value;

    script.addEventListener("error", () => setFailed(true));

    // giscus 把 script 换成 iframe：等 iframe 真的 load 了才算「加载完成」
    const watcher = new MutationObserver(() => {
      const iframe = host.querySelector("iframe");
      if (!iframe) return;
      iframe.addEventListener("load", () => setLoaded(true), { once: true });
      watcher.disconnect();
    });
    watcher.observe(host, { childList: true });

    host.append(script);
    return () => {
      watcher.disconnect();
      host.replaceChildren();
    };
  }, [near, href, lang]);

  /* ---- 换外观：通知 iframe 换配色（不重新加载评论区） ---- */
  useEffect(() => {
    if (!near) return;
    const iframe = hostRef.current?.querySelector("iframe");
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: GISCUS_THEMES[theme] } } },
      GISCUS_ORIGIN,
    );
  }, [near, theme]);

  if (!enabled) return null;

  return (
    <section className="article-comments panel">
      <h2 className="article-comments-title">
        <Icon icon={icons["mdi:comment-text-outline"]} width="1em" height="1em" />
        {t.commentsTitle}
      </h2>
      <p className="article-comments-note">{t.commentsNote}</p>

      {ready ? (
        <>
          <div className="article-comments-host" ref={hostRef} />
          {near && !loaded && !failed ? (
            <p className="article-comments-note">{t.commentsLoading}</p>
          ) : null}
          {failed ? (
            <p className="article-comments-note" data-tone="warn">
              {t.commentsUnavailable}
            </p>
          ) : null}
        </>
      ) : (
        <p className="article-comments-setup">{t.commentsSetup}</p>
      )}
    </section>
  );
}
