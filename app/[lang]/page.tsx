import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import HomeChangelog from "@/components/home/HomeChangelog";
import HomeFonts from "@/components/home/HomeFonts";
import HomeIndex from "@/components/home/HomeIndex";
import HomeIntro from "@/components/home/HomeIntro";
import HomeInventory from "@/components/home/HomeInventory";
import HomePostCards from "@/components/home/HomePostCards";
import HomeReading from "@/components/home/HomeReading";
import HomeStats from "@/components/home/HomeStats";
import HomeThemes from "@/components/home/HomeThemes";
import { getChangelog } from "@/lib/changelog";
import { getContentStats, getHomePosts } from "@/lib/content";
import { HOME_ROWS, HOME_TEXT, type HomeBlockId } from "@/lib/home";
import { isLang, SITE, type Lang } from "@/lib/site";

/** 首页显示几篇文章卡片 / 几条更新日志 —— 改这两个数字就够了 */
const HOME_POST_LIMIT = 6;
const HOME_CHANGELOG_LIMIT = 5;

export const metadata: Metadata = { title: SITE.title };

/**
 * 首页（第 9 项）：八栏吸附式
 *
 *   01 本站介绍 · 02 文章卡片 · 03 数据统计 + 04 更新日志 ·
 *   05 站内内容 + 06 阅读改善 · 07 外观切换 + 08 字体设置
 *
 * **版面与文案都在 lib/home.ts**（顺序、并排、栏号、每一栏的文字）—— 这个文件只做一件事：
 * 把 `HOME_ROWS` 渲染成 <section>，并把各栏需要的数据准备好传进去。
 * 想调顺序或改哪两栏并排，改那张表，不要在这里改 JSX 的顺序。
 *
 * 数据全部在构建期取（静态导出：这一页的 HTML 里就有内容，运行时不发请求）：
 *   - 内容统计与文章列表走第 2 项的 lib/content.ts；
 *   - 更新日志走第 5 项的 lib/changelog.ts（读 git log，拿不到就空着，不让构建失败）；
 *   - 排版优化的「优化前 / 优化后」走第 4 项的 lib/typography.ts（在那一栏里现算）。
 *
 * 吸附（scroll-snap）与侧边指示器的样式在 app/globals.css 的「6c. 首页」一节，
 * 判定 `html:has(.home-flow)` —— 也就是说**只有这一页会吸附**，其它页面完全不受影响。
 *
 * 框架（顶栏 / 页脚 / 设置抽屉）在 app/[lang]/layout.tsx 里，这里不重复放。
 */
export default async function LangHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const stats = getContentStats(lang);
  const posts = getHomePosts(lang).slice(0, HOME_POST_LIMIT);
  const changelog = getChangelog(HOME_CHANGELOG_LIMIT);

  /** 八栏的内容。缺一栏 TypeScript 会报错（Record 是穷尽的），不会静默少一栏 */
  const blocks: Record<HomeBlockId, ReactNode> = {
    intro: <HomeIntro lang={lang} />,
    posts: <HomePostCards lang={lang} posts={posts} />,
    stats: <HomeStats lang={lang} stats={stats} />,
    changelog: <HomeChangelog lang={lang} entries={changelog} />,
    inventory: <HomeInventory lang={lang} stats={stats} />,
    reading: <HomeReading lang={lang} />,
    themes: <HomeThemes lang={lang} />,
    fonts: <HomeFonts lang={lang} />,
  };

  // 自检不是站点内容（约定第 6 条）：生产构建里既不渲染也不进产物，
  // 第 12 项（文章页）落地后把这个文件和这一段一起删掉。
  const DevCheck =
    process.env.NODE_ENV === "production"
      ? null
      : (await import("@/components/dev/PipelineCheck")).default;

  return (
    <>
      <HomeIndex lang={lang} />
      <main className="home-flow">
        {HOME_ROWS.map((row, rowIndex) => (
          <div className="home-row" data-pair={row.pair ? "true" : undefined} key={rowIndex}>
            {row.blocks.map((id) => (
              <section
                key={id}
                id={`home-${id}`}
                data-home-block={id}
                className="home-block panel"
                aria-label={HOME_TEXT[lang].blocks[id].title}
              >
                {blocks[id]}
              </section>
            ))}
          </div>
        ))}
      </main>
      {DevCheck ? (
        <div className="page">
          <DevCheck />
        </div>
      ) : null}
    </>
  );
}
