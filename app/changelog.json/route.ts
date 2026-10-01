/**
 * /changelog.json —— 更新日志（第 5 项：构建产物）
 *
 * 构建期取一次（先 GitHub API、再本机 `git log`，两个来源都可能拿不到），
 * 输出成静态 JSON。首页「更新日志」栏（第 9 项）也可以直接调
 * lib/changelog.ts 的 getChangelog()，不必走这个文件。
 *
 * 两个来源都失败时 entries 是空数组（构建不会失败）—— 前端据此出空状态。
 * `source` 说的是这批记录来自哪一个来源（`github` / `git` / `none`），
 * 排查「为什么只有一条」时看它（浅克隆的构建里 git 只有触发那一次提交）。
 */

import { CHANGELOG_LIMIT, loadChangelog } from "@/lib/changelog";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const { source, entries } = await loadChangelog(CHANGELOG_LIMIT);

  return new Response(
    JSON.stringify({ source, generated: new Date().toISOString(), entries }),
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  );
}
