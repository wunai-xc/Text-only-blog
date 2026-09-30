import { Icon } from "@iconify/react/offline";

import LangSwitcher from "./LangSwitcher";
import RouteLink from "./RouteLink";
import ThemeSwitcher from "./ThemeSwitcher";
import { getContentStats } from "@/lib/content";
import { icons } from "@/lib/icons";
import { NAV, ROUTES, SITE, type Lang } from "@/lib/site";

/**
 * 顶栏（第 7 项）
 *
 * 结构与 wunai-blog 对齐 —— 三段，除此之外不放别的东西：
 *   ① 品牌区：外观按钮 + 大号站名（带闪烁光标）+ 小字行（「wunai 是谁？ About……」+「全部文章 →」）
 *   ② 导航区：首页 / 文章 / 标签 / 分类 / 归档 / 搜索 / 友链（还没落地的渲染成不可点，见 RouteLink）
 *   ③ 图签区：代替 wunai-blog 顶栏右端的图片位 —— 本站是**纯文字**站，不放图，
 *      改用「图纸标题栏」的气质：等宽小字，语言切换 + 内容统计（构建期读一次第 2 项的统计）
 *
 * 颜色一律走令牌（bg/surface/rule/ink/accent），不写 dark: 变体（约定第 7 条）。
 * 滚动时吸顶，半透明 + 模糊（见 app/globals.css 的 .site-header）。
 *
 * 这是服务端组件：内容统计来自构建期（静态导出），每页 HTML 里就有，不额外发请求。
 */
export default function SiteHeader({ lang }: { lang: Lang }) {
  const t = SITE.i18n[lang];
  const stats = getContentStats(lang);

  // 图签区那两行：没有文章时说清楚「为什么是空的」，别只显示 0
  const meta =
    stats.posts > 0
      ? [
          `${t.statsPosts(stats.posts)} · ${t.statsWords(stats.words)}`,
          stats.last ? t.statsUpdated(stats.last.slice(0, 10)) : "",
        ].filter(Boolean)
      : [t.statsEmpty];

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* ① 品牌区 */}
        <div className="site-brand">
          <ThemeSwitcher lang={lang} />
          <div className="site-brand-text">
            <RouteLink route="home" lang={lang} className="site-logo">
              {SITE.title}
              <span className="site-caret" aria-hidden="true" />
            </RouteLink>
            <p className="site-tagline">
              <span>{t.brandTagline}</span>
              <RouteLink route="about" lang={lang} className="site-tagline-link">
                {t.brandAbout}
              </RouteLink>
              <RouteLink route="posts" lang={lang} className="site-tagline-link">
                {t.allPosts}
              </RouteLink>
            </p>
          </div>
        </div>

        {/* ② 导航区 */}
        <nav className="site-nav" aria-label={t.navLabel}>
          {NAV.map((id) => {
            const icon = ROUTES[id].icon;
            return (
              <RouteLink key={id} route={id} lang={lang} className="site-nav-entry">
                {icon ? <Icon icon={icons[icon]} width="1em" height="1em" /> : null}
                <span>{t.nav[id]}</span>
              </RouteLink>
            );
          })}
        </nav>

        {/* ③ 图签区 */}
        <div className="site-titleblock">
          <LangSwitcher lang={lang} className="site-nav-entry" />
          {meta.map((line) => (
            <p className="site-titleblock-line" key={line}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </header>
  );
}
