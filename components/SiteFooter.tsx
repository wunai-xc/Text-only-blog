import { Icon } from "@iconify/react/offline";

import LangSwitcher from "./LangSwitcher";
import SettingsDock from "./SettingsDock";
import { getContentStats } from "@/lib/content";
import { CONTACT, SITE, feedHref, type Lang } from "@/lib/site";
import { icons, type IconName } from "@/lib/icons";

interface ContactEntry {
  id: string;
  icon: IconName;
  label: string;
  /** 显示的值（链接地址去掉协议，只留看得懂的部分） */
  value: string;
  /** 可点的话就填；空串 = 还没填，显示「编辑此处」且不可点 */
  href: string;
  external: boolean;
}

function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * 页脚（第 7 项；顶栏改版时承接了原先挂在顶栏的两样东西）
 *
 * 现在有四块内容 + 一颗固定的齿轮：
 *   1. **语言切换**：原先与站内导航同排，站内导航删掉后单独留在这里。
 *      它是客户端组件（要读当前路径算目标地址）；
 *   2. **内容统计**：文章数 / 字数 / 最近更新，构建期读一次（`getContentStats`）。
 *      一行等宽小字，原先印在顶栏右侧的图签区里，图签区让位给图片之后搬到这里。
 *      没有文章时显示「还没有文章 —— 第一篇由你亲笔写」，而不是一串 0；
 *   3. 联系方式：邮箱 / GitHub / 本站源码 / RSS。**由 lib/site.ts 的 CONTACT 提供**，
 *      空着的条目只显示「编辑此处」，不会生成一个点不动的空链接；
 *      RSS 是第 5 项就有的真实地址（/{lang}/feed.xml），所以现在就能点；
 *   4. 一句话说明（t.footerNote，也在 lib/site.ts，同样是「编辑此处」）；
 *   5. 版权行（等宽小字，取构建时的年份 —— 静态站只能这样）。
 *
 * 左下角那颗齿轮（components/SettingsDock.tsx）：常驻视口左下角，点开是设置中心抽屉。
 * 它是 fixed 定位，所以从页面任何位置都能摸到；页脚因此留了 4.75rem 的下边距，
 * 免得滚到最底时齿轮压住版权行。
 *
 * ⚠️ 站内导航已移除：文章 / 标签 / 分类 / 归档 / 搜索 / 友链 现在只能靠站点地图
 *    或手敲 URL 到达（顶栏还留着「全部文章 →」与「友链」两个入口）。
 *    若之后要恢复入口，记得把 `NAV.map` 那段加回来并补上
 *    `RouteLink`、`NAV`、`ROUTES` 的 import。
 */
export default function SiteFooter({ lang }: { lang: Lang }) {
  const t = SITE.i18n[lang];
  const year = new Date().getFullYear();

  const stats = getContentStats(lang);
  const statsLine =
    stats.posts > 0
      ? [
          t.statsPosts(stats.posts),
          t.statsWords(stats.words),
          stats.last ? t.statsUpdated(stats.last.slice(0, 10)) : "",
        ]
          .filter(Boolean)
          .join(" · ")
      : t.statsEmpty;

  const entries: ContactEntry[] = [
    {
      id: "email",
      icon: "mdi:email-outline",
      label: t.email,
      value: CONTACT.email,
      href: CONTACT.email ? `mailto:${CONTACT.email}` : "",
      external: false,
    },
    {
      id: "github",
      icon: "mdi:github",
      label: t.github,
      value: shortUrl(CONTACT.github),
      href: CONTACT.github,
      external: true,
    },
    {
      id: "repo",
      icon: "mdi:source-repository",
      label: t.repo,
      value: shortUrl(CONTACT.repo),
      href: CONTACT.repo,
      external: true,
    },
    {
      id: "rss",
      icon: "mdi:rss",
      label: t.rss,
      value: feedHref(lang),
      href: feedHref(lang),
      external: false,
    },
  ];

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        {/* 1. 语言切换（站内导航已移除）+ 2. 内容统计 */}
        <div className="site-footer-nav">
          <ul className="site-footer-nav-list">
            <li>
              <LangSwitcher lang={lang} className="site-footer-nav-link" />
            </li>
          </ul>
          <p className="site-footer-stats">{statsLine}</p>
        </div>

        <div className="site-footer-contact">
          <p className="site-footer-group-label">{t.contactTitle}</p>
          <p className="site-footer-body">{t.contactBody}</p>
          <ul className="site-footer-links">
            {entries.map((entry) => {
              const filled = entry.href !== "";
              const body = (
                <>
                  <Icon icon={icons[entry.icon]} width="1em" height="1em" />
                  <span className="site-footer-label">{entry.label}</span>
                  <span className="site-footer-value">
                    {filled ? entry.value : t.notFilled}
                  </span>
                </>
              );

              return (
                <li className="site-footer-item" key={entry.id}>
                  {filled ? (
                    <a
                      className="site-footer-link"
                      href={entry.href}
                      {...(entry.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {body}
                    </a>
                  ) : (
                    /* 未填写的条目压暗、不可点：样式在 globals.css 的 [data-pending="true"] */
                    <span className="site-footer-link" data-pending="true">
                      {body}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* 3. 一句话说明 + 4. 版权行 */}
        <p className="site-footer-note site-footer-body">{t.footerNote}</p>
        <p className="site-footer-copy">
          © {year} {SITE.title}
        </p>
      </div>

      <SettingsDock lang={lang} />
    </footer>
  );
}
