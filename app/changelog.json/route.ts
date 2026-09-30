/**
 * /changelog.json —— 更新日志（第 5 项：构建产物）
 *
 * 构建期读一次 `git log`（需要完整历史，CI 里靠 fetch-depth: 0），
 * 输出成静态 JSON。首页「更新日志」栏（第 9 项）也可以直接调
 * lib/changelog.ts 的 getChangelog()，不必走这个文件。
 *
 * 拿不到 git 时 entries 是空数组（构建不会失败）—— 前端据此出空状态。
 */

import { CHANGELOG_LIMIT, getChangelog } from "@/lib/changelog";

export const dynamic = "force-static";

export function GET(): Response {
  const entries = getChangelog(CHANGELOG_LIMIT);

  return new Response(
    JSON.stringify({ source: "git", generated: new Date().toISOString(), entries }),
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  );
}
