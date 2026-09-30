import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { decorate } from "@/lib/decor";
import { PAGES_TEXT } from "@/lib/pages";
import { feedAlternatesTypes, isLang, LINKS } from "@/lib/site";

/**
 * 友链页（第 13 项）：`/zh/links/` 与 `/en/links/`
 *
 * 数据只有一处来源：`lib/site.ts` 的 `LINKS`（现在是空数组）。空的时候**不渲染空清单**，
 * 而是显示「编辑此处」+ 怎么填（约定第 2 条）—— 一个空列表比一段说明更难懂。
 *
 * 三个细节：
 *   1. 外链一律 `target="_blank"` + `rel="noopener noreferrer"`（新标签页打开别人的站，
 *      同时断掉 `window.opener` 那条路）；
 *   2. 地址**印出来**（`.links-url`）：万一点不动（离线、被墙、对方改域名），
 *      读者还能自己复制 —— 纯文字站的取舍是「能读」优先；
 *   3. 这一页不联网、没有头像与截图：纯文字站的友链就是一行名字 + 一句说明（约定第 1 条）。
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const t = PAGES_TEXT[lang].links;
  return {
    title: t.title,
    description: t.lead,
    alternates: {
      canonical: `/${lang}/links/`,
      languages: { zh: "/zh/links/", en: "/en/links/", "x-default": "/zh/links/" },
      types: feedAlternatesTypes(),
    },
  };
}

export default async function LangLinks({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const t = PAGES_TEXT[lang].links;
  const decor = decorate(`/${lang}/links/`);

  return (
    <div className="page links-page">
      <header className="list-head">
        <p className="list-kicker">
          <span className="list-no">{decor.sheet}</span>
          {t.kicker}
          <span className="list-rule" />
        </p>
        <h1 className="list-title">{t.title}</h1>
        <p className="list-lead">{t.lead}</p>
        {LINKS.length > 0 ? <p className="list-meta">{LINKS.length}</p> : null}
      </header>

      {LINKS.length > 0 ? (
        <>
          <ul className="links-list">
            {LINKS.map((item) => (
              <li className="links-item panel" key={item.url}>
                <a
                  className="links-name"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.name}
                </a>
                {item.note ? <p className="links-note">{item.note}</p> : null}
                <span className="links-url">{item.url}</span>
              </li>
            ))}
          </ul>
          <p className="facet-note">{t.note}</p>
        </>
      ) : (
        <div className="panel list-empty">
          <p>{t.empty}</p>
          <p className="list-hint">{t.emptyHint}</p>
        </div>
      )}
    </div>
  );
}
