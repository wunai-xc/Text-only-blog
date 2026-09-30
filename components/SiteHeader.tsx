import { Icon } from "@iconify/react/offline";

import HeaderIntro from "./HeaderIntro";
import RouteLink from "./RouteLink";
import ThemeSwitcher from "./ThemeSwitcher";
import { icons } from "@/lib/icons";
import { HEADER_IMAGE, SITE, type Lang } from "@/lib/site";

/**
 * 顶栏（第 7 项建立；顶栏改版时按 wunai-blog 参考稿重写成现在的三段）
 *
 * 结构与参考稿（wunai-blog 的 components/Header.tsx）逐段对齐，除此之外不放别的东西：
 *
 *   [外观按钮]  wunai's blog▌              (友链图标)        [   图片   ]
 *               wunai 是谁？About……  全部文章 →                 位
 *
 *   ① 品牌区 `.brand`：外观按钮（正方位）+ 大号站名（带闪烁光标）+ 小字行
 *      （左「wunai 是谁？About……」、右「全部文章 →」，两端对齐）；
 *   ② 友链 `.friends`：竖排「图标 + 小字」，紧贴右侧（`margin-left: auto`）——
 *      参考稿这里就是单个入口，不是一整排导航；
 *   ③ 图片位 `.image-placeholder`：撑满顶栏高度的一格，图由作者自己放
 *      （`lib/site.ts` 的 `HEADER_IMAGE`：留空时画成虚线空位，补图不会让顶栏跳一下）。
 *
 * 两处**刻意与参考稿不同**的地方（都是为了不丢东西，改回去只需删掉对应代码）：
 *   - 原先顶栏的七项导航（首页 / 文章 / 标签 / 分类 / 归档 / 搜索 / 友链）与语言切换、
 *     内容统计搬到了**页脚**（与参考稿把「站点控制项」移到页脚是同一个做法，见 SiteFooter）；
 *   - 顶栏的站内链接仍走 `RouteLink`（按 `ROUTES[id].status` 决定可点与否，约定第 8 条），
 *     所以它在页面还没做完时不会变成死链 —— 现在九个页面都已落地，这里一律是真链接。
 *
 * 颜色一律走令牌（surface/rule/ink/accent），不写 dark: 变体（约定第 7 条）。
 * 吸顶与半透明模糊见 app/globals.css 的「6b. 框架 UI」。
 *
 * 服务端组件：这里不再读内容统计（那件事搬去页脚了），但顶栏本就是每页都要的骨架，
 * 留在服务端可以让它的 HTML 直接进产物；入场动画与光标暂停交给 HeaderIntro（客户端）。
 */
export default function SiteHeader({ lang }: { lang: Lang }) {
  const t = SITE.i18n[lang];
  const decorative = HEADER_IMAGE.alt === "";

  return (
    <header className="site-header">
      <ul className="navbar">
        {/* ① 品牌区 */}
        <li className="brand">
          <div className="brand-switch" data-fade>
            <ThemeSwitcher lang={lang} />
          </div>

          <div className="brand-text" data-fade>
            <RouteLink route="home" lang={lang} className="logo-link">
              <span className="logo">
                {SITE.title}
                <span className="cursor" aria-hidden="true" />
              </span>
            </RouteLink>
          </div>

          <div className="tagline-row" data-fade>
            <span className="tagline">
              {t.brandTagline}{" "}
              <RouteLink route="about" lang={lang} className="site-tagline-link">
                {t.brandAbout}
              </RouteLink>
            </span>
            <RouteLink route="posts" lang={lang} className="all-posts">
              {t.allPosts}
            </RouteLink>
          </div>
        </li>

        {/* ② 友链 */}
        <li className="friends" data-fade>
          <RouteLink
            route="links"
            lang={lang}
            className="friends-link"
            title={t.nav.links}
          >
            <Icon
              icon={icons["mdi:account-multiple-outline"]}
              className="friends-icon"
              width="1.3em"
              height="1.3em"
            />
            <span className="friends-label">{t.nav.links}</span>
          </RouteLink>
        </li>

        {/* ③ 图片位：图放进 public/ 之后在 lib/site.ts 的 HEADER_IMAGE.src 里填文件名 */}
        <li className="image-placeholder" data-fade {...(decorative ? { "aria-hidden": true } : {})}>
          {HEADER_IMAGE.src ? (
            /* 用原生 <img> 而不是 next/image：静态导出下图片本来就不做优化
               （next.config.ts 里 images.unoptimized），而这张图由作者自己放、尺寸不定，
               走 <img> 才不会在构建期因为找不到文件而报错。 */
            <img className="image-placeholder-img" src={HEADER_IMAGE.src} alt={HEADER_IMAGE.alt} />
          ) : (
            <span className="image-placeholder-hint">{t.headerImage}</span>
          )}
        </li>
      </ul>

      <HeaderIntro />
    </header>
  );
}
