/**
 * lib/toml.ts —— 自写 TOML 解析器（frontmatter 子集）
 *
 * 为什么手写：第 2 项的 `+++` frontmatter 只用到 TOML 的一个子集，
 * 为了它再装一个包不划算；手写还方便给出中文报错，写作时好定位。
 *
 * 支持：
 *   键值     name = "值"  /  dotted.key = 1  /  "带引号的键" = true
 *   字符串   "基本"  '字面量'  """多行"""  '''多行'''
 *   数字     42  -1_000  0xFF  0o755  0b1010  3.14  1e3  inf  nan
 *   布尔     true / false
 *   数组     [1, 2, 3]（可跨行、可尾逗号）
 *   内联表   { a = 1, b = "x" }
 *   表       [table]  [a.b.c]
 *   表数组   [[references]]   ← 参考文献就是用它写的
 *   日期     一律归一化成字符串：
 *            1979-05-27T07:32:00Z（含时区）→ "1979-05-27T07:32:00Z"
 *            1979-05-27 07:32:00（本地）   → "1979-05-27T07:32:00"
 *            1979-05-27（仅日期）          → "1979-05-27"
 *            07:32:00（仅时刻）            → "07:32:00"
 *
 * 有意不做的（frontmatter 里用不到）：TOML 全部边角规则（表重复定义的严格校验、
 * 内联表禁止再追加键等）。真遇到不该有的写法会抛出带行号的 TomlParseError。
 */

export type TomlValue = string | number | boolean | TomlValue[] | TomlTable;

export interface TomlTable {
  [key: string]: TomlValue | undefined;
}

export class TomlParseError extends Error {
  readonly line: number;
  readonly column: number;

  constructor(message: string, line: number, column: number) {
    super(`TOML 解析失败：${message}（第 ${line} 行，第 ${column} 列）`);
    this.name = "TomlParseError";
    this.line = line;
    this.column = column;
  }
}

export function isTomlTable(value: TomlValue | undefined): value is TomlTable {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/* --------------------------- 值层面的小工具 --------------------------- */

const DATETIME_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2})?$/,
  /^\d{4}-\d{2}-\d{2}$/,
  /^\d{2}:\d{2}:\d{2}(?:\.\d+)?$/,
];

/** 是 TOML 日期时间就归一化成字符串，否则返回 null */
function normalizeDatetime(token: string): string | null {
  if (!DATETIME_PATTERNS.some((pattern) => pattern.test(token))) return null;
  return token.replace(/^(\d{4}-\d{2}-\d{2})[Tt]/, "$1T").replace(/z$/, "Z");
}

/** 是 TOML 数字就返回 number，否则返回 null */
function parseTomlNumber(raw: string): number | null {
  const token = raw.replace(/_/g, "");
  if (/^[+-]?inf$/.test(token)) return token.startsWith("-") ? -Infinity : Infinity;
  if (/^[+-]?nan$/.test(token)) return NaN;

  const negative = token.startsWith("-");
  const sign = negative ? -1 : 1;
  const body = /^[+-]/.test(token) ? token.slice(1) : token;

  if (/^0x[0-9A-Fa-f]+$/.test(body)) return sign * Number.parseInt(body.slice(2), 16);
  if (/^0o[0-7]+$/.test(body)) return sign * Number.parseInt(body.slice(2), 8);
  if (/^0b[01]+$/.test(body)) return sign * Number.parseInt(body.slice(2), 2);
  if (/^\d+$/.test(body)) return sign * Number.parseInt(body, 10);
  if (/[.eE]/.test(body) && /^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(body)) return Number(token);

  return null;
}

/* ------------------------------ 主解析器 ------------------------------ */

export function parseToml(source: string): TomlTable {
  // 统一换行，避免 CRLF 影响多行字符串与报错定位
  const src = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  let pos = 0;

  const root: TomlTable = {};
  let current: TomlTable = root;

  /** 当前位置的字符（文件结尾返回 undefined） */
  function peek(offset = 0): string | undefined {
    return src[pos + offset];
  }

  function atEnd(): boolean {
    return pos >= src.length;
  }

  function error(message: string): never {
    const before = src.slice(0, pos);
    const line = before.split("\n").length;
    const column = pos - (before.lastIndexOf("\n") + 1) + 1;
    throw new TomlParseError(message, line, column);
  }

  function skipInlineWhitespace(): void {
    while (!atEnd() && (peek() === " " || peek() === "\t")) pos += 1;
  }

  function skipComment(): void {
    if (peek() === "#") {
      while (!atEnd() && peek() !== "\n") pos += 1;
    }
  }

  /** 跳过空白 / 注释 / 换行（数组与表头之间允许随意换行） */
  function skipTrivia(): void {
    for (;;) {
      const ch = peek();
      if (ch === undefined) return;
      if (ch === " " || ch === "\t" || ch === "\n") {
        pos += 1;
        continue;
      }
      if (ch === "#") {
        skipComment();
        continue;
      }
      return;
    }
  }

  /* ----------------------------- 键 ----------------------------- */

  function parseKeyPath(): string[] {
    const parts: string[] = [];
    for (;;) {
      skipInlineWhitespace();
      parts.push(parseKey());
      skipInlineWhitespace();
      if (peek() === ".") {
        pos += 1;
        continue;
      }
      return parts;
    }
  }

  function parseKey(): string {
    const ch = peek();
    if (ch === '"') {
      if (src.startsWith('"""', pos)) error("键名不支持多行字符串");
      return parseBasicString();
    }
    if (ch === "'") {
      if (src.startsWith("'''", pos)) error("键名不支持多行字符串");
      return parseLiteralString();
    }
    const match = /^[A-Za-z0-9_-]+/.exec(src.slice(pos));
    if (!match) error(`期待键名，遇到 ${ch === undefined ? "文件结尾" : `"${ch}"`}`);
    pos += match[0].length;
    return match[0];
  }

  /* ---------------------------- 字符串 ---------------------------- */

  function parseBasicString(): string {
    pos += 1; // 开头的 "
    let out = "";
    for (;;) {
      const ch = peek();
      if (ch === undefined) error("字符串没有闭合（缺少结尾的双引号）");
      if (ch === '"') {
        pos += 1;
        return out;
      }
      if (ch === "\n") error("单行字符串不能换行（多行请用三引号）");
      if (ch === "\\") {
        out += parseEscape();
        continue;
      }
      out += ch;
      pos += 1;
    }
  }

  function parseLiteralString(): string {
    pos += 1; // 开头的 '
    let out = "";
    for (;;) {
      const ch = peek();
      if (ch === undefined) error("字面量字符串没有闭合（缺少结尾的单引号）");
      if (ch === "'") {
        pos += 1;
        return out;
      }
      if (ch === "\n") error("单行字符串不能换行（多行请用三引号）");
      out += ch;
      pos += 1;
    }
  }

  function parseMultilineBasicString(): string {
    pos += 3;
    if (peek() === "\n") pos += 1; // 紧跟开头三引号的换行会被裁掉
    let out = "";
    for (;;) {
      if (atEnd()) error("多行字符串没有闭合（缺少结尾的三引号）");
      if (src.startsWith('"""', pos)) {
        pos += 3;
        // 结尾最多允许两个额外的引号属于内容（"""" / """""）
        let extra = 0;
        while (extra < 2 && peek() === '"') {
          out += '"';
          pos += 1;
          extra += 1;
        }
        return out;
      }
      const ch = peek();
      if (ch === "\\") {
        // 行尾反斜杠：把后续空白（含换行）全部裁掉
        const trailing = /^[ \t]*\n/.exec(src.slice(pos + 1));
        if (trailing) {
          pos += 1 + trailing[0].length;
          while (pos < src.length && /[ \t\n]/.test(src[pos] ?? "")) pos += 1;
          continue;
        }
        out += parseEscape();
        continue;
      }
      out += ch;
      pos += 1;
    }
  }

  function parseMultilineLiteralString(): string {
    pos += 3;
    if (peek() === "\n") pos += 1;
    let out = "";
    for (;;) {
      if (atEnd()) error("多行字面量字符串没有闭合（缺少结尾的三个单引号）");
      if (src.startsWith("'''", pos)) {
        pos += 3;
        let extra = 0;
        while (extra < 2 && peek() === "'") {
          out += "'";
          pos += 1;
          extra += 1;
        }
        return out;
      }
      out += src[pos];
      pos += 1;
    }
  }

  function parseEscape(): string {
    pos += 1; // 反斜杠
    const ch = peek();
    switch (ch) {
      case "b":
        pos += 1;
        return "\b";
      case "t":
        pos += 1;
        return "\t";
      case "n":
        pos += 1;
        return "\n";
      case "f":
        pos += 1;
        return "\f";
      case "r":
        pos += 1;
        return "\r";
      case '"':
        pos += 1;
        return '"';
      case "\\":
        pos += 1;
        return "\\";
      case "u":
      case "U": {
        const width = ch === "u" ? 4 : 8;
        const hex = src.slice(pos + 1, pos + 1 + width);
        if (hex.length !== width || !/^[0-9A-Fa-f]+$/.test(hex)) {
          error(`转义 \\${ch} 后面需要 ${width} 位十六进制数字`);
        }
        pos += 1 + width;
        const code = Number.parseInt(hex, 16);
        if (code > 0x10ffff) error("转义 \\U 的码位超出 Unicode 范围");
        return String.fromCodePoint(code);
      }
      default:
        error(`不认识的转义字符 \\${ch === undefined ? "（文件结尾）" : ch}`);
    }
  }

  /* ------------------------- 数组 / 内联表 ------------------------- */

  function parseArray(): TomlValue[] {
    pos += 1; // [
    const out: TomlValue[] = [];
    for (;;) {
      skipTrivia();
      if (atEnd()) error("数组没有闭合（缺少 ]）");
      if (peek() === "]") {
        pos += 1;
        return out;
      }
      out.push(parseValue());
      skipTrivia();
      const ch = peek();
      if (ch === ",") {
        pos += 1;
        continue;
      }
      if (ch === "]") {
        pos += 1;
        return out;
      }
      error(`数组元素之间需要 "," 或 "]"（当前是 ${ch === undefined ? "文件结尾" : `"${ch}"`}）`);
    }
  }

  function parseInlineTable(): TomlTable {
    pos += 1; // {
    const table: TomlTable = {};
    skipInlineWhitespace();
    if (peek() === "}") {
      pos += 1;
      return table;
    }
    for (;;) {
      skipInlineWhitespace();
      if (peek() === "\n") error("内联表不能换行（需要多行请用 [表名] 写法）");
      const keyPath = parseKeyPath();
      skipInlineWhitespace();
      if (peek() !== "=") error(`内联表里的键 "${keyPath.join(".")}" 后面缺少 "="`);
      pos += 1;
      skipInlineWhitespace();
      assignValue(table, keyPath, parseValue());
      skipInlineWhitespace();
      const ch = peek();
      if (ch === ",") {
        pos += 1;
        continue;
      }
      if (ch === "}") {
        pos += 1;
        return table;
      }
      error(`内联表元素之间需要 "," 或 "}"（当前是 ${ch === undefined ? "文件结尾" : `"${ch}"`}）`);
    }
  }

  /* ---------------------------- 值 ---------------------------- */

  function parseValue(): TomlValue {
    const ch = peek();
    if (ch === undefined) error("缺少值");
    if (ch === '"') {
      return src.startsWith('"""', pos) ? parseMultilineBasicString() : parseBasicString();
    }
    if (ch === "'") {
      return src.startsWith("'''", pos) ? parseMultilineLiteralString() : parseLiteralString();
    }
    if (ch === "[") return parseArray();
    if (ch === "{") return parseInlineTable();
    return parseBareValue();
  }

  function parseBareValue(): TomlValue {
    let token = readBareToken();
    if (token === "") error(`无法解析的值（当前是 ${peek() === undefined ? "文件结尾" : `"${peek()}"`}）`);

    // TOML 允许日期与时刻之间用空格：1979-05-27 07:32:00
    if (/^\d{4}-\d{2}-\d{2}$/.test(token)) {
      const time = /^[ \t]+\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:[Zz]|[+-]\d{2}:\d{2})?/.exec(
        src.slice(pos),
      );
      if (time) {
        token += `T${time[0].trim()}`;
        pos += time[0].length;
      }
    }

    if (token === "true") return true;
    if (token === "false") return false;

    const datetime = normalizeDatetime(token);
    if (datetime !== null) return datetime;

    const num = parseTomlNumber(token);
    if (num !== null) return num;

    error(`无法解析的值 "${token}"（字符串请加引号）`);
  }

  function readBareToken(): string {
    const start = pos;
    while (!atEnd()) {
      const ch = peek();
      if (
        ch === " " ||
        ch === "\t" ||
        ch === "\n" ||
        ch === "," ||
        ch === "]" ||
        ch === "}" ||
        ch === "#"
      ) {
        break;
      }
      pos += 1;
    }
    return src.slice(start, pos);
  }

  /* ------------------------- 写入 / 建表 ------------------------- */

  /** 走到 keyPath 的父表；中间缺的表会创建 */
  function descend(keyPath: string[]): { parent: TomlTable; last: string } {
    let node: TomlTable = root;
    for (let i = 0; i < keyPath.length - 1; i += 1) {
      const key = keyPath[i];
      const existing = node[key];
      if (existing === undefined) {
        const table: TomlTable = {};
        node[key] = table;
        node = table;
        continue;
      }
      if (isTomlTable(existing)) {
        node = existing;
        continue;
      }
      if (Array.isArray(existing)) {
        const tail = existing[existing.length - 1];
        if (tail !== undefined && isTomlTable(tail)) {
          node = tail;
          continue;
        }
      }
      error(`键 "${keyPath.slice(0, i + 1).join(".")}" 不是表`);
    }
    const last = keyPath[keyPath.length - 1];
    if (!last) error("键路径为空");
    return { parent: node, last };
  }

  function assignValue(target: TomlTable, keyPath: string[], value: TomlValue): void {
    let node = target;
    for (let i = 0; i < keyPath.length - 1; i += 1) {
      const key = keyPath[i];
      const existing = node[key];
      if (existing === undefined) {
        const table: TomlTable = {};
        node[key] = table;
        node = table;
        continue;
      }
      if (isTomlTable(existing)) {
        node = existing;
        continue;
      }
      error(`键 "${keyPath.slice(0, i + 1).join(".")}" 不是表，无法写入子键`);
    }
    const last = keyPath[keyPath.length - 1];
    if (!last) error("键路径为空");
    if (Object.prototype.hasOwnProperty.call(node, last)) {
      error(`键 "${keyPath.join(".")}" 重复定义`);
    }
    node[last] = value;
  }

  function parseKeyValue(target: TomlTable): void {
    const keyPath = parseKeyPath();
    skipInlineWhitespace();
    if (peek() !== "=") error(`键 "${keyPath.join(".")}" 后面缺少 "="`);
    pos += 1;
    skipInlineWhitespace();
    assignValue(target, keyPath, parseValue());
  }

  function parseTableHeader(): void {
    pos += 1; // [
    let isArrayOfTables = false;
    if (peek() === "[") {
      isArrayOfTables = true;
      pos += 1;
    }

    skipInlineWhitespace();
    const keyPath = parseKeyPath();
    skipInlineWhitespace();

    if (peek() !== "]") error("表头缺少 ]");
    pos += 1;
    if (isArrayOfTables) {
      if (peek() !== "]") error("表数组表头缺少 ]]");
      pos += 1;
    }

    const { parent, last } = descend(keyPath);
    const existing = parent[last];
    const label = keyPath.join(".");

    if (isArrayOfTables) {
      if (existing === undefined) {
        const list: TomlValue[] = [];
        parent[last] = list;
        const table: TomlTable = {};
        list.push(table);
        current = table;
        return;
      }
      if (Array.isArray(existing)) {
        const table: TomlTable = {};
        existing.push(table);
        current = table;
        return;
      }
      error(`数组表 "[[${label}]]" 与已定义的键冲突`);
    }

    if (existing === undefined) {
      const table: TomlTable = {};
      parent[last] = table;
      current = table;
      return;
    }
    if (isTomlTable(existing)) {
      current = existing;
      return;
    }
    error(`表 "[${label}]" 与已定义的键冲突`);
  }

  /* --------------------------- 文档循环 --------------------------- */

  function expectStatementEnd(): void {
    skipInlineWhitespace();
    const ch = peek();
    if (ch !== undefined && ch !== "\n" && ch !== "#") {
      error(`语句后面有多余内容 "${ch}"（字符串记得加引号）`);
    }
  }

  skipTrivia();
  while (!atEnd()) {
    if (peek() === "[") {
      parseTableHeader();
    } else {
      parseKeyValue(current);
    }
    expectStatementEnd();
    skipTrivia();
  }

  return root;
}
