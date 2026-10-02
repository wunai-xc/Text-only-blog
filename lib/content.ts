/**
 * lib/content.ts —— 内容加载（第 2 项：内容管线）
 *
 * 只负责「读盘 + 归一化 + 查询」，不负责渲染（渲染是第 3 项）。
 * 只能在服务端 / 构建期使用：它直接读 content/ 目录，依赖 node:fs。
 *
 * 目录约定（写作规范见 content/README.md）：
 *   content/<lang>/posts/ 下所有 .md          文章；slug 由文件路径推导，可用 frontmatter 覆盖
 *   content/<lang>/posts/ 下 _index.md        该目录的「卡组」元数据（标题 / 描述 / 顺序 / 封面）
 *   content/<lang>/posts/ 下 README.md        写作规范，加载器显式跳过，不算文章
 *
 * 硬性要求：零文章、目录不存在、public/ 不存在时，所有查询都返回空数组 / null，
 * 站点必须仍能构建与浏览（空状态由第 9~13 项的 UI 负责）。
 */

import fs from "node:fs";
import path from "node:path";

import {
  asBoolean,
  asDate,
  asReferences,
  asString,
  asStringList,
  parseFrontmatter,
  type FrontmatterFormat,
  type ParsedDocument,
  type ReferenceEntry,
} from "./frontmatter";
import { LANGS, type Lang } from "./site";

export type { FrontmatterFormat, ReferenceEntry };

/* ------------------------------- 常量 ------------------------------- */

const REPO_ROOT = process.cwd();
const CONTENT_DIR = path.join(REPO_ROOT, "content");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");

/** 认识的正文后缀 */
const POST_EXTENSIONS = [".md", ".markdown"];
/** 卡组元数据文件名（不含后缀） */
const CARD_GROUP_STEM = "_index";
/** 估算阅读速度：每分钟多少字（中日韩按字、西文按词） */
const WORDS_PER_MINUTE = 400;
/** 摘要截断长度 */
const EXCERPT_LENGTH = 160;
/** 缩略图自动推断：public/ 下这些目录、这些后缀 */
const COVER_DIRS = ["thumbnails", "covers"];
const COVER_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "avif", "svg"];

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

/* ------------------------------- 类型 ------------------------------- */

export interface CardGroupMeta {
  lang: Lang;
  /** 目录相对路径（"" 表示 posts 顶层） */
  slug: string;
  /** 卡组名：_index.md 的 title，没写时留空串由 UI 兜底 */
  title: string;
  description: string;
  cover: string | null;
  /** 排序权重，小的在前（取自 _index.md 的 order / weight / index） */
  order: number;
  /** 是否由 _index.md 显式定义 */
  explicit: boolean;
  /** _index.md 的路径（相对仓库根）；没有时为 null */
  file: string | null;
  /** 组内文章数（按过滤后的可见文章计算） */
  count: number;
  /** 组内文章，时间倒序 */
  posts: PostMeta[];
}

export interface PostMeta {
  lang: Lang;
  /** 路由 slug，可能含 "/"（对应嵌套目录） */
  slug: string;
  /** 站内路径，形如 /zh/posts/hello/ */
  href: string;
  /** 源文件路径（相对仓库根），报错与排查用 */
  file: string;
  /** frontmatter 用的是哪种写法 */
  format: FrontmatterFormat;
  title: string;
  /** ISO 8601；frontmatter 没写时回退到文件修改时间 */
  date: string;
  dateSource: "frontmatter" | "mtime";
  updated: string | null;
  description: string;
  excerpt: string;
  tags: string[];
  categories: string[];
  cover: string | null;
  coverSource: "frontmatter" | "public" | "body" | null;
  /** 置顶 */
  pinned: boolean;
  /** 草稿：生产构建默认不出现（dev 环境会显示，方便预览） */
  draft: boolean;
  /** 标记为「关于」类文章（每语言取最新的一篇） */
  about: boolean;
  /** 首页列表里隐藏（归档 / 标签页仍能看到） */
  hiddenInHomeList: boolean;
  /** AI 生成标记（列表页默认会筛掉，第 10 项实现） */
  isAI: boolean;
  /** 参考文献（正文用 [reference:N] 引用） */
  references: ReferenceEntry[];
  /** 所属卡组目录（"" 表示顶层） */
  group: string;
  cardGroup: CardGroupMeta | null;
  /** 中日韩按字、西文按词统计 */
  wordCount: number;
  readingMinutes: number;
  /** 原始 frontmatter（未归一化），后续渲染可能会用到 */
  frontmatter: Record<string, unknown>;
}

export interface ListOptions {
  /** 是否包含 draft；默认：非生产环境包含，生产构建排除 */
  includeDrafts?: boolean;
  /** 是否包含 hiddenInHomeList 的文章；默认包含 */
  includeHidden?: boolean;
  /** 是否包含 about 标记的文章；默认包含 */
  includeAbout?: boolean;
}

export type TaxonomyKind = "tags" | "categories";

export interface TaxonomyEntry {
  name: string;
  /** 用于路由的 slug（大小写归一 + 空格转连字符） */
  slug: string;
  count: number;
  posts: PostMeta[];
}

export interface ArchiveMonth {
  /** "YYYY-MM" */
  key: string;
  year: number;
  /** 1-12 */
  month: number;
  posts: PostMeta[];
}

export interface ArchiveYear {
  year: number;
  count: number;
  months: ArchiveMonth[];
}

export interface ContentStats {
  lang: Lang | "all";
  posts: number;
  drafts: number;
  words: number;
  readingMinutes: number;
  ai: number;
  pinned: number;
  tags: number;
  categories: number;
  groups: number;
  /** 最早 / 最新一篇文章的日期（ISO），没有文章时为 null */
  first: string | null;
  last: string | null;
}

/* --------------------------- 文件系统小工具 --------------------------- */

function readUtf8(absolutePath: string): string {
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new ContentError(`读取文件失败：${relativeToRoot(absolutePath)}（${detail}）`);
  }
}

function fileMtime(absolutePath: string): string {
  try {
    return fs.statSync(absolutePath).mtime.toISOString();
  } catch {
    return new Date(0).toISOString();
  }
}

function existsInPublic(relPath: string): boolean {
  try {
    return fs.existsSync(path.join(PUBLIC_DIR, relPath));
  } catch {
    return false;
  }
}

function relativeToRoot(absolutePath: string): string {
  return path.relative(REPO_ROOT, absolutePath).split(path.sep).join("/");
}

function postsDir(lang: Lang): string {
  return path.join(CONTENT_DIR, lang, "posts");
}

function postsAbsolutePath(lang: Lang, rel: string): string {
  return path.join(postsDir(lang), ...rel.split("/"));
}

function posixDirname(rel: string): string {
  const index = rel.lastIndexOf("/");
  return index < 0 ? "" : rel.slice(0, index);
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function parseDocumentFor(absolutePath: string, source: string): ParsedDocument {
  try {
    return parseFrontmatter(source);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new ContentError(`${relativeToRoot(absolutePath)}：${detail}`);
  }
}

/* ------------------------------ 目录扫描 ------------------------------ */

interface ScanResult {
  /** 文章（相对 content/<lang>/posts 的 posix 路径） */
  files: string[];
  /** 出现过的目录（含 ""，posix 路径） */
  directories: string[];
  /** _index.md（相对 content/<lang>/posts 的 posix 路径） */
  indexes: string[];
}

function scanPosts(lang: Lang): ScanResult {
  const result: ScanResult = { files: [], directories: [""], indexes: [] };
  walk(postsDir(lang), "", result);
  result.files.sort();
  result.indexes.sort();
  result.directories = [...new Set(result.directories)].sort();
  return result;
}

function walk(dir: string, base: string, result: ScanResult): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return; // 目录不存在 / 没有权限：当成「一篇都没有」，这是允许的状态
  }

  for (const entry of entries) {
    const name = entry.name;
    if (name.startsWith(".")) continue; // .gitkeep 之类

    const rel = base ? `${base}/${name}` : name;

    if (entry.isDirectory()) {
      result.directories.push(rel);
      walk(path.join(dir, name), rel, result);
      continue;
    }
    if (!entry.isFile()) continue;

    const lower = name.toLowerCase();
    const extension = POST_EXTENSIONS.find((candidate) => lower.endsWith(candidate));
    if (!extension) continue;

    const stem = name.slice(0, name.length - extension.length);
    const stemLower = stem.toLowerCase();
    if (stemLower === "readme") continue; // 写作规范不是文章
    if (stemLower === CARD_GROUP_STEM) {
      result.indexes.push(rel);
      continue;
    }
    if (stem.startsWith("_")) continue; // 其它下划线开头：模板 / 草稿盒

    result.files.push(rel);
  }
}

/* ------------------------------ 卡组 ------------------------------ */

function buildGroups(lang: Lang, scan: ScanResult): Map<string, CardGroupMeta> {
  const groups = new Map<string, CardGroupMeta>();

  const ensure = (slug: string): CardGroupMeta => {
    const existing = groups.get(slug);
    if (existing) return existing;
    const created: CardGroupMeta = {
      lang,
      slug,
      title: "",
      description: "",
      cover: null,
      order: 0,
      explicit: false,
      file: null,
      count: 0,
      posts: [],
    };
    groups.set(slug, created);
    return created;
  };

  ensure("");
  for (const dir of scan.directories) ensure(dir);

  for (const rel of scan.indexes) {
    const absolutePath = postsAbsolutePath(lang, rel);
    const document = parseDocumentFor(absolutePath, readUtf8(absolutePath));
    const fm = document.data;

    const group = ensure(posixDirname(rel));
    group.explicit = true;
    group.file = relativeToRoot(absolutePath);
    group.title = asString(fm.title) ?? asString(fm.name) ?? "";
    group.description =
      asString(fm.description) ?? asString(fm.summary) ?? asString(fm.desc) ?? "";
    group.order = asNumber(fm.order) ?? asNumber(fm.weight) ?? asNumber(fm.index) ?? 0;

    const cover = asString(fm.cover) ?? asString(fm.thumbnail) ?? asString(fm.image);
    group.cover = cover ? normalizeCoverPath(cover) : null;
  }

  return groups;
}

function sortGroups(groups: CardGroupMeta[]): CardGroupMeta[] {
  return groups.sort(
    (a, b) =>
      a.order - b.order ||
      Number(b.explicit) - Number(a.explicit) ||
      a.slug.localeCompare(b.slug),
  );
}

/* ------------------------------ 正文工具 ------------------------------ */

const CJK_PATTERN =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/g;
const LATIN_PATTERN = /[A-Za-z0-9][A-Za-z0-9'’\u2011-]*/g;

/** 中日韩按字、西文按词，去掉 Markdown 标记后再数 */
export function countWords(markdownText: string): number {
  const plain = stripMarkdown(markdownText);
  const cjk = plain.match(CJK_PATTERN)?.length ?? 0;
  const latin = plain.match(LATIN_PATTERN)?.length ?? 0;
  return cjk + latin;
}

/** 粗略剥掉 Markdown 语法，用于摘要与字数统计（不追求完美，别喂给渲染） */
export function stripMarkdown(body: string): string {
  return body
    .replace(/^```[\s\S]*?^```/gm, " ") // 围栏代码
    .replace(/^~~~[\s\S]*?^~~~/gm, " ")
    .replace(/`[^`\n]*`/g, " ") // 行内代码
    .replace(/\$\$[\s\S]*?\$\$/g, " ") // 块公式
    .replace(/\$[^$\n]*\$/g, " ") // 行内公式
    .replace(/<!--[\s\S]*?-->/g, " ") // 注释
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接保留文字
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, "") // 标题井号
    .replace(/^[ \t]{0,3}>[ \t]?/gm, "") // 引用
    .replace(/^[ \t]{0,3}(?:[-*+]|\d+\.)[ \t]+/gm, "") // 列表符号
    .replace(/^[ \t]{0,3}\|.*\|[ \t]*$/gm, (line) => line.replace(/\|/g, " ")) // 表格
    .replace(/^[ \t]{0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}$/gm, " ") // 分隔线
    .replace(/[*_~]{1,3}([^*_~\n]+)[*_~]{1,3}/g, "$1") // 强调 / 删除线
    .replace(/<[^>]+>/g, " "); // 内联 HTML
}

function buildExcerpt(body: string, limit = EXCERPT_LENGTH): string {
  const text = stripMarkdown(body).replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trimEnd()}…`;
}

function firstHeading(body: string): string | null {
  const withoutCode = body
    .replace(/^```[\s\S]*?^```/gm, "")
    .replace(/^~~~[\s\S]*?^~~~/gm, "");
  const match = /^[ \t]{0,3}#[ \t]+(.+?)[ \t]*#*[ \t]*$/m.exec(withoutCode);
  return match ? match[1].trim() : null;
}

function humanizeSlug(slug: string): string {
  const last = slug.split("/").pop() ?? slug;
  return last.replace(/[-_]+/g, " ").trim();
}

/* ------------------------------ 缩略图 ------------------------------ */

function normalizeCoverPath(value: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith("data:")) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

/** 在 public/thumbnails、public/covers 下按 slug 找图（含语言子目录） */
function findCoverInPublic(lang: Lang, slug: string): string | null {
  const keys = [slug, slug.split("/").pop() ?? slug];
  for (const dir of COVER_DIRS) {
    for (const prefix of [`${dir}/${lang}/`, `${dir}/`]) {
      for (const key of keys) {
        for (const extension of COVER_EXTENSIONS) {
          const rel = `${prefix}${key}.${extension}`;
          if (existsInPublic(rel)) return `/${rel}`;
        }
      }
    }
  }
  return null;
}

function firstImageInBody(body: string): string | null {
  const match = /!\[[^\]]*\]\(\s*<?([^\s>)]+)/.exec(body);
  return match ? normalizeCoverPath(match[1]) : null;
}

/* ------------------------------ slug ------------------------------ */

/**
 * slug 只能是 **URL 安全的 ASCII**（字母 / 数字 / `-._~/`）。
 *
 * 为什么这一条是硬的（线上实测，见 PROJECTS.md 第 4 节「非 ASCII slug」）：
 * 浏览器会把 href 里的中文自动百分号编码，而静态导出把这一篇写成**百分号编码的目录名**，
 * Cloudflare 的静态资源在查文件前又把它解码一次 —— 两边永远对不上。
 * 表现就是「列表里有这张卡片，点标题进去 404」（实测 `…/notes/%E7%AC%94%E8%AE%B0/`
 * 返回的是 Next 的 404 页面）。
 *
 * 所以宁可让构建当场失败、并给出改法，也不要让作者去线上猜「为什么打不开」：
 *   - 改文件名：`笔记.md` → `note-1.md`；
 *   - 或者保留中文文件名，在 frontmatter 里补一行 `slug`（TOML: `slug = "note-1"`，
 *     YAML: `slug: note-1`）。
 */
const URL_SAFE_SLUG = /^[A-Za-z0-9._~/-]+$/;

function assertUrlSafeSlug(slug: string, absolutePath: string, explicit: boolean): void {
  if (URL_SAFE_SLUG.test(slug) && !slug.includes("//")) return;
  throw new ContentError(
    `${relativeToRoot(absolutePath)}：slug "${slug}" 里有 URL 不安全的字符（中文、空格、% 等）。` +
      "静态导出会把这类 slug 写成百分号编码的目录名，浏览器按 href 编码后命不中那个文件，" +
      "线上就是「卡片在、点进去 404」—— 所以 slug 只能是 ASCII：" +
      (explicit
        ? '把 frontmatter 里的 slug 改成 ASCII（例如 slug = "note-1"）。'
        : '把文件重命名为 ASCII（例如 note-1.md），或在 frontmatter 里补一行 slug = "note-1"' +
          "（YAML: slug: note-1）。"),
  );
}

/**
 * 从文件路径推出 slug（`content/README.md` 第 1 节）。
 * 带上 `explicit`：frontmatter 里自己写了 slug 时，报错信息要说「改 slug」而不是「改文件名」。
 */
function resolveSlug(
  rel: string,
  fm: Record<string, unknown>,
): { slug: string; explicit: boolean } {
  const dir = posixDirname(rel);
  const name = rel.slice(dir ? dir.length + 1 : 0);
  const dot = name.lastIndexOf(".");
  const stem = dot < 0 ? name : name.slice(0, dot);

  // 目录里的 index.md 代表这个目录本身（Hexo / Nextra 的习惯）
  let slug = stem.toLowerCase() === "index" && dir ? dir : dir ? `${dir}/${stem}` : stem;

  const override =
    asString(fm.slug) ??
    asString(fm.abbrlink) ??
    asString(fm.permalink) ??
    asString(fm.path);
  if (override) {
    slug = override.replace(/^\/+|\/+$/g, "").replace(/\/index$/, "");
    return { slug, explicit: true };
  }
  return { slug, explicit: false };
}

/* ------------------------------ 单篇构建 ------------------------------ */

interface BuiltPost {
  meta: PostMeta;
  /** 正文 Markdown（未渲染） */
  body: string;
  /** 源文件原文（含 frontmatter），供「下载 .md」原样给出 */
  source: string;
}

function buildPost(
  lang: Lang,
  rel: string,
  groups: Map<string, CardGroupMeta>,
): BuiltPost {
  const absolutePath = postsAbsolutePath(lang, rel);
  const source = readUtf8(absolutePath);
  const document = parseDocumentFor(absolutePath, source);
  const fm = document.data;
  const body = document.body;

  const { slug, explicit: slugExplicit } = resolveSlug(rel, fm);
  // 见 assertUrlSafeSlug 的注释：非 ASCII 的 slug 会在线上 404，这里直接拦住
  assertUrlSafeSlug(slug, absolutePath, slugExplicit);
  const group = posixDirname(rel);

  const plainText = stripMarkdown(body).replace(/\s+/g, " ").trim();
  const excerpt = buildExcerpt(body);
  const title =
    asString(fm.title) ?? asString(fm.name) ?? firstHeading(body) ?? humanizeSlug(slug) ?? slug;

  const frontmatterDate = asDate(fm.date) ?? asDate(fm.created) ?? asDate(fm.published);
  const mtime = fileMtime(absolutePath);

  const frontmatterCover =
    asString(fm.cover) ?? asString(fm.thumbnail) ?? asString(fm.image) ?? asString(fm.banner);
  let cover: string | null = null;
  let coverSource: PostMeta["coverSource"] = null;
  if (frontmatterCover) {
    cover = normalizeCoverPath(frontmatterCover);
    coverSource = "frontmatter";
  } else {
    const fromPublic = findCoverInPublic(lang, slug);
    if (fromPublic) {
      cover = fromPublic;
      coverSource = "public";
    } else {
      const fromBody = firstImageInBody(body);
      if (fromBody) {
        cover = fromBody;
        coverSource = "body";
      }
    }
  }

  const wordCount = countWords(body);

  const meta: PostMeta = {
    lang,
    slug,
    href: `/${lang}/posts/${slug}/`,
    file: relativeToRoot(absolutePath),
    format: document.format,
    title,
    date: frontmatterDate ?? mtime,
    dateSource: frontmatterDate ? "frontmatter" : "mtime",
    updated: asDate(fm.updated) ?? asDate(fm.modified) ?? null,
    description:
      asString(fm.description) ?? asString(fm.summary) ?? asString(fm.desc) ?? excerpt,
    excerpt,
    tags: asStringList(fm.tags ?? fm.tag),
    categories: asStringList(fm.categories ?? fm.category ?? fm.cates),
    cover,
    coverSource,
    pinned: asBoolean(fm.pinned ?? fm.top ?? fm.sticky ?? fm.featured, false),
    draft: asBoolean(fm.draft ?? fm.isDraft, false),
    about: asBoolean(fm.about ?? fm.isAbout, false),
    hiddenInHomeList: asBoolean(
      fm.hiddenInHomeList ?? fm.hidden_in_home_list ?? fm.hidden ?? fm.excludeFromHome,
      false,
    ),
    isAI: asBoolean(fm.isAI ?? fm.is_ai ?? fm.ai ?? fm.AI, false),
    references: asReferences(fm.references ?? fm.reference ?? fm.refs),
    group,
    cardGroup: groups.get(group) ?? null,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
    frontmatter: fm,
  };

  // description 取了 excerpt 的话，别让 excerpt 是空串
  if (meta.description === "" && plainText !== "") meta.description = excerpt;

  return { meta, body, source };
}

/* ------------------------------ 分语言缓存 ------------------------------ */

interface LangCache {
  posts: PostMeta[];
  groups: CardGroupMeta[];
  bodies: Map<string, string>;
  /** slug → 源文件原文（含 frontmatter），「下载 .md」用 */
  sources: Map<string, string>;
}

const cache = new Map<Lang, LangCache>();

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function loadLang(lang: Lang): LangCache {
  const cached = cache.get(lang);
  if (cached && isProduction()) return cached;

  const scan = scanPosts(lang);
  const groups = buildGroups(lang, scan);
  const posts: PostMeta[] = [];
  const bodies = new Map<string, string>();
  const sources = new Map<string, string>();
  const seen = new Map<string, string>();

  for (const rel of scan.files) {
    const built = buildPost(lang, rel, groups);

    const previous = seen.get(built.meta.slug);
    if (previous && previous !== rel) {
      throw new ContentError(
        `slug 冲突：content/${lang}/posts/${previous} 与 ${rel} 都解析成 "${built.meta.slug}"，` +
          "请在其中一个文件的 frontmatter 里写 slug 区分",
      );
    }
    seen.set(built.meta.slug, rel);

    const group = groups.get(built.meta.group) ?? null;
    if (group) group.posts.push(built.meta);

    posts.push(built.meta);
    bodies.set(built.meta.slug, built.body);
    sources.set(built.meta.slug, built.source);
  }

  for (const group of groups.values()) {
    group.posts = group.posts.slice().sort(sortByDateDesc);
    group.count = group.posts.length;
  }

  const entry: LangCache = { posts, groups: sortGroups([...groups.values()]), bodies, sources };
  cache.set(lang, entry);
  return entry;
}

/* ------------------------------ 排序与过滤 ------------------------------ */

export function sortByDateDesc(a: PostMeta, b: PostMeta): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.slug < b.slug ? -1 : 1;
}

function defaultIncludeDrafts(): boolean {
  return !isProduction();
}

function resolveOptions(options?: ListOptions): Required<ListOptions> {
  return {
    includeDrafts: options?.includeDrafts ?? defaultIncludeDrafts(),
    includeHidden: options?.includeHidden ?? true,
    includeAbout: options?.includeAbout ?? true,
  };
}

function isVisible(post: PostMeta, options: Required<ListOptions>): boolean {
  if (post.draft && !options.includeDrafts) return false;
  if (post.hiddenInHomeList && !options.includeHidden) return false;
  if (post.about && !options.includeAbout) return false;
  return true;
}

/* ------------------------------ 查询 API ------------------------------ */

/** 某语言的全部文章，时间倒序 */
export function getPosts(lang: Lang, options?: ListOptions): PostMeta[] {
  const resolved = resolveOptions(options);
  return loadLang(lang)
    .posts.filter((post) => isVisible(post, resolved))
    .slice()
    .sort(sortByDateDesc);
}

/** 取单篇（draft 在生产构建里取不到） */
export function getPost(lang: Lang, slug: string, options?: ListOptions): PostMeta | null {
  const resolved = resolveOptions(options);
  const found = loadLang(lang).posts.find((post) => post.slug === slug) ?? null;
  if (!found) return null;
  return isVisible(found, resolved) ? found : null;
}

/** 取单篇 + 正文 Markdown（第 3 项渲染用） */
export function getPostWithBody(
  lang: Lang,
  slug: string,
  options?: ListOptions,
): { meta: PostMeta; body: string } | null {
  const meta = getPost(lang, slug, options);
  if (!meta) return null;
  const body = loadLang(lang).bodies.get(slug) ?? "";
  return { meta, body };
}

/**
 * 取单篇的**源文件原文**（含 frontmatter，逐字节），供文章页的「下载 .md」。
 *
 * 给的是原文而不是渲染后的 HTML、也不是剥掉 frontmatter 的 body：读者拿到手就是
 * 仓库里那一份，可以原样丢回 content/ 或喂给别的工具。取不到（草稿在生产的页面上、
 * slug 不存在）返回 null，调用方退回 body。
 */
export function getPostSource(lang: Lang, slug: string, options?: ListOptions): string | null {
  if (!getPost(lang, slug, options)) return null;
  return loadLang(lang).sources.get(slug) ?? null;
}

/** 首页列表：置顶在前，排除 hiddenInHomeList 与 about */
export function getHomePosts(lang: Lang, options?: ListOptions): PostMeta[] {
  const list = getPosts(lang, { includeHidden: false, ...options });
  const pinned = list.filter((post) => post.pinned);
  const rest = list.filter((post) => !post.pinned);
  return [...pinned, ...rest];
}

/** 标签 / 分类汇总，按出现次数倒序 */
export function getTaxonomy(
  lang: Lang,
  kind: TaxonomyKind,
  options?: ListOptions,
): TaxonomyEntry[] {
  const map = new Map<string, TaxonomyEntry>();

  for (const post of getPosts(lang, options)) {
    const names = kind === "tags" ? post.tags : post.categories;
    for (const name of names) {
      const key = name.toLowerCase();
      let entry = map.get(key);
      if (!entry) {
        entry = { name, slug: slugifyTaxonomy(name), count: 0, posts: [] };
        map.set(key, entry);
      }
      entry.count += 1;
      entry.posts.push(post);
    }
  }

  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-Hans-CN"),
  );
}

export function slugifyTaxonomy(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[\s/\\]+/g, "-")
      .replace(/[^\p{L}\p{N}\-_]+/gu, "")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "") || "topic"
  );
}

/** 按年月归档 */
export function getArchive(lang: Lang, options?: ListOptions): ArchiveYear[] {
  const years = new Map<number, Map<string, ArchiveMonth>>();

  for (const post of getPosts(lang, options)) {
    const key = post.date.slice(0, 7); // ISO 8601 → "YYYY-MM"
    if (!/^\d{4}-\d{2}$/.test(key)) continue;

    const year = Number(key.slice(0, 4));
    let months = years.get(year);
    if (!months) {
      months = new Map<string, ArchiveMonth>();
      years.set(year, months);
    }
    let bucket = months.get(key);
    if (!bucket) {
      bucket = { key, year, month: Number(key.slice(5, 7)), posts: [] };
      months.set(key, bucket);
    }
    bucket.posts.push(post);
  }

  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => {
      const list = [...months.values()].sort((a, b) => b.month - a.month);
      return { year, count: list.reduce((sum, item) => sum + item.posts.length, 0), months: list };
    });
}

/** 卡组：由 _index.md 定义，或由「目录里真的有文章」推出 */
export function getCardGroups(lang: Lang, options?: ListOptions): CardGroupMeta[] {
  const resolved = resolveOptions(options);
  const groups: CardGroupMeta[] = [];

  for (const group of loadLang(lang).groups) {
    const posts = group.posts.filter((post) => isVisible(post, resolved));
    if (posts.length === 0) continue;
    // 卡组封面：_index.md 没写就退到组内第一篇文章的封面
    groups.push({
      ...group,
      cover: group.cover ?? posts[0].cover ?? null,
      posts,
      count: posts.length,
    });
  }

  return groups;
}

export function getCardGroup(lang: Lang, slug: string, options?: ListOptions): CardGroupMeta | null {
  const key = slug.replace(/^\/+|\/+$/g, "");
  return getCardGroups(lang, options).find((group) => group.slug === key) ?? null;
}

/**
 * 卡组页（`/zh/posts/notes/`）的路由表 —— 文章页那个 catch-all 用它生成静态路径，
 * sitemap 也用同一份（两处不能各推一遍，否则会出现「页面在、但 sitemap 里没有」）。
 *
 * 两条排除规则：
 *   1. 顶层（slug ""）不是卡组，是「没放进目录的文章」，列表页把它算「未分组」；
 *   2. 这个 slug 已经被**一篇文章**占着时（`notes/index.md` → slug `notes`，也就是
 *      content/README.md 第 1 节说的「目录首页」），正文页优先 —— 那种情况下地址
 *      指向那一篇文章，而不是卡组页。
 */
export function getCardGroupRoutes(lang: Lang, options?: ListOptions): CardGroupMeta[] {
  const postSlugs = new Set(getPosts(lang, options).map((post) => post.slug));
  return getCardGroups(lang, options).filter(
    (group) => group.slug !== "" && !postSlugs.has(group.slug),
  );
}

/** 「关于」文章：about: true 的最新一篇；没有就返回 null（UI 要出空状态） */
export function getAboutPost(lang: Lang, options?: ListOptions): PostMeta | null {
  return getPosts(lang, options).find((post) => post.about) ?? null;
}

/** 站点统计（首页 / 归档 / 构建期产物用；零文章时全是 0 与 null） */
export function getContentStats(lang?: Lang): ContentStats {
  const langs: Lang[] = lang ? [lang] : LANGS;
  const includeDrafts = defaultIncludeDrafts();
  const tagSet = new Set<string>();
  const categorySet = new Set<string>();

  const stats: ContentStats = {
    lang: lang ?? "all",
    posts: 0,
    drafts: 0,
    words: 0,
    readingMinutes: 0,
    ai: 0,
    pinned: 0,
    tags: 0,
    categories: 0,
    groups: 0,
    first: null,
    last: null,
  };

  for (const current of langs) {
    const entry = loadLang(current);
    stats.groups += entry.groups.length;

    for (const post of entry.posts) {
      if (post.draft) {
        stats.drafts += 1;
        if (!includeDrafts) continue;
      }
      stats.posts += 1;
      stats.words += post.wordCount;
      stats.readingMinutes += post.readingMinutes;
      if (post.isAI) stats.ai += 1;
      if (post.pinned) stats.pinned += 1;
      for (const tag of post.tags) tagSet.add(tag.toLowerCase());
      for (const category of post.categories) categorySet.add(category.toLowerCase());
      if (!stats.first || post.date < stats.first) stats.first = post.date;
      if (!stats.last || post.date > stats.last) stats.last = post.date;
    }
  }

  stats.tags = tagSet.size;
  stats.categories = categorySet.size;
  return stats;
}
