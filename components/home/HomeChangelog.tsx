import HomeBlockHead from "./HomeBlockHead";
import type { ChangelogEntry } from "@/lib/changelog";
import { HOME_TEXT } from "@/lib/home";
import type { Lang } from "@/lib/site";

/**
 * 第 4 栏：更新日志（第 9 项）
 *
 * 作者要的「五条更新日志」。数据是 lib/changelog.ts 在**构建期**读一次的 git 提交
 * （最多 5 条，不含合并提交；条数由 app/[lang]/page.tsx 的 HOME_CHANGELOG_LIMIT 决定）。
 * 拿不到 git 时它返回空数组并打一条警告，**不会让构建失败** —— 所以这一栏有明确的空状态。
 *
 * 显示的是提交主题（subject），也就是作者自己写的提交信息；短哈希只作为「这条对应哪次提交」
 * 的线索，不做链接（仓库地址可能还没填，CONTACT.repo 现在是空的）。
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
          <ul className="home-list">
            {entries.map((entry) => (
              <li className="home-item" key={entry.hash}>
                <span className="home-item-date">{entry.date}</span>
                <span className="home-item-text">{entry.subject}</span>
                <span className="home-item-hash">{entry.short}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="home-note">{t.empty}</p>
      )}
      <p className="home-note">{t.note}</p>
    </>
  );
}
