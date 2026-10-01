import HomeBlockHead from "./HomeBlockHead";
import type { ChangelogEntry } from "@/lib/changelog";
import { HOME_TEXT } from "@/lib/home";
import type { Lang } from "@/lib/site";

/**
 * 第 4 栏：更新日志（第 9 项）
 *
 * 一列「日期 + 提交主题 + 最新那条带一个标记」的行，样式与交互对齐参考项目
 * （wunai-Blog 首页 `.ah-updates` 那一块）：整行是一张可点的浅色条，
 * 悬停时描边 + 底色浮出来，点开是这条提交在 GitHub 上的页面（新标签页）。
 *
 * 数据是 lib/changelog.ts 在**构建期**取一次（先 GitHub API、再 `git log`；
 * 最多 5 条，不含合并提交；条数由 app/[lang]/page.tsx 的 HOME_CHANGELOG_LIMIT 决定）。
 * 两个来源都拿不到时它返回空数组并打一条警告，**不会让构建失败** —— 所以这一栏有明确的空状态。
 *
 * 两条与参考项目一致的判断：
 *   1. `entry.url` 为空（`CONTACT.repo` 没填、或只读到了本地 git）时**渲染成不可点的行**，
 *      而不是一个点不动的空链接 —— 本站的约定：没有去处就不留链接；
 *   2. 只有第一条（最新那条）带标记 —— 它是「这次部署带来了什么新东西」的提示，
 *      不是每条都有的装饰。
 */
export default function HomeChangelog({
  lang,
  entries,
}: {
  lang: Lang;
  entries: ChangelogEntry[];
}) {
  const t = HOME_TEXT[lang].changelog;

  return (
    <>
      <HomeBlockHead id="changelog" lang={lang} />
      {entries.length > 0 ? (
        <>
          <p className="home-note">{t.limit(entries.length)}</p>
          <ul className="home-updates">
            {entries.map((entry, index) => {
              /* 整个卡片是内容 + 只有最新那条有标记，两者都在这里组装 */
              const body = (
                <>
                  <span className="home-update-date">{entry.date || entry.short}</span>
                  <span className="home-update-title">{entry.subject}</span>
                  {index === 0 ? <span className="home-update-tag">{t.newTag}</span> : null}
                </>
              );
              return (
                <li key={entry.hash}>
                  {entry.url === "" ? (
                    <span className="home-update" data-plain="true">
                      {body}
                    </span>
                  ) : (
                    <a
                      className="home-update"
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={entry.hash}
                    >
                      {body}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="home-note">{t.empty}</p>
      )}
      <p className="home-note">{t.note}</p>
    </>
  );
}
