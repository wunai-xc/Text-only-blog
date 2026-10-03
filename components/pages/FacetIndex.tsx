import { getTaxonomy, type TaxonomyKind } from "@/lib/content";
import { decorate } from "@/lib/decor";
import { PAGES_TEXT, categoryHref, facetWeight, tagHref } from "@/lib/pages";
import type { Lang } from "@/lib/lang";

/**
 * 标签页 / 分类页的**同一份实现**（第 13 项）
 *
 * 这两页除了「名字前后有没有 `#`」「文案」之外完全一样，所以只有一个组件、两个薄壳页面：
 *   `app/[lang]/tags/page.tsx`      → `<FacetIndex lang kind="tag" />`
 *   `app/[lang]/categories/page.tsx` → `<FacetIndex lang kind="category" />`
 * 区别集中在 `lib/pages.ts` 的 `PAGES_TEXT`（chipLabel / chipTitle）与下面这一处 kind 映射里。
 *
 * 三件事值得说明：
 *   1. **清单在构建期算好**（第 2 项的 `getTaxonomy`，按篇数倒序），所以这一页没有 JS、
 *      爬虫与离线都能读（约定第 4 条）；
 *   2. **它是服务端组件**：没有任何状态 —— 点一个标签是普通链接（`facetHref`），
 *      跳到列表页、由那一页接管筛选。所以这一页不会出现「客户端 JS 挂了就点不动」的情况；
 *   3. **字号档是算出来的**（`facetWeight(count, max)`，0~3 档，交给 CSS 的
 *      `.facet-chip[data-weight="…"]`）；只有一个标签时全部是 0 档 —— 都一样多就没有
 *      「大一号」的意义，这一点写在 lib/pages.ts 里。
 *
 * 页头沿用列表页那一套类（`.list-head` / `.list-kicker` / `.list-no` / `.list-rule` /
 * `.list-title` / `.list-lead` / `.list-meta`）—— 第 13 项的「清单型」页面都用它，
 * 不再各自长一套页头出来（那几个类在 globals.css 的「6d」一节点明是共用的）。
 */
export default function FacetIndex({
  lang,
  kind,
}: {
  lang: Lang;
  /** tag = 标签页（`getTaxonomy(lang, "tags")`）；category = 分类页 */
  kind: "tag" | "category";
}) {
  const facetKind: TaxonomyKind = kind === "tag" ? "tags" : "categories";
  const text = kind === "tag" ? PAGES_TEXT[lang].tags : PAGES_TEXT[lang].categories;
  const entries = getTaxonomy(lang, facetKind);
  // 图纸编号与右下角图签同一个来源（第 8 项）：/zh/tags/ 是 04，/zh/categories/ 是 05
  const decor = decorate(`/${lang}/${facetKind}/`);
  const max = entries[0]?.count ?? 1;

  return (
    <div className="page facet-page">
      <header className="list-head">
        <p className="list-kicker">
          <span className="list-no">{decor.sheet}</span>
          {text.kicker}
          <span className="list-rule" />
        </p>
        <h1 className="list-title">{text.title}</h1>
        <p className="list-lead">{text.lead}</p>
        {entries.length > 0 ? <p className="list-meta">{text.total(entries.length)}</p> : null}
      </header>

      {entries.length > 0 ? (
        <>
          <ul className="facet-cloud">
            {entries.map((entry) => (
              <li className="facet-item" key={entry.slug}>
                <a
                  className="facet-chip"
                  data-kind={kind}
                  data-weight={facetWeight(entry.count, max)}
                  href={kind === "tag" ? tagHref(lang, entry.name) : categoryHref(lang, entry.name)}
                  title={text.chipTitle(entry.name, entry.count)}
                >
                  <span className="facet-name">{text.chipLabel(entry.name)}</span>
                  <span className="facet-count">{entry.count}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="facet-note">{text.note}</p>
        </>
      ) : (
        <div className="panel list-empty">
          <p>{text.empty}</p>
          <p className="list-hint">{text.emptyHint}</p>
        </div>
      )}
    </div>
  );
}
