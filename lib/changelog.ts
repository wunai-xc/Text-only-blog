/**
 * lib/changelog.ts —— 更新日志（第 5 项：构建产物）
 *
 * 两个来源，在**构建期**按顺序试一次：
 *
 *   1. **GitHub REST API**（`/repos/<owner>/<repo>/commits`）—— 仓库地址取
 *      `lib/site.ts` 的 `CONTACT.repo`。优先走它的理由与参考项目一致
 *      （wunai-Blog 的 `scripts/generate-changelog.mjs` 就是这么写的）：
 *      云构建常常是**浅克隆**，`git log` 在那种环境里只剩触发构建的那一条提交，
 *      更新日志会缩成孤零零一行；
 *   2. **本地 `git log`**（要有完整历史；GitHub Actions 那边靠 `fetch-depth: 0`）。
 *
 * 两条都失败时返回空数组并打一条警告 —— **绝不让构建失败**：更新日志是装饰，不是内容。
 *
 * 两种用法：
 *   - 首页「更新日志」栏（第 9 项）作为 Server Component 直接 `await getChangelog()`；
 *   - 静态 JSON 副本 `/changelog.json`（app/changelog.json/route.ts），供客户端使用。
 *
 * 每条都带 `url`（GitHub 上的提交地址），首页那一栏因此可以整行点开 —— 与 wunai-Blog
 * 的做法一致。`CONTACT.repo` 留空时 `url` 是空串，页面就渲染成不可点的行，不留死链。
 */

import { execFileSync } from "node:child_process";

import { CONTACT } from "./site";

export interface ChangelogEntry {
  /** 完整哈希 */
  hash: string;
  /** 短哈希（7 位） */
  short: string;
  /** 提交日期 YYYY-MM-DD（作者时区） */
  date: string;
  subject: string;
  author: string;
  /**
   * 这条提交在 GitHub 上的地址（`<CONTACT.repo>/commit/<hash>`）。
   * `CONTACT.repo` 没填或不是 github.com 地址时是空串 —— 页面据此决定这一行可不可点。
   * 注意：还没推到 GitHub 的本地提交，这个地址打开会是 404（参考项目同样直接拼地址）。
   */
  url: string;
}

/** 这批记录是从哪来的 —— 写进 /changelog.json，方便排查「为什么只有一条」 */
export type ChangelogSource = "github" | "git" | "none";

export interface ChangelogResult {
  source: ChangelogSource;
  entries: ChangelogEntry[];
}

/** 默认取多少条 */
export const CHANGELOG_LIMIT = 30;

/** 字段分隔符：用 ASCII 的 Unit Separator，正文里不可能出现（避免和 | 撞车） */
const FIELD_SEPARATOR = "\u001f";

/** 同一批参数只跑一次（首页与 JSON 路由共用） */
const cache = new Map<boolean, Promise<ChangelogResult>>();

/**
 * 从 `CONTACT.repo` 里抠出 `owner/repo`；不是 GitHub 地址就返回 null（那种情况直接跳过 API）。
 */
function repoPath(url: string): string | null {
  const match = url.match(/^https?:\/\/github\.com\/([^/\s]+)\/([^/#?\s]+)/i);
  if (!match) return null;
  return `${match[1]}/${match[2].replace(/\.git$/, "")}`;
}

/** 提交主题：多行 message 只取第一行 */
function subjectOf(message: unknown): string {
  return typeof message === "string" ? (message.split("\n")[0] ?? "").trim() : "";
}

/** GitHub API 的提交对象（只声明用得到的字段） */
interface GitHubCommit {
  sha?: string;
  html_url?: string;
  parents?: unknown[];
  commit?: {
    message?: string;
    author?: { name?: string; date?: string } | null;
  } | null;
}

/**
 * 来源一：GitHub API。
 *
 * `per_page` 多要几条是为了过滤合并提交后仍然够数（`git log` 那边有 `--no-merges`）。
 * 无 token 时匿名限流是每小时 60 次，一次构建只发一个请求，够用。
 */
async function fromGitHub(
  repo: string,
  limit: number,
  includeMerges: boolean,
): Promise<ChangelogEntry[]> {
  const perPage = Math.min(100, includeMerges ? limit : limit + 10);
  const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=${perPage}`, {
    headers: {
      Accept: "application/vnd.github+json",
      // GitHub API 要求带 User-Agent，否则 403
      "User-Agent": "text-only-blog-changelog",
    },
    // 注意：这里**必须**用 force-cache，不能用 no-store —— `no-store` 的 fetch 会把
    // 用到它的页面标记成「动态渲染」，而本站是 `output: "export"` 的静态导出，
    // 那样会在构建期直接报错。构建期本来就只读一次，缓存开关不影响结果。
    cache: "force-cache",
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error("GitHub API 没有返回数组");

  const entries: ChangelogEntry[] = [];
  for (const item of payload as GitHubCommit[]) {
    const hash = typeof item.sha === "string" ? item.sha : "";
    if (hash === "") continue;
    if (!includeMerges && Array.isArray(item.parents) && item.parents.length > 1) continue;

    const rawDate = item.commit?.author?.date;
    entries.push({
      hash,
      short: hash.slice(0, 7),
      date: typeof rawDate === "string" ? rawDate.slice(0, 10) : "",
      subject: subjectOf(item.commit?.message),
      author: item.commit?.author?.name ?? "",
      url: typeof item.html_url === "string" ? item.html_url : `https://github.com/${repo}/commit/${hash}`,
    });
  }
  return entries;
}

/** 来源二：本地 `git log`（浅克隆时只有零星几条，所以只作兜底） */
function fromGit(limit: number, includeMerges: boolean, urlBase: string): ChangelogEntry[] {
  const format = ["%H", "%h", "%ad", "%an", "%s"].join(FIELD_SEPARATOR);
  const args = ["log", "--date=short", `--pretty=format:${format}`];
  if (!includeMerges) args.push("--no-merges");
  if (limit > 0) args.push(`-${limit}`);

  const output = execFileSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 8 * 1024 * 1024,
  });

  return output
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const [hash = "", short = "", date = "", author = "", subject = ""] = line.split(FIELD_SEPARATOR);
      return {
        hash,
        short,
        date,
        subject,
        author,
        url: urlBase === "" ? "" : `${urlBase}/commit/${hash}`,
      };
    })
    .filter((entry) => entry.hash !== "");
}

/**
 * 取更新日志，并说明来源。
 *
 * @param limit 最多几条（默认 CHANGELOG_LIMIT）
 * @param options.includeMerges 是否包含合并提交（默认 false —— 更新日志里它们只是噪音）
 */
export function loadChangelog(
  limit = CHANGELOG_LIMIT,
  options?: { includeMerges?: boolean },
): Promise<ChangelogResult> {
  const includeMerges = options?.includeMerges === true;
  const cached = cache.get(includeMerges);
  if (cached) return cached.then((result) => slice(result, limit));

  const pending = resolve(includeMerges);
  cache.set(includeMerges, pending);
  return pending.then((result) => slice(result, limit));
}

/** 只要条目（首页用这个；JSON 路由要来源就用 loadChangelog） */
export async function getChangelog(
  limit = CHANGELOG_LIMIT,
  options?: { includeMerges?: boolean },
): Promise<ChangelogEntry[]> {
  return (await loadChangelog(limit, options)).entries;
}

async function resolve(includeMerges: boolean): Promise<ChangelogResult> {
  const repo = repoPath(CONTACT.repo);
  const urlBase = repo === null ? "" : `https://github.com/${repo}`;

  if (repo !== null) {
    try {
      const entries = await fromGitHub(repo, CHANGELOG_LIMIT, includeMerges);
      if (entries.length > 0) {
        console.info(`[changelog] ${entries.length} 条提交（GitHub API：${repo}）`);
        return { source: "github", entries };
      }
      console.warn("[changelog] GitHub API 返回空列表，改用 git log");
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.warn(`[changelog] GitHub API 不可用（${detail}），改用 git log`);
    }
  }

  try {
    const entries = fromGit(CHANGELOG_LIMIT, includeMerges, urlBase);
    if (entries.length > 0) {
      console.info(`[changelog] ${entries.length} 条提交（git log）`);
      return { source: "git", entries };
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.warn(`[changelog] 读不到 git 历史，更新日志将为空（${detail}）`);
  }

  return { source: "none", entries: [] };
}

function slice(result: ChangelogResult, limit: number): ChangelogResult {
  if (limit <= 0) return { source: result.source, entries: [] };
  return { source: result.source, entries: result.entries.slice(0, limit) };
}

/** 清缓存（dev 热更新时用；提交历史在 dev 期间一般不会变） */
export function clearChangelogCache(): void {
  cache.clear();
}
