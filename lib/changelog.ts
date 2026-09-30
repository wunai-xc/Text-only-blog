/**
 * lib/changelog.ts —— 更新日志（第 5 项：构建产物）
 *
 * 数据来源是 `git log`，在**构建期**读一次（CI 里靠 `fetch-depth: 0` 才有完整历史，
 * 见 .github/workflows/deploy.yml 的注释）。
 *
 * 两种用法：
 *   - 首页「更新日志」栏（第 9 项）作为 Server Component 直接调 `getChangelog()`；
 *   - 或者取静态文件 `/changelog.json`（app/changelog.json/route.ts），供客户端使用。
 *
 * 拿不到 git（产物目录、tarball 解压、没有 .git、机器上没装 git）时返回空数组并打一条
 * 警告 —— **绝不让构建失败**：更新日志是装饰，不是内容。
 */

import { execFileSync } from "node:child_process";

export interface ChangelogEntry {
  /** 完整哈希 */
  hash: string;
  /** 短哈希（7 位） */
  short: string;
  /** 提交日期 YYYY-MM-DD（作者时区） */
  date: string;
  subject: string;
  author: string;
}

/** 默认取多少条 */
export const CHANGELOG_LIMIT = 30;

/** 字段分隔符：用 ASCII 的 Unit Separator，正文里不可能出现（避免和 | 撞车） */
const FIELD_SEPARATOR = "\u001f";

/** 两种参数各缓存一份，避免首页与 JSON 路由各跑一次 git */
const cache = new Map<boolean, ChangelogEntry[]>();

/**
 * 读最近若干条提交。
 *
 * @param limit 最多几条（默认 CHANGELOG_LIMIT）
 * @param options.includeMerges 是否包含合并提交（默认 false —— 更新日志里它们只是噪音）
 */
export function getChangelog(
  limit = CHANGELOG_LIMIT,
  options?: { includeMerges?: boolean },
): ChangelogEntry[] {
  const includeMerges = options?.includeMerges === true;
  const cached = cache.get(includeMerges);
  if (cached) return slice(cached, limit);

  const format = ["%H", "%h", "%ad", "%an", "%s"].join(FIELD_SEPARATOR);
  const args = ["log", "--date=short", `--pretty=format:${format}`];
  if (!includeMerges) args.push("--no-merges");

  let entries: ChangelogEntry[] = [];
  try {
    const output = execFileSync("git", args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 8 * 1024 * 1024,
    });

    entries = output
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [hash = "", short = "", date = "", author = "", subject = ""] =
          line.split(FIELD_SEPARATOR);
        return { hash, short, date, author, subject };
      })
      .filter((entry) => entry.hash !== "");
  } catch (error) {
    const detail = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.warn(`[changelog] 读不到 git 历史，更新日志将为空（${detail}）`);
    entries = [];
  }

  cache.set(includeMerges, entries);
  return slice(entries, limit);
}

function slice(entries: ChangelogEntry[], limit: number): ChangelogEntry[] {
  if (limit <= 0) return [];
  return entries.slice(0, limit);
}

/** 清缓存（dev 热更新时用；提交历史在 dev 期间一般不会变） */
export function clearChangelogCache(): void {
  cache.clear();
}
