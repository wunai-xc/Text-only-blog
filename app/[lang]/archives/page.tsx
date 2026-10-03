import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getArchive } from "@/lib/content";
import { decorate } from "@/lib/decor";
import { LIST_TEXT } from "@/lib/list";
import { PAGES_TEXT, archiveYearHref, monthName } from "@/lib/pages";
import { isLang } from "@/lib/lang";
import { feedAlternatesTypes } from "@/lib/site";

/**
 * 归档页（第 13 项）：`/zh/archives/` 与 `/en/archives/`
 *
 * 「按年月排开的时间线」。数据来自第 2 项的 `getArchive`（构建期分组：年 → 月 → 文章），
 * 所以这一页是**纯服务端组件**，没有 JS 也能读（约定第 4 条）。
 *
 * 三件事说清楚（免得以后当成 bug）：
 *   1. **方向与列表页一致**：年、月、文章都是新的在前（`getArchive` 已经排好，
 *      这一页不再排一遍）；
 *   2. **月份是分组，不是筛选**：列表页的筛选支持到「年」这一档（`?year=YYYY`），
 *      所以每个**年**那一行右边有一个「看这一年的全部 →」的链接（`archiveYearHref`），
 *      月份那一行**故意不可点** —— 点不动比点进去发现筛选没生效好。想加月份筛选就说一声；
 *   3. **文章那一行就是链接**（第 12 项的文章页已落地），行内的日期用等宽字体，
 *      标题可换行（长标题不会把日期挤没）。
 *
 * 「置顶 / AI / 草稿」这几个小字**跟着卡片走**（`LIST_TEXT[lang].card`），
 * 不在这里另写一份同义文案（约定第 10 条）。
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const t = PAGES_TEXT[lang].archives;
  return {
    title: t.title,
    description: t.lead,
    alternates: {
      canonical: `/${lang}/archives/`,
      languages: { zh: "/zh/archives/", en: "/en/archives/", "x-default": "/zh/archives/" },
      types: feedAlternatesTypes(),
    },
  };
}

export default async function LangArchives({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const t = PAGES_TEXT[lang].archives;
  const badges = LIST_TEXT[lang].card;
  const years = getArchive(lang);
  const decor = decorate(`/${lang}/archives/`);
  const total = years.reduce((sum, year) => sum + year.count, 0);

  return (
    <div className="page archive-page">
      <header className="list-head">
        <p className="list-kicker">
          <span className="list-no">{decor.sheet}</span>
          {t.kicker}
          <span className="list-rule" />
        </p>
        <h1 className="list-title">{t.title}</h1>
        <p className="list-lead">{t.lead}</p>
        {years.length > 0 ? (
          <p className="list-meta">
            {years.length} · {t.yearTotal(total)}
          </p>
        ) : null}
      </header>

      {years.length > 0 ? (
        <>
          {years.map((year) => (
            <section className="archive-year" key={year.year}>
              <h2 className="archive-year-head">
                <span className="archive-year-no">{year.year}</span>
                <span className="archive-year-count">{t.yearTotal(year.count)}</span>
                <a className="archive-year-link" href={archiveYearHref(lang, year.year)}>
                  {t.viewYear(year.year)}
                </a>
              </h2>

              {year.months.map((month) => (
                <div className="archive-month" key={month.key}>
                  <p className="archive-month-head">{monthName(lang, month.month)}</p>
                  <ul className="archive-list">
                    {month.posts.map((post) => (
                      <li className="archive-item" key={post.slug}>
                        <a className="archive-link" href={post.href}>
                          <span className="archive-date">{post.date.slice(0, 10)}</span>
                          <span className="archive-title">{post.title}</span>
                        </a>
                        {post.pinned ? (
                          <span className="archive-badge">{badges.pinned}</span>
                        ) : null}
                        {post.isAI ? (
                          <span className="archive-badge" data-badge="ai">
                            {badges.ai}
                          </span>
                        ) : null}
                        {post.draft ? (
                          <span className="archive-badge" data-badge="draft">
                            {badges.draft}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
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
