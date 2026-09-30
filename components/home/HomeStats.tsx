import HomeBlockHead from "./HomeBlockHead";
import type { ContentStats } from "@/lib/content";
import { HOME_TEXT } from "@/lib/home";
import type { Lang } from "@/lib/site";

/**
 * 第 3 栏：数据统计（第 9 项）
 *
 * 作者要的「访问数据统计」。这里给的是**构建期数字**：字数、累计阅读时长、首末发布日期、
 * 本次构建日期 —— 纯静态站没有后端，也就没有真实的访问量；要访问量必须接一个外部服务
 * （Cloudflare Web Analytics 或自建计数器），那一步留给作者，位置已经在这栏里写明（编辑此处）。
 *
 * 「本次构建」用渲染时的 `new Date()`：静态导出在 `next build` 里跑，所以它就是构建那一天，
 * 每次部署都会变 —— 这也顺便是「这份产物是什么时候生成的」的证据。
 *
 * 草稿那一格不区分环境：`getContentStats` 是从盘上数出来的（有几篇 draft: true），
 * 生产构建里它们不计入「文章 / 字数」，所以这一格显示的是**还没发布的稿子有几篇**；
 * 没有草稿时这一格不出现。
 */
export default function HomeStats({ lang, stats }: { lang: Lang; stats: ContentStats }) {
  const t = HOME_TEXT[lang].stats;
  const built = new Date().toISOString().slice(0, 10);

  const cells = [
    { label: t.labels.words, value: String(stats.words) },
    { label: t.labels.reading, value: String(stats.readingMinutes) },
    { label: t.labels.first, value: stats.first ? stats.first.slice(0, 10) : "—" },
    { label: t.labels.last, value: stats.last ? stats.last.slice(0, 10) : "—" },
    { label: t.labels.built, value: built },
    ...(stats.drafts > 0 ? [{ label: t.labels.drafts, value: String(stats.drafts) }] : []),
  ];

  return (
    <>
      <HomeBlockHead id="stats" lang={lang} />
      <div className="home-grid">
        {cells.map((cell) => (
          <div className="home-cell" key={cell.label}>
            <span className="home-cell-value">{cell.value}</span>
            <span className="home-cell-label">{cell.label}</span>
          </div>
        ))}
      </div>
      <p className="home-note">{t.note}</p>
      <p className="home-note">{t.analytics}</p>
    </>
  );
}
