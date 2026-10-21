import RouteLink from "../RouteLink";
import HomeBlockHead from "./HomeBlockHead";
import { HOME_TEXT } from "@/lib/home";
import { feedHref, SITE } from "@/lib/site";

/**
 * 第 1 栏：本站介绍（第 9 项）
 *
 * 一页的开场：站名 + 一段自述（**编辑此处**）+ 三个入口。
 * 入口走 RouteLink：还没落地的页面渲染成不可点（约定第 8 条），不留死链；
 * RSS 是第 5 项的真实产物，所以它是这一栏里唯一现在就能点开的链接。
 */
export default function HomeIntro() {
  const t = HOME_TEXT.intro;
  const site = SITE.strings;

  return (
    <>
      <HomeBlockHead id="intro" />
      <p className="home-lead">{SITE.title}</p>
      <p className="home-body">{t.body}</p>
      <p className="home-kicker">{t.entries}</p>
      <div className="home-entries">
        <RouteLink route="about" className="home-entry">
          {site.nav.about}
        </RouteLink>
        <RouteLink route="posts" className="home-entry">
          {site.allPosts}
        </RouteLink>
        <a className="home-entry" href={feedHref()}>
          {t.rss}
        </a>
      </div>
      <p className="home-note">{t.note}</p>
    </>
  );
}
