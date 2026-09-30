import { Icon } from "@iconify/react/offline";

import SettingsDock from "./SettingsDock";
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
 * 页脚（第 7 项）
 *
 * 三块内容 + 一颗固定的齿轮：
 *   1. 联系方式：邮箱 / GitHub / 本站源码 / RSS。**由 lib/site.ts 的 CONTACT 提供**，
 *      空着的条目只显示「编辑此处」，不会生成一个点不动的空链接；
 *      RSS 是第 5 项就有的真实地址（/{lang}/feed.xml），所以现在就能点；
 *   2. 一句话说明（t.footerNote，也在 lib/site.ts，同样是「编辑此处」）；
 *   3. 版权行（等宽小字，取构建时的年份 —— 静态站只能这样）。
 *
 * 左下角那颗齿轮（components/SettingsDock.tsx）：常驻视口左下角，点开是设置中心抽屉。
 * 它是 fixed 定位，所以从页面任何位置都能摸到；页脚因此留了 4.75rem 的下边距，
 * 免得滚到最底时齿轮压住版权行。
 */
export default function SiteFooter({ lang }: { lang: Lang }) {
  const t = SITE.i18n[lang];
  const year = new Date().getFullYear();

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
                    <span className="site-footer-link" data-pending="true">
                      {body}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="site-footer-note">
          <p className="site-footer-body">{t.footerNote}</p>
        </div>
      </div>

      <p className="site-footer-copy">
        © {year} {SITE.title} · {t.poweredBy}
      </p>

      {/* 左下角的设置中心入口 */}
      <SettingsDock lang={lang} />
    </footer>
  );
}
