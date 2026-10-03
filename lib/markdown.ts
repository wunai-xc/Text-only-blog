/**
 * lib/markdown.ts —— Markdown → HTML（第 3 项：渲染）
 *
 * 整条管线都在构建期 / 服务端跑，客户端只拿到一个 HTML 字符串：
 *
 *   remark-parse             Markdown → mdast
 *   remark-gfm               GFM：表格、任务列表、脚注、删除线、裸链接
 *   remark-cjk-friendly      中文里「标点紧贴 **」的强调修正（见下面那段注释）
 *   remark-cjk-friendly-gfm-strikethrough  同一问题的 ~~ 删除线版本
 *   remark-breaks            单个换行即换行（写中文随笔更顺手）
 *   remark-math              $…$ / $$…$$ → math 节点
 *   remarkCjkTypography      中文排版优化（第 4 项：补空格、半角标点转全角）
 *   remarkChartBlocks        ```mermaid 之类 → 占位 <figure>（浏览器按需渲染）
 *   remarkCitations          [reference:N] → 角标链接
 *   remark-rehype            mdast → hast（保留内联 HTML）
 *   rehype-raw               解析正文里的内联 HTML
 *   rehypeLinkCards          外链：行内加站点图标，单独成行的换成卡片（见 lib/link-cards.ts）
 *   rehype-slug              给标题加 id（目录靠它）
 *   rehypeCollectHeadings    收集标题 → 目录
 *   rehype-autolink-headings 标题末尾加 # 锚点
 *   rehype-katex             KaTeX（含 mhchem、自定义宏）
 *   rehype-highlight         highlight.js（monokai 主题在 globals.css 里）
 *   rehypeCodeBlocks         代码块套上工具头、印出语言名（上面那段）
 *   rehype-stringify         hast → HTML 字符串
 *
 * 图表为什么不在构建期渲染：mermaid / echarts / graphviz / abcjs / smiles-drawer
 * 加起来体积可观，而一篇文章通常只用其中一两种。占位 figure 里带着源码，
 * components/ArticleBody.tsx 见到了才动态 import 对应的库（离线 PWA 也友好）。
 *
 * 第 4 项（中文排版优化）在 lib/typography.ts：它只改 text 节点的值，
 * 代码块 / 行内代码 / 公式 / 链接地址 / 内联 HTML 都不是 text 节点，因此天然躲开；
 * 位置排在 remarkCitations 之前，而 `[reference:1]` 里的 `:` 左边是字母 `e`、
 * `[` 左边也不是「汉字与字母相邻」，所以角标语法不会被排版规则碰坏。
 *
 * 中文里的强调（`**`）另有一个 **CommonMark 解析层面**的坑，与上面那条排版优化不是一回事：
 * 闭合定界符的**内侧是标点**（`）`、`]`、`。` 之类）、**外侧既不是空白也不是标点**时，
 * 它不算「右翼定界符」，于是 `**抗生素（antibiotic）**的定义` 会整段渲染成字面量星号
 * （斜体 `*` 与 GFM 删除线 `~~` 同理）。这在中文里极其常见（术语后紧跟括注），
 * 却是 CommonMark 的既定行为（commonmark-spec#650），改不了了 ——
 * `remark-cjk-friendly` 就是为这件事存在的那个修正（VitePress / Rspress / Docusaurus 都内置了它），
 * `remark-cjk-friendly-gfm-strikethrough` 是同一问题在 `~~` 上的对应件。
 *
 * 两个包的三条使用规矩（照它们的文档来，改这一行之前先看一眼）：
 *   1. **两个一起挂**：只挂前一个的话，`~~` 在中文里照样失效；
 *   2. `remark-cjk-friendly-gfm-strikethrough` **必须排在 `remark-gfm` 之后**（插件自己的要求，
 *      放到它前面就不生效）；
 *   3. 都从 **`/parseOnly`** 进：本站只解析、从不把 mdast 写回 Markdown，
 *      不需要它们的序列化那一半（少打包几 KB）。
 */

import "katex/contrib/mhchem"; // 副作用导入：注册 \ce{} / \pu{}

import rehypeAutolinkHeadings, { type Options as AutolinkOptions } from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex, { type Options as KatexOptions } from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkCjkFriendly from "remark-cjk-friendly/parseOnly";
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough/parseOnly";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { chartLanguage } from "./charts";
import type { ReferenceEntry } from "./frontmatter";
import { rehypeLinkCards } from "./link-cards";
import { remarkCjkTypography, type TypographyOptions, type TypographyStats } from "./typography";

/* --------------------------- KaTeX 自定义宏 --------------------------- */

/**
 * 写在正文里就能用，例如 $\RR^n$、$\dd x$、$\abs{x}$、$\ce{H2O}$。
 * 宏名统一用「反斜杠 + 2~3 个字母」，避免和 KaTeX 内置命令撞车。
 */
export const KATEX_MACROS: Record<string, string> = {
  "\\RR": "\\mathbb{R}",
  "\\NN": "\\mathbb{N}",
  "\\ZZ": "\\mathbb{Z}",
  "\\QQ": "\\mathbb{Q}",
  "\\CC": "\\mathbb{C}",
  "\\dd": "\\mathrm{d}",
  "\\dif": "\\mathrm{d}",
  "\\ee": "\\mathrm{e}",
  "\\ii": "\\mathrm{i}",
  "\\abs": "\\left|#1\\right|",
  "\\norm": "\\left\\|#1\\right\\|",
  "\\ket": "\\left|#1\\right\\rangle",
  "\\bra": "\\left\\langle#1\\right|",
  "\\E": "\\operatorname{\\mathbb{E}}",
  "\\Var": "\\operatorname{Var}",
  "\\Cov": "\\operatorname{Cov}",
  "\\argmax": "\\operatorname{arg\\,max}",
  "\\argmin": "\\operatorname{arg\\,min}",
};

/* --------------------------- 两个插件的选项 --------------------------- */

/**
 * 标题锚点（`<h2>…<a class="heading-anchor">#</a></h2>`）。
 *
 * 为什么单独拎出来、还显式标注插件自己的 `Options` 类型，而不是内联写在 `.use()` 里：
 * unified 的签名是 `use(plugin, ...parameters: Parameters | [boolean])`（见 unified 的 index.d.ts），
 * 于是「选项」这个位置是一个**联合元组**；TS 对联合签名里的**新建字面量**只会挑一支做上下文
 * 推导，2026-09-30 的云构建日志里它挑中了 `[boolean]` 那一支，于是报
 * `TS2345 … is not assignable to type 'boolean'`（两处失败的都是这个原因）。
 * 写成显式标注 `Options` 的常量后，传进去的是**有类型、有名字**的值而不是新建字面量，
 * 只需要一次普通的结构比较（`Options` 可赋值给 `Readonly<Options>`），联合推导不再参与。
 */
const AUTOLINK_HEADING_OPTIONS: AutolinkOptions = {
  behavior: "append",
  // ariaHidden 必须是字符串 "true"：hast 的 properties 类型把 ARIA 属性收窄成
  // `"true" | "false" | string`，写布尔 `true` 会 TS2322（2026-09-30 云构建）。
  properties: { className: ["heading-anchor"], ariaHidden: "true", tabIndex: -1 },
  content: {
    type: "element",
    tagName: "span",
    properties: { ariaHidden: "true" },
    children: [{ type: "text", value: "#" }],
  },
};

/**
 * KaTeX。
 *
 * ⚠️ 这里**不能写 `throwOnError`**：rehype-katex 的 `Options` 是
 * `Omit<KatexOptions, "displayMode" | "throwOnError">`，传了就是类型错误（同样在云构建里炸过）。
 * 那「公式写错不要弄挂整站」由谁保证？由插件自己，看它的源码就清楚：
 * 它先用 `throwOnError: true` 试一次，失败时往 vfile 上记一条 message（我们把它收进 warnings），
 * 再用 `throwOnError: false` 重画一次 —— 于是错误按下面的 `errorColor` 画在原文位置。
 * `strict: "ignore"` / `trust: false` 则照常透传给 KaTeX：前者让不规范的写法变成警告，
 * 后者禁止 `\href` 之类搞出站外请求。
 */
const KATEX_OPTIONS: KatexOptions = {
  errorColor: "#d64545",
  strict: "ignore",
  trust: false,
  macros: KATEX_MACROS,
};

/* ------------------------------ 公共类型 ------------------------------ */

export interface TocEntry {
  id: string;
  text: string;
  /** 1–6，对应 h1–h6 */
  depth: number;
  children: TocEntry[];
}

export interface ReferenceSlot {
  id: string;
  /** 角标里显示的数字（1 开始，按最终列表顺序） */
  number: number;
  /** 锚点用的 slug（由 id 派生，非 ASCII 会被保留成字面量） */
  slug: string;
  title: string;
  entry: ReferenceEntry;
}

export interface RenderOptions {
  /** frontmatter 里的 references，用于把 [reference:N] 变成角标 */
  references?: ReferenceEntry[];
  /** 是否在结尾追加参考列表的 HTML（默认 true） */
  referenceList?: boolean;
  /** 是否允许正文里的内联 HTML（默认 true） */
  allowRawHtml?: boolean;
  /**
   * 中文排版（第 4 项）。
   * 不传 = 四条规则全开；传对象 = 只覆盖指定的开关；传 `false` = 整块跳过。
   *
   * ```ts
   * renderMarkdown(body, { typography: { punctuation: false } });
   * ```
   *
   * 文章页（第 12 项）会把 frontmatter 里的 `typography` 字段接到这里，
   * 让单篇文章可以关掉排版优化。
   */
  typography?: TypographyOptions | false;
  /** 收集到的警告（缺引用、图表块为空等）；返回值的 warnings 里也有一份 */
  onWarning?: (message: string) => void;
}

export interface RenderedMarkdown {
  /** 正文 HTML（不含参考列表） */
  html: string;
  /** 嵌套目录，空文章时为 [] */
  toc: TocEntry[];
  /** 参考列表 HTML，没有 references 时为空串 */
  referencesHtml: string;
  /** 「不致命但该改」的问题，例如 [reference:99] 在 frontmatter 里找不到 */
  warnings: string[];
  /** 中文排版都改了什么（第 4 项）；关闭时各项为 0 */
  typography: TypographyStats;
}

/* ------------------------- 宽松的树类型（内部用） ------------------------- */
/*
 * mdast / hast 的精确定义分散在 @types/mdast、@types/hast 等包上，
 * 本仓库不直接依赖它们，只用下面这几个「够用就好」的结构，
 * 免得插件升级后类型路径变动导致整站编译不过。
 */

interface MdastNode {
  type: string;
  value?: string;
  lang?: string | null;
  meta?: string | null;
  depth?: number;
  url?: string;
  title?: string;
  children?: MdastNode[];
  data?: { hProperties?: Record<string, unknown> };
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

type MdastVisitor = (node: MdastNode, parent: MdastNode, index: number) => void;
type HastVisitor = (node: HastNode) => void;

function walkMdast(node: MdastNode, visit: MdastVisitor): void {
  const children = node.children;
  if (!children) return;
  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    visit(child, node, index);
    // 替换过的节点（图表块 → html）不再往下走
    if (child.type !== "html") walkMdast(child, visit);
  }
}

function walkHast(node: HastNode, visit: HastVisitor): void {
  visit(node);
  const children = node.children;
  if (!children) return;
  for (const child of children) walkHast(child, visit);
}

function classList(properties: Record<string, unknown> | undefined): string[] {
  const value = properties?.className;
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
  return [];
}

/** 取节点里的纯文本；默认跳过 [N] 角标与 SVG（目录标题不该带上它们） */
function hastText(node: HastNode, skipCite = true): string {
  if (node.type === "text") return node.value ?? "";
  if (node.type === "element") {
    if (node.tagName === "svg") return "";
    if (skipCite && classList(node.properties).includes("cite")) return "";
  }
  const children = node.children;
  if (!children) return "";
  return children.map((child) => hastText(child, skipCite)).join("");
}

/* ------------------------------ 小工具 ------------------------------ */

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

/** 参考文献 id → 锚点 slug：保留中日韩与字母数字，其它字符变连字符 */
export function slugifyReferenceId(id: string): string {
  const slug = id
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? "ref" : slug;
}

function numericId(id: string): number | null {
  const trimmed = id.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
}

/**
 * 参考文献排序：纯数字 id 按数值升序在前，其余按书写顺序。
 * 角标显示的数字与文末列表的序号都来自这个顺序，两边必然一致。
 */
export function indexReferences(
  references: ReferenceEntry[],
  warn?: (message: string) => void,
): { slots: ReferenceSlot[]; index: Map<string, ReferenceSlot> } {
  const ordered = references.map((entry, position) => ({ entry, position })).sort((a, b) => {
    const left = numericId(a.entry.id);
    const right = numericId(b.entry.id);
    if (left !== null && right !== null) return left - right || a.position - b.position;
    if (left !== null) return -1;
    if (right !== null) return 1;
    return a.position - b.position;
  });

  const slots: ReferenceSlot[] = [];
  const index = new Map<string, ReferenceSlot>();

  ordered.forEach(({ entry }, position) => {
    const slot: ReferenceSlot = {
      id: entry.id,
      number: position + 1,
      slug: slugifyReferenceId(entry.id),
      title: entry.title || entry.url || entry.id,
      entry,
    };
    slots.push(slot);
    if (index.has(entry.id)) {
      warn?.(`references 里 id "${entry.id}" 出现了多次，角标会指向第一条`);
      return;
    }
    index.set(entry.id, slot);
  });

  return { slots, index };
}

/** [reference:x] 的宽容查找：先精确、再忽略大小写、最后按数值匹配 */
function findSlot(index: Map<string, ReferenceSlot>, raw: string): ReferenceSlot | undefined {
  const key = raw.trim();
  const exact = index.get(key);
  if (exact) return exact;

  const lower = key.toLowerCase();
  for (const [id, slot] of index) {
    if (id.toLowerCase() === lower) return slot;
  }

  const value = numericId(key);
  if (value !== null) {
    for (const [id, slot] of index) {
      if (numericId(id) === value) return slot;
    }
  }
  return undefined;
}

/* --------------------------- 插件：图表块 --------------------------- */

/** 图表的标题写在代码块语言名后面：```mermaid title="架构图" */
function parseChartCaption(meta: string): string {
  const match = /title\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"']+))/.exec(meta);
  if (!match) return "";
  return (match[1] ?? match[2] ?? match[3] ?? "").trim();
}

/**
 * 把 ```mermaid / ```echarts / … 的 code 节点换成一段占位 HTML。
 *
 * 结构（客户端 components/ArticleBody.tsx 依赖它，改这个结构就要同步改那边）：
 *   <figure class="chart-block" data-chart="mermaid" data-chart-language="mermaid">
 *     <div class="chart-canvas"></div>
 *     <pre class="chart-source" hidden>源码（已转义）</pre>
 *   </figure>
 */
function remarkChartBlocks() {
  return (tree: MdastNode): void => {
    walkMdast(tree, (node, parent, index) => {
      if (node.type !== "code") return;
      const language = chartLanguage(node.lang);
      if (!language) return;

      const source = node.value ?? "";
      const caption = parseChartCaption(node.meta ?? "");
      const label = caption || `${language.label} 图表`;
      const html = [
        `<figure class="chart-block" data-chart="${language.kind}" data-chart-language="${escapeAttribute(
          (node.lang ?? "").trim().toLowerCase(),
        )}">`,
        `<div class="chart-canvas" role="img" aria-label="${escapeAttribute(label)}"></div>`,
        caption ? `<figcaption class="chart-caption">${escapeHtml(caption)}</figcaption>` : "",
        `<pre class="chart-source" hidden>${escapeHtml(source)}</pre>`,
        "</figure>",
      ]
        .filter(Boolean)
        .join("");

      parent.children?.splice(index, 1, { type: "html", value: html });
    });
  };
}

/* -------------------------- 插件：引用角标 -------------------------- */

interface CitationOptions {
  index: Map<string, ReferenceSlot>;
  /** 记录「哪些参考文献被引用过」，参考列表据此决定要不要画返回箭头 */
  cited: Set<string>;
  warn: (message: string) => void;
}

const CITATION_PATTERN = /\[reference:([^\]\n]{1,64})\]/g;

function remarkCitations(options: CitationOptions) {
  return (tree: MdastNode): void => {
    walkMdast(tree, (node, parent, index) => {
      if (node.type !== "text") return;
      // 链接文字里不再插角标，免得出现 <a> 套 <a>
      if (parent.type === "link") return;

      const value = node.value ?? "";
      if (!value.includes("[reference:")) return;

      const parts: MdastNode[] = [];
      let last = 0;
      let match: RegExpExecArray | null;
      CITATION_PATTERN.lastIndex = 0;

      while ((match = CITATION_PATTERN.exec(value)) !== null) {
        const raw = match[1];
        if (match.index > last) {
          parts.push({ type: "text", value: value.slice(last, match.index) });
        }

        const slot = findSlot(options.index, raw);
        if (!slot) {
          options.warn(
            `正文里的 [reference:${raw}] 在 frontmatter 的 references 里找不到对应 id`,
          );
          parts.push({
            type: "html",
            value: `<span class="cite cite-missing" title="frontmatter 的 references 里没有 id 为 ${escapeAttribute(
              raw,
            )} 的条目">[reference:${escapeHtml(raw)}]</span>`,
          });
        } else {
          const first = !options.cited.has(slot.slug);
          options.cited.add(slot.slug);
          parts.push({
            type: "link",
            url: `#reference-${slot.slug}`,
            title: slot.title,
            data: {
              hProperties: {
                className: ["cite"],
                "data-cite-id": slot.id,
                ...(first ? { id: `cite-${slot.slug}` } : {}),
              },
            },
            children: [{ type: "text", value: `[${slot.number}]` }],
          });
        }

        last = match.index + match[0].length;
      }

      if (parts.length === 0) return;
      if (last < value.length) parts.push({ type: "text", value: value.slice(last) });
      parent.children?.splice(index, 1, ...parts);
    });
  };
}

/* -------------------------- 插件：代码块工具头 -------------------------- */

/**
 * 给每个代码块套一层 `.code-block`，并在顶部工具条里印出语言名 —— 回答「这段是什么语法」。
 *
 * 为什么套一层、而不是只给 `<pre>` 加个属性：工具条与代码块要共用同一个圆角与底色，
 * 得有一个共同的父元素兜住；它同时也给客户端的复制按钮留了个现成的落点
 * （components/ArticleBody.tsx 往 `.code-head` 里补按钮）。
 *
 * 为什么语言名在**构建期**印（复制按钮却在浏览器里补）：语言名是内容的一部分，
 * 禁用 JS、爬虫、离线首屏都该看得到（约定第 4 条）；剪贴板只有浏览器里有，
 * 复制按钮才必须等脚本。
 *
 * 只认 rehype-highlight 产出的结构（`<pre><code class="hljs language-java">`），
 * 所以必须排在它**之后**。两种 `<pre>` 不动：
 *   - 图表源码 `<pre class="chart-source" hidden>`（lib/charts.ts 的占位结构，不是给人读的）；
 *   - 不是「正好一个 `<code>`」的裸 `<pre>`（正文里的内联 HTML 可能自己写）。
 * 没写语言名的代码块（``` 后面空着）没有 `language-` 类，工具条就只留复制按钮，不硬安一个名字。
 *
 * 结构（改这个结构要同步改 globals.css 的 6e 与 components/ArticleBody.tsx）：
 *   <div class="code-block">
 *     <div class="code-head"><span class="code-lang">java</span></div>
 *     <pre><code class="hljs language-java">…</code></pre>
 *   </div>
 */
function rehypeCodeBlocks() {
  return (tree: HastNode): void => {
    /** 需要父节点才能换掉孩子，所以这里自己递归（walkHast 不给父节点） */
    const visit = (parent: HastNode): void => {
      const children = parent.children;
      if (!children) return;
      for (let index = 0; index < children.length; index += 1) {
        const child = children[index];
        if (child.type === "element" && child.tagName === "pre") {
          const wrapped = wrapCodeBlock(child);
          if (wrapped) {
            children[index] = wrapped;
            continue;
          }
        }
        visit(child);
      }
    };
    visit(tree);
  };
}

/** 语言名：rehype-highlight 在 `<code>` 上写着 `language-java`；没写就是空串 */
function codeLanguage(code: HastNode): string {
  for (const name of classList(code.properties)) {
    if (name.startsWith("language-")) return name.slice("language-".length);
  }
  return "";
}

/** 把 `<pre><code>` 包成 `.code-block`；不是这个形状（或图表源码）就返回 null 不动它 */
function wrapCodeBlock(pre: HastNode): HastNode | null {
  if (classList(pre.properties).includes("chart-source")) return null;

  const children = pre.children ?? [];
  const code = children.find((child) => child.type === "element" && child.tagName === "code");
  if (children.length !== 1 || !code) return null;

  const language = codeLanguage(code);
  const head: HastNode = {
    type: "element",
    tagName: "div",
    properties: { className: ["code-head"] },
    children: language
      ? [
          {
            type: "element",
            tagName: "span",
            properties: { className: ["code-lang"] },
            children: [{ type: "text", value: language }],
          },
        ]
      : [],
  };

  return {
    type: "element",
    tagName: "div",
    properties: { className: ["code-block"] },
    children: [head, pre],
  };
}

/* ---------------------------- 插件：目录 ---------------------------- */

export interface HeadingRecord {
  id: string;
  text: string;
  depth: number;
}

interface CollectHeadingsOptions {
  collect: (heading: HeadingRecord) => void;
}

/** 必须排在 rehype-slug 之后：id 是它给的 */
function rehypeCollectHeadings(options: CollectHeadingsOptions) {
  return (tree: HastNode): void => {
    walkHast(tree, (node) => {
      if (node.type !== "element" || !node.tagName) return;
      const match = /^h([1-6])$/.exec(node.tagName);
      if (!match) return;

      const id = node.properties?.id;
      if (typeof id !== "string" || id === "") return;

      options.collect({
        id,
        depth: Number(match[1]),
        text: hastText(node).replace(/\s+/g, " ").trim(),
      });
    });
  };
}

/** 把按文档顺序的标题摊平成嵌套目录（跳过层级时的归属交给最近的浅层标题） */
export function buildToc(headings: HeadingRecord[]): TocEntry[] {
  const roots: TocEntry[] = [];
  const stack: TocEntry[] = [];

  for (const heading of headings) {
    const entry: TocEntry = {
      id: heading.id,
      text: heading.text,
      depth: heading.depth,
      children: [],
    };
    while (stack.length > 0 && stack[stack.length - 1].depth >= entry.depth) stack.pop();
    if (stack.length === 0) roots.push(entry);
    else stack[stack.length - 1].children.push(entry);
    stack.push(entry);
  }

  return roots;
}

/** 摊平目录（右侧进度条 / 上下篇导航那种「按顺序走一遍」的场合用） */
export function flattenToc(toc: TocEntry[]): TocEntry[] {
  const out: TocEntry[] = [];
  const visit = (list: TocEntry[]): void => {
    for (const entry of list) {
      out.push(entry);
      visit(entry.children);
    }
  };
  visit(toc);
  return out;
}

/* --------------------------- 参考列表 HTML --------------------------- */

function renderReferenceMeta(entry: ReferenceEntry): string {
  const pieces = [entry.author, entry.site, entry.date]
    .map((piece) => (piece ?? "").trim())
    .filter((piece) => piece !== "");
  return pieces.length === 0 ? "" : pieces.map(escapeHtml).join(" · ");
}

/** 文末参考列表；角标↔列表的对应关系靠 id="reference-<slug>" */
export function renderReferenceList(slots: ReferenceSlot[], cited: Set<string>): string {
  if (slots.length === 0) return "";

  const items = slots.map((slot) => {
    const label = slot.entry.title || slot.entry.url || slot.id;
    const title = escapeHtml(label);
    const body = slot.entry.url
      ? `<a href="${escapeAttribute(slot.entry.url)}" target="_blank" rel="noopener noreferrer">${title}</a>`
      : title;
    const meta = renderReferenceMeta(slot.entry);
    const note = (slot.entry.note ?? "").trim();
    const back = cited.has(slot.slug)
      ? ` <a class="reference-back" href="#cite-${escapeAttribute(slot.slug)}" aria-label="回到引用处">↩</a>`
      : "";

    return [
      `<li id="reference-${escapeAttribute(slot.slug)}" class="reference-item">`,
      `<span class="reference-index">[${slot.number}]</span> `,
      `<span class="reference-body">${body}`,
      meta ? `<span class="reference-meta">${meta}</span>` : "",
      note ? `<span class="reference-note">${escapeHtml(note)}</span>` : "",
      back,
      "</span>",
      "</li>",
    ]
      .filter(Boolean)
      .join("");
  });

  return [
    '<section class="references" aria-label="参考文献">',
    '<h2 class="references-title">参考文献</h2>',
    `<ol class="references-list">${items.join("")}</ol>`,
    "</section>",
  ].join("");
}

/* ------------------------------ 主入口 ------------------------------ */

/**
 * 渲染一篇正文。
 *
 * ```ts
 * const { html, toc, referencesHtml, warnings } = await renderMarkdown(body, {
 *   references: meta.references,
 * });
 * ```
 *
 * 返回的 `html` 是正文，`referencesHtml` 单独给，方便文章页把它放在「上下篇」之前。
 * 每篇文章都会新建一个 processor：插件带着本次的引用表与警告收集器，不能复用。
 */
export async function renderMarkdown(
  markdown: string,
  options: RenderOptions = {},
): Promise<RenderedMarkdown> {
  const warnings: string[] = [];
  const warn = (message: string): void => {
    warnings.push(message);
    options.onWarning?.(message);
  };

  const { slots, index } = indexReferences(options.references ?? [], warn);
  const cited = new Set<string>();
  const headings: HeadingRecord[] = [];

  const typography: TypographyStats = {
    texts: 0,
    spaces: 0,
    punctuation: 0,
    parentheses: 0,
    ellipses: 0,
  };
  // typography: false → 传空开关进去，插件内部直接原样返回（不做任何字符串处理）
  const typographyOptions: TypographyOptions =
    options.typography === false
      ? { spacing: false, punctuation: false, parentheses: false }
      : {
          ...options.typography,
          onStats: (stats) => {
            typography.texts += stats.texts;
            typography.spaces += stats.spaces;
            typography.punctuation += stats.punctuation;
            typography.parentheses += stats.parentheses;
            typography.ellipses += stats.ellipses;
          },
        };

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm, { singleTilde: true })
    // 中文里的 `**` / `~~` 修正。顺序是插件要求的：必须先 GFM、再这两个（见文件头注释）
    .use(remarkCjkFriendly)
    .use(remarkCjkFriendlyGfmStrikethrough)
    .use(remarkBreaks)
    .use(remarkMath)
    .use(remarkCjkTypography, typographyOptions)
    .use(remarkChartBlocks)
    .use(remarkCitations, { index, cited, warn })
    .use(remarkRehype, { allowDangerousHtml: options.allowRawHtml !== false })
    .use(rehypeRaw)
    .use(rehypeLinkCards)
    .use(rehypeSlug)
    .use(rehypeCollectHeadings, { collect: (heading: HeadingRecord) => headings.push(heading) })
    .use(rehypeAutolinkHeadings, AUTOLINK_HEADING_OPTIONS)
    .use(rehypeKatex, KATEX_OPTIONS)
    .use(rehypeHighlight, { detect: false, ignoreMissing: true })
    // 排在 highlight 之后：语言名读的是它写在 <code> 上的 `language-xxx` 类
    .use(rehypeCodeBlocks)
    .use(rehypeStringify, { allowDangerousHtml: true });

  const file = await processor.process(markdown);
  const html = String(file);

  /**
   * 插件记在 vfile 上的消息（例如 rehype-katex 的「这条公式没渲染成功」）也收进 warnings：
   * 它们是给作者看的诊断信息，构建日志与开发态自检都会打印，不影响产物。
   */
  for (const message of file.messages) {
    const where = typeof message.line === "number" ? `第 ${message.line} 行：` : "";
    warn(`${message.source ?? "markdown"}：${where}${message.reason}`);
  }

  const referencesHtml =
    options.referenceList === false ? "" : renderReferenceList(slots, cited);

  return { html, toc: buildToc(headings), referencesHtml, warnings, typography };
}
