"use client";

import { Icon } from "@iconify/react/offline";

import { ARTICLE_TEXT } from "@/lib/article";
import { icons } from "@/lib/icons";
import type { Lang } from "@/lib/site";

/**
 * 文章页的「导出」两个按钮（第 12 项）：下载 .md / 打印存 PDF
 *
 * 为什么是客户端组件：两件事都只能在浏览器里做 ——
 *   - 下载：把源文件文本包成 Blob，用 `<a download>` 触发；站点是纯静态的，
 *     没有后端可以「发一份文件」，所以文件在读者本机生成；
 *   - 打印：调 `window.print()` 打开浏览器自己的打印面板（存 PDF 是它的一个选项）。
 *
 * 源文件文本由服务端（文章页）经 props 传进来，取的是**仓库里那一份原文**（含 frontmatter，
 * 见 lib/content.ts 的 getPostSource）——不是渲染后的 HTML，也不是剥掉 frontmatter 的正文。
 * 代价是页面的 RSC 载荷里多一份 Markdown；纯文字博客的正文不大，换取「下载的是可再用的源文件」
 * 是划算的。它整条链路都不出浏览器、不请求任何接口，离线（PWA）也能下载。
 *
 * 按钮的排版交给 CSS（globals.css 6e 的 `.article-actions`），打印时整行不印。
 */
export default function ArticleExport({
  lang,
  markdown,
  filename,
}: {
  lang: Lang;
  markdown: string;
  /** 下载后的文件名（*.md），由文章页从 slug 推出 */
  filename: string;
}) {
  const t = ARTICLE_TEXT[lang];

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    // 锚要真的在文档里，Firefox 才会认这次点击；点完立刻收走
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // 撤销要等下载真正开始：同一轮同步 revoke 在部分浏览器里会把下载打断
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <p className="article-actions">
      <button
        type="button"
        className="article-action"
        onClick={download}
        title={t.downloadHint}
      >
        <Icon icon={icons["mdi:download"]} width="1em" height="1em" />
        {t.downloadMd}
      </button>
      <button
        type="button"
        className="article-action"
        onClick={() => window.print()}
        title={t.printHint}
      >
        <Icon icon={icons["mdi:printer"]} width="1em" height="1em" />
        {t.printArticle}
      </button>
    </p>
  );
}