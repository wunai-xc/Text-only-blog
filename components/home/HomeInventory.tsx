import HomeBlockHead from "./HomeBlockHead";
import type { ContentStats } from "@/lib/content";
import { HOME_TEXT } from "@/lib/home";
import { LANGS, type Lang } from "@/lib/lang";

/**
 * 第 5 栏：站内内容（第 9 项）
 *
 * 作者要的「文章数量 / 笔记数量 / 标签数量 / 语言种类 / 题材数量」。
 * 全部来自第 2 项的 `getContentStats`，**没有一处是写死的数字**：
 *   - 文章：content/<lang>/posts/ 下的 .md（不含 README.md 与 _index.md）；
 *   - 专题（笔记）：带 _index.md 的卡组目录（stats.groups）；
 *   - 标签 / 题材：文章 frontmatter 里 tags / categories 的去重总数；
 *   - 语言：lib/lang.ts 的 LANGS（加语言只改那一处）。
 * 「笔记」为什么映射到专题：管线里目前只有文章这一种内容类型 ——
 * 这一点在栏内的说明里写明了，免得读者以为漏了一栏。
 */
export default function HomeInventory({ lang, stats }: { lang: Lang; stats: ContentStats }) {
  const t = HOME_TEXT[lang].inventory;

  const cells = [
    { label: t.labels.posts, value: stats.posts },
    { label: t.labels.groups, value: stats.groups },
    { label: t.labels.tags, value: stats.tags },
    { label: t.labels.categories, value: stats.categories },
    { label: t.labels.langs, value: LANGS.length },
  ];

  return (
    <>
      <HomeBlockHead id="inventory" lang={lang} />
      <div className="home-grid">
        {cells.map((cell) => (
          <div className="home-cell" key={cell.label}>
            <span className="home-cell-value">{cell.value}</span>
            <span className="home-cell-label">{cell.label}</span>
          </div>
        ))}
      </div>
      <p className="home-note">{t.note}</p>
    </>
  );
}
