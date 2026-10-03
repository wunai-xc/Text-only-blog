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
import { HOME_ORDER, HOME_TEXT, type HomeBlockId } from "@/lib/home";
import { isLang, type Lang } from "@/lib/lang";
import { SITE } from "@/lib/site";

/** 首页显示几篇文章卡片 / 几条更新日志 —— 改这两个数字就够了。
    文章那一栏是一屏一栏，卡片多了这一栏就会高过一屏（手机上尤其明显），
    所以默认取 4：宽屏（卡片三列）正好一行多，手机上大约一屏。 */
const HOME_POST_LIMIT = 4;
const HOME_CHANGELOG_LIMIT = 5;

export const metadata: Metadata = { title: SITE.title };

/**
 * 首页（第 9 项）：八栏，**一栏一屏**（滚动时一屏吸附一栏）
 *
 *   01 本站介绍 · 02 文章卡片 · 03 数据统计 · 04 更新日志
 *   05 站内内容 · 06 阅读改善 · 07 外观切换 · 08 字体设置
 *
 * **版面与文案都在 lib/home.ts**（顺序、栏号、每一栏的文字）—— 这个文件只做一件事：
 * 把 `HOME_ORDER` 逐栏渲染成 <section>，并把各栏需要的数据准备好传进去。
 * 想调顺序，改那个数组，不要在这里改 JSX 的顺序。
 *
 * 每栏是 `.home-block`：一个**整屏的吸附块**，里面一层 `.home-block-body` 装内容。
 * **没有卡片效果**（不是 `.panel`，没有边框 / 圆角 / 底色 / 阴影）—— 整页同一个底色。
 * 栏是「定高一屏 + 自己的滚动区」：内容比一屏多就在栏内滚（栏本身仍是一屏），
 * 所以吸附点永远落在整屏位置，「一栏占一屏」是版面事实，不靠 JS 算。
 * 样式全在 app/globals.css 的「6c. 首页」一节 —— 包括窄屏、打印与减少动效那三档。
 *
 * 数据全部在构建期取（静态导出：这一页的 HTML 里就有内容，运行时不发请求）：
 *   - 内容统计与文章列表走第 2 项的 lib/content.ts；
 *   - 更新日志走第 5 项的 lib/changelog.ts（先 GitHub API、再本机 git log；
 *     拿不到就空着，不让构建失败）；
 *   - 排版优化的「优化前 / 优化后」走第 4 项的 lib/typography.ts（在那一栏里现算）。
 *
 * 吸附与侧边指示器的样式在 app/globals.css 的「6c. 首页」一节，
 * 判定 `html:has(.home-flow)` —— 也就是说**只有这一页会吸附**，其它页面完全不受影响。
 *
 * 框架（顶栏 / 页脚 / 设置抽屉）在 app/[lang]/layout.tsx 里，这里不重复放。
 */
export default async function LangHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const stats = getContentStats(lang);
  const posts = getHomePosts(lang).slice(0, HOME_POST_LIMIT);
  const changelog = await getChangelog(HOME_CHANGELOG_LIMIT);

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

  return (
    <>
      <HomeIndex lang={lang} />
      <main className="home-flow">
        {/* 一栏一屏：每个 <section> 自己就是一个吸附块（`.home-block`，定高一屏），
            内层 `.home-block-body` 负责居中（长过一屏就在栏内滚）。
            没有并排、没有卡片外壳 —— 详见 lib/home.ts 与 globals.css 的「6c. 首页」 */}
        {HOME_ORDER.map((id) => (
          <section
            key={id}
            id={`home-${id}`}
            data-home-block={id}
            className="home-block"
            aria-label={HOME_TEXT[lang].blocks[id].title}
          >
            <div className="home-block-body">{blocks[id]}</div>
          </section>
        ))}
      </main>
    </>
  );
}
