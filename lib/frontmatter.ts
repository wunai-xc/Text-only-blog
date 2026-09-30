/**
 * lib/frontmatter.ts —— 双格式 frontmatter 识别与归一化（第 2 项：内容管线）
 *
 *   文件开头是 `---`  → YAML（交给 gray-matter，实际解析引擎是 js-yaml）
 *   文件开头是 `+++`  → TOML（交给 lib/toml.ts）
 *   都没有            → 视为「无 frontmatter」，全文即正文
 *
 * 归一化的意义：让两种写法拿到同一份数据。
 *   - TOML 的日期是字符串，YAML 的日期是 Date 对象 → 统一成 ISO 字符串；
 *   - tags 既可以是数组，也可以是「逗号/顿号/竖线分隔」的字符串 → 统一成 string[]；
 *   - 布尔字段容忍 true / "true" / 1 / "是" 等写法 → 统一成 boolean。
 *
 * 日期解析口径（写进 content/README.md）：
 *   - 带时区（2024-01-01T08:00:00Z / +08:00）→ 按绝对时间；
 *   - 不带时区（2024-01-01T08:00:00 或 2024-01-01 08:00）→ 按**构建机器的本地时间**；
 *   - 只有日期（2024-01-01）→ 视为当天 00:00:00Z，最稳、跨时区不会漂。
 */

import matter from "gray-matter";

import { parseToml, TomlParseError, type TomlTable } from "./toml";

export type FrontmatterFormat = "yaml" | "toml" | "none";

export class FrontmatterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FrontmatterError";
  }
}

/** 参考文献条目（正文里用 [reference:N] 角标引用，第 3 项负责渲染） */
export interface ReferenceEntry {
  /** 角标里的 N 对应的 id（缺省时按书写顺序 1、2、3…） */
  id: string;
  /** 标题：没写时留空串，渲染层会退回 url 或 id */
  title: string;
  /** 链接：没写时留空串 */
  url: string;
  author?: string;
  site?: string;
  date?: string;
  note?: string;
}

export interface SplitFrontmatter {
  format: FrontmatterFormat;
  /** frontmatter 原文（不含分隔行）；无 frontmatter 时为空串 */
  raw: string;
  /** 正文 Markdown（已去掉 frontmatter 与分隔行） */
  body: string;
  /** 结束分隔符所在行号（从 1 开始；无 frontmatter 时为 0） */
  endLine: number;
}

export interface ParsedDocument extends SplitFrontmatter {
  /** 归一化之前的原始 frontmatter 数据 */
  data: Record<string, unknown>;
}

/* ------------------------------ 切分 ------------------------------ */

export function splitFrontmatter(source: string): SplitFrontmatter {
  const text = source.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/);
  const first = (lines[0] ?? "").trim();

  if (first !== "---" && first !== "+++") {
    return { format: "none", raw: "", body: text, endLine: 0 };
  }

  for (let i = 1; i < lines.length; i += 1) {
    if ((lines[i] ?? "").trim() === first) {
      return {
        format: first === "---" ? "yaml" : "toml",
        raw: lines.slice(1, i).join("\n"),
        body: lines.slice(i + 1).join("\n"),
        endLine: i + 1,
      };
    }
  }

  // 不静默：否则整篇正文都会被当成 frontmatter 吞掉
  throw new FrontmatterError(
    `frontmatter 没有闭合：第 1 行是 "${first}"，但文件里找不到结束的 "${first}"`,
  );
}

/* ------------------------------ 解析 ------------------------------ */

/**
 * 解析一段 frontmatter 文本。
 * @param raw      frontmatter 原文（不含分隔行）
 * @param format   yaml | toml
 * @param lineOffset 该文本首行在文件中的「上面有几行」，用于把行号还原成文件行号
 */
export function parseFrontmatterData(
  raw: string,
  format: FrontmatterFormat,
  lineOffset = 1,
): Record<string, unknown> {
  if (format === "none" || raw.trim() === "") return {};

  if (format === "toml") {
    try {
      const table: TomlTable = parseToml(raw);
      return table as Record<string, unknown>;
    } catch (error) {
      if (error instanceof TomlParseError) {
        const detail = error.message.replace(/^TOML 解析失败：/, "");
        throw new FrontmatterError(
          `TOML frontmatter 解析失败：${detail}（对应文件第 ${error.line + lineOffset} 行）`,
        );
      }
      throw error;
    }
  }

  try {
    // 借 gray-matter 的 YAML 引擎（js-yaml safeLoad）：把 frontmatter 拼回合法文档再解析
    const parsed = matter(`---\n${raw}\n---\n`);
    const data: unknown = parsed.data;
    if (data === null || typeof data !== "object" || Array.isArray(data)) return {};
    return data as Record<string, unknown>;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new FrontmatterError(`YAML frontmatter 解析失败：${detail}`);
  }
}

/** 一步到位：切分 + 解析 */
export function parseFrontmatter(source: string): ParsedDocument {
  const split = splitFrontmatter(source);
  return { ...split, data: parseFrontmatterData(split.raw, split.format, 1) };
}

/* --------------------------- 字段归一化 --------------------------- */

/** 转成去空白的字符串；数字/布尔/Date 也接受 */
export function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  return undefined;
}

const TRUE_WORDS = new Set(["true", "yes", "y", "on", "1", "是", "真", "开"]);
const FALSE_WORDS = new Set(["false", "no", "n", "off", "0", "否", "假", "关", ""]);

export function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const word = value.trim().toLowerCase();
    if (TRUE_WORDS.has(word)) return true;
    if (FALSE_WORDS.has(word)) return false;
  }
  return fallback;
}

/** 字符串数组：数组、逗号/顿号/分号/竖线分隔的字符串都能吃；自动去重去空 */
export function asStringList(value: unknown): string[] {
  const out: string[] = [];
  const push = (item: unknown): void => {
    const text = asString(item);
    if (text && !out.includes(text)) out.push(text);
  };

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string" || typeof item === "number") push(item);
    }
    return out;
  }
  if (typeof value === "string") {
    for (const piece of value.split(/[,，;；、|]/)) push(piece);
    return out;
  }
  if (typeof value === "number") push(value);
  return out;
}

/** 转成 ISO 8601 字符串（无法解析返回 undefined，由调用方决定兜底） */
export function asDate(value: unknown): string | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    // 时间戳：小于 1e11 按「秒」，否则按「毫秒」
    const ms = Math.abs(value) < 1e11 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  const text = asString(value);
  if (!text) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(`${text}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?\s*$/.test(text)) {
    const date = new Date(text.replace(/^(\d{4}-\d{2}-\d{2})[T ]/, "$1T"));
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

/** 参考文献列表：[{...}] 或 ["url1", "url2"] 或 "url1\nurl2" 都能吃 */
export function asReferences(value: unknown): ReferenceEntry[] {
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .map((url, index) => ({ id: String(index + 1), title: url, url }));
  }
  if (!Array.isArray(value)) return [];

  const out: ReferenceEntry[] = [];
  value.forEach((item, index) => {
    if (typeof item === "string" || typeof item === "number") {
      const url = asString(item) ?? "";
      out.push({ id: String(index + 1), title: url, url });
      return;
    }
    const row = asRecord(item);
    if (!row) return;

    const id = asString(row.id) ?? asString(row.key) ?? String(index + 1);
    const url = asString(row.url) ?? asString(row.link) ?? asString(row.href) ?? "";
    const title = asString(row.title) ?? asString(row.name) ?? asString(row.text) ?? url;

    out.push({
      id,
      title,
      url,
      author: asString(row.author) ?? asString(row.by),
      site: asString(row.site) ?? asString(row.source),
      date: asString(row.date),
      note: asString(row.note) ?? asString(row.desc) ?? asString(row.description),
    });
  });
  return out;
}
