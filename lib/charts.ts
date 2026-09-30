/**
 * lib/charts.ts —— 五类图表的语言名登记表（第 3 项）
 *
 * 这个文件同时被两边引用：
 *   - 服务端 / 构建期：lib/markdown.ts 用它认出 ```mermaid 之类的代码块，替换成占位 figure；
 *   - 浏览器：components/ArticleBody.tsx 用它挑对应的渲染器（动态 import）。
 *
 * 因此它必须保持「零依赖、不导入任何 node: 模块」，否则会污染客户端包。
 * 真正的渲染代码在 components/charts/*.ts（只在文章里真的出现图表时才加载）。
 */

export type ChartKind = "mermaid" | "echarts" | "graphviz" | "abc" | "smiles";

export interface ChartLanguage {
  kind: ChartKind;
  /** 显示名（出错提示、无标题时的 aria-label 用） */
  label: string;
  /** 一句话说明，写进 content/README.md 的那张表 */
  hint: string;
}

/** 代码块语言名 → 图表类型；`dot`、`abcjs` 是别名 */
export const CHART_LANGUAGES: Record<string, ChartLanguage> = {
  mermaid: {
    kind: "mermaid",
    label: "Mermaid",
    hint: "流程图 / 时序图 / 状态图 / 类图 / 甘特图",
  },
  echarts: {
    kind: "echarts",
    label: "ECharts",
    hint: "代码块内容是一份 ECharts option 的 JSON",
  },
  graphviz: {
    kind: "graphviz",
    label: "Graphviz",
    hint: "dot 语言的有向图 / 无向图",
  },
  dot: {
    kind: "graphviz",
    label: "Graphviz",
    hint: "graphviz 的别名",
  },
  abc: {
    kind: "abc",
    label: "ABC 记谱",
    hint: "五线谱（ABC notation）",
  },
  abcjs: {
    kind: "abc",
    label: "ABC 记谱",
    hint: "abc 的别名",
  },
  smiles: {
    kind: "smiles",
    label: "SMILES",
    hint: "化学结构式（SmilesDrawer）",
  },
};

/** 认不出来的语言名返回 null（会走普通的代码高亮） */
export function chartLanguage(lang: string | null | undefined): ChartLanguage | null {
  if (!lang) return null;
  return CHART_LANGUAGES[lang.trim().toLowerCase()] ?? null;
}

export interface ChartContext {
  /** 是否暗色外观（各渲染器自己决定用哪个主题名） */
  dark: boolean;
}

export type ChartCleanup = () => void;

/** 图表渲染器：把 source 画进 target；返回的清理函数在组件卸载时被调用 */
export type ChartRenderer = (
  target: HTMLElement,
  source: string,
  context: ChartContext,
) => Promise<ChartCleanup | void>;

/** components/charts/*.ts 都必须导出符合这个形状的 render */
export interface ChartModule {
  render: ChartRenderer;
}
