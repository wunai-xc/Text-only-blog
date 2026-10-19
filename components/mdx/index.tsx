/**
 * components/mdx/index.tsx —— 正文可用的版面组件（MDX）
 *
 * 文章仍然是 Markdown，只是在 .md 里多了一套「块级组件」：分栏、配图、图组、
 * 引言、提示框、通栏。作者写 `<Columns>` / `<Figure>` 这些名字，构建期由
 * lib/markdown.ts 交给 MDX 编译，最后由 react-dom/server 渲染成静态 HTML ——
 * 页面上仍然是一段普通 HTML，没有额外的客户端脚本。
 *
 * 这一层**只在服务端 / 构建期跑**：组件里没有 hook、没有事件、没有浏览器 API。
 * 想加交互（折叠、切换、拖拽）请另建客户端组件，并在 ArticleBody 里按 data 属性补齐。
 *
 * 样式在 app/globals.css 的「7a. MDX 版面组件」；写作规范在 content/README.md 第 10 节。
 * 改组件名、属性名或输出结构时，三处要一起改。
 */

import type { ReactNode } from "react";
import type { MDXComponents } from "mdx/types";

import { chartLanguage } from "@/lib/charts";

/* ------------------------------ 小工具 ------------------------------ */

/** 作者按仓库路径写 `/public/xxx.png` 时，发到浏览器要的是 `/xxx.png` */
function assetSrc(src: string): string {
  return src.startsWith("/public/") ? src.slice("/public".length) : src;
}

function textProp(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function countProp(value: unknown): 2 | 3 {
  return Number(value) === 3 ? 3 : 2;
}

/* ------------------------------ 分栏 ------------------------------ */

export interface ColumnsProps {
  /** 分几栏：2（默认）或 3；窄屏自动落成一栏 */
  count?: number | string;
  children?: ReactNode;
}

/**
 * 分栏容器。每一栏用一个 `<Column>` 包住，栏内可以照常写 Markdown
 * （组件与 Markdown 之间留空行，MDX 才会把里面当 Markdown 解析）。
 */
export function Columns({ count, children }: ColumnsProps) {
  return (
    <div className="mdx-columns" data-count={countProp(count)}>
      {children}
    </div>
  );
}

export interface ColumnProps {
  /** 这一栏跨几列：2 跨两列，3 跨满整行；不写就是普通一栏 */
  span?: number | string;
  children?: ReactNode;
}

export function Column({ span, children }: ColumnProps) {
  const value = Number(span);
  const dataSpan = value === 2 || value === 3 ? String(value) : undefined;
  return (
    <div className="mdx-column" data-span={dataSpan}>
      {children}
    </div>
  );
}

/* ------------------------------ 配图 ------------------------------ */

export interface FigureProps {
  /** 图片地址；写 `/public/xxx.png` 或 `/xxx.png` 都行 */
  src: string;
  /** 替代文字；装饰性图片可以留空 */
  alt?: string;
  /** 图注，画在图片下方 */
  caption?: string;
  /** body（默认，正文宽）/ wide（略宽）/ full（通栏） */
  size?: "body" | "wide" | "full" | string;
  /** 只有 size="body" 时生效：left / right 让文字绕图，center 居中 */
  align?: "left" | "right" | "center" | string;
  /** 图片外面再包一层链接 */
  href?: string;
  children?: ReactNode;
}

/**
 * 单张配图。`size` 控制宽度，`align` 控制是否让文字绕图：
 *
 *   <Figure src="/public/a.png" alt="说明" caption="图注" />
 *   <Figure src="/public/b.png" alt="" size="full" align="right" />
 *
 * 图注里可以写 Markdown 吗？这一版只接受纯文本；要富文本图注请用 `<Gallery caption>`，
 * 或直接在图片下面另写一段。链接地址会原样使用，作者自己保证它指向站内或可信站点。
 */
export function Figure({
  src,
  alt = "",
  caption,
  size = "body",
  align = "center",
  href,
}: FigureProps) {
  const kind = size === "wide" || size === "full" ? size : "body";
  const side = kind === "body" && (align === "left" || align === "right") ? align : "center";

  const image = (
    <img src={assetSrc(src)} alt={alt} loading="lazy" decoding="async" />
  );

  return (
    <figure className="mdx-figure" data-size={kind} data-align={side}>
      {href ? (
        <a className="mdx-figure-link" href={href}>
          {image}
        </a>
      ) : (
        image
      )}
      {caption ? <figcaption className="mdx-figure-caption">{caption}</figcaption> : null}
    </figure>
  );
}

/* ------------------------------ 图组 ------------------------------ */

export interface GalleryProps {
  /** 每行几张：2（默认）或 3；窄屏自动落成两张 / 一张 */
  columns?: number | string;
  /** 整组图的图注 */
  caption?: string;
  children?: ReactNode;
}

/**
 * 图组：把几个 `<Figure>` 摆成网格。图组里的 Figure 不再浮动、不再单独留外边距，
 * 图注仍可逐张写；整组说明写在 `caption` 上。
 */
export function Gallery({ columns, caption, children }: GalleryProps) {
  return (
    <figure className="mdx-gallery" data-count={countProp(columns)}>
      <div className="mdx-gallery-grid">{children}</div>
      {caption ? <figcaption className="mdx-gallery-caption">{caption}</figcaption> : null}
    </figure>
  );
}

/* ------------------------------ 引言 ------------------------------ */

export interface QuoteProps {
  /** 出处 / 作者；画在引言右下角 */
  cite?: string;
  children?: ReactNode;
}

/** 抽出来的重点引文：上下细线，字号略大，不带引用块的左边框。 */
export function Quote({ cite, children }: QuoteProps) {
  return (
    <figure className="mdx-quote">
      <blockquote>{children}</blockquote>
      {cite ? <figcaption>{cite}</figcaption> : null}
    </figure>
  );
}

/* ------------------------------ 提示框 ------------------------------ */

export interface NoteProps {
  /** 小标题；不写就只有一个色条 */
  title?: string;
  /** note（默认）/ tip / warn，三档只换左边色条与底色 */
  tone?: "note" | "tip" | "warn" | string;
  children?: ReactNode;
}

/** 旁注 / 提示 / 警告。语气只影响颜色，不影响排版。 */
export function Note({ title, tone = "note", children }: NoteProps) {
  const kind = tone === "tip" || tone === "warn" ? tone : "note";
  return (
    <aside className="mdx-note" data-tone={kind}>
      {title ? <p className="mdx-note-title">{title}</p> : null}
      {children}
    </aside>
  );
}

/* ------------------------------ 通栏 ------------------------------ */

export interface FullBleedProps {
  children?: ReactNode;
}

/**
 * 通栏块：从正文列宽向左右各借出页面内边距，得到「正文页最大宽度」那一档。
 * 适合长图、宽表、整段引文。窄屏上它仍然不超出视口。
 */
export function FullBleed({ children }: FullBleedProps) {
  return <div className="mdx-full-bleed">{children}</div>;
}

/* ------------------------------ 图表占位 ------------------------------ */

export interface ChartProps {
  /** mermaid / echarts / graphviz / abc / smiles */
  kind?: string;
  /** 代码块语言名（`dot`、`abcjs` 这类别名） */
  language?: string;
  /** 图注 */
  title?: string;
  /** 图表源码 */
  source?: string;
  children?: ReactNode;
}

/**
 * 图表占位由 lib/markdown.ts 的 remarkChartBlocks 生成（作者照旧写 ```mermaid），
 * 这里只负责把它渲染成 ArticleBody 认识的那段 HTML，不要在文章里手写 `<Chart>`。
 */
export function Chart({ kind, language, title, source }: ChartProps) {
  const normalized = chartLanguage(language ?? kind);
  const chartKind = normalized?.kind ?? "mermaid";
  const languageName = textProp(language) || chartKind;
  const label = textProp(title) || `${normalized?.label ?? chartKind} 图表`;

  return (
    <figure
      className="chart-block"
      data-chart={chartKind}
      data-chart-language={languageName}
    >
      <div className="chart-canvas" role="img" aria-label={label} />
      {title ? <figcaption className="chart-caption">{title}</figcaption> : null}
      <pre className="chart-source" hidden>
        {source ?? ""}
      </pre>
    </figure>
  );
}

/* ------------------------------ 映射表 ------------------------------ */

/**
 * MDX 组件名 → 实现。只列这套公开组件；`<div>`、`<span>` 这类小写标签由 MDX 当普通
 * HTML 处理，不经过这里。**不要在文章里写 `import`**：构建期没有给 MDX 配模块解析。
 */
export const MDX_COMPONENTS: MDXComponents = {
  Columns,
  Column,
  Figure,
  Gallery,
  Quote,
  Note,
  FullBleed,
  Chart,
};
