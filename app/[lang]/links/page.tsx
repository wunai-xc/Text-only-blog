import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { decorate } from "@/lib/decor";
import { PAGES_TEXT } from "@/lib/pages";
import { feedAlternatesTypes, friendHost, friendNote, isLang, LINKS } from "@/lib/site";

/**
 * 友链页（第 13 项）：`/zh/links/` 与 `/en/links/`
 *
 * 数据只有一处来源：`lib/site.ts` 的 `LINKS`（八个，与 wunai-Blog 的 `my-app/lib/links.ts`
 * 同一份名单）。空数组时**不渲染空清单**，而是显示「编辑此处」+ 怎么填（约定第 2 条）——
 * 一个空列表比一段说明更难懂。
 *
 * 卡片与 wunai-Blog 的友链页一致：左边头像、右边名字 + 一句介绍，整张卡片可点。
 * 四个细节：
 *   1. **头像外链直引**（原生 `<img>`，不走 next/image：静态导出不优化图片，
 *      `images.remotePatterns` 也管不到任意域名）。`loading="lazy"` 让首屏不为八张头像排队，
 *      `referrerPolicy="no-referrer"` 不把本站地址带给对方；
 *      没填头像时按名称首字画占位方块，不出现碎图；
 *   2. 外链一律 `target="_blank"` + `rel="noopener noreferrer"`（新标签页打开别人的站，
 *      同时断掉 `window.opener` 那条路）；
 *   3. 地址**印出来**（`.links-url`）：万一点不动（离线、被墙、对方改域名），
 *      读者还能自己复制 —— 纯文字站的取舍是「能读」优先；
 *      介绍文案没有时这一行回退显示域名（`friendHost`），不留一行空白；
 *   4. 介绍取当前语言，缺当前语言时退回中文（`friendNote`）。
 *
 * ⚠️ 与本站「纯文字」的取舍有一处例外：这一页会向 GitHub / 对方站点请求八张头像图
 *    （断网时它们显示不出来，卡片其余内容照旧）。
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
              <li className="links-item" key={item.url}>
                <a
                  className="links-card panel"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.avatar ? (
                    <img
                      className="links-avatar"
                      src={item.avatar}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    /* 没填头像：名称首字占位，避免出现碎图 */
                    <span className="links-avatar links-avatar-fallback" aria-hidden="true">
                      {item.name.slice(0, 1)}
                    </span>
                  )}
                  <span className="links-body">
                    <span className="links-name">{item.name}</span>
                    <span className="links-note">
                      {friendNote(item.note, lang) || friendHost(item.url)}
                    </span>
                    <span className="links-url">{item.url}</span>
                  </span>
                </a>
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
