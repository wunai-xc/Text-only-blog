/**
 * components/charts/graphviz.ts —— Graphviz（dot 语言）渲染器
 *
 * 走 @hpcc-js/wasm-graphviz：Graphviz 被编译成 WebAssembly，在浏览器里算布局，
 * 构建期完全不需要 dot 可执行文件。
 *
 * 配色（第 6 项）：Graphviz 默认是「黑字黑线 + 透明底」，暗色外观下等于看不见。
 * 省事的做法是往 dot 源里插三条 **默认属性**（graph/node/edge），
 * 它们只影响「自己没写颜色」的对象 —— 作者在源里显式写的 color/fontcolor 依旧优先。
 *
 * 注意：wasm 二进制由这个包自己加载（打包器会把 .wasm 作为资源发出）。
 * 如果首次运行看到 wasm 404，把 .wasm 放进 public/ 后用 load() 的显式路径参数指过去。
 */

import type { ChartRenderer } from "@/lib/charts";
import type { ThemeTokens } from "@/lib/theme";

interface GraphvizInstance {
  layout?(source: string, format?: string, engine?: string): Promise<string> | string;
  dot?(source: string, format?: string): Promise<string> | string;
}

interface GraphvizFactory {
  load(): Promise<GraphvizInstance>;
}

/**
 * 在第一个 `{` 之后插入默认属性语句。
 * 找不到 `{` 就原样返回（Graphviz 自己会报语法错，作者在图上能看到原因）。
 * 颜色都是 `#rrggbb`（见 app/globals.css 的令牌），Graphviz 认这种写法。
 */
function withThemeDefaults(source: string, tokens: ThemeTokens): string {
  const brace = source.indexOf("{");
  if (brace < 0) return source;

  const defaults = [
    'graph [bgcolor="transparent"]',
    `node [color="${tokens.inkMuted}" fontcolor="${tokens.ink}"]`,
    `edge [color="${tokens.inkMuted}" fontcolor="${tokens.ink}"]`,
  ].join(" ");

  return `${source.slice(0, brace + 1)}\n${defaults}\n${source.slice(brace + 1)}`;
}

export const render: ChartRenderer = async (target, source, context) => {
  const module = (await import("@hpcc-js/wasm-graphviz")) as unknown as {
    Graphviz?: GraphvizFactory;
    default?: (GraphvizFactory & { Graphviz?: GraphvizFactory }) | undefined;
  };

  const factory = module.Graphviz ?? module.default?.Graphviz ?? module.default;
  if (!factory || typeof factory.load !== "function") {
    throw new Error("@hpcc-js/wasm-graphviz 的导出结构与预期不符");
  }

  const graphviz = await factory.load();
  const themed = withThemeDefaults(source, context.colors);
  const svg =
    typeof graphviz.layout === "function"
      ? await graphviz.layout(themed, "svg", "dot")
      : typeof graphviz.dot === "function"
        ? await graphviz.dot(themed, "svg")
        : null;

  if (!svg) throw new Error("Graphviz 没有返回 SVG（检查 dot 语法）");
  target.innerHTML = svg;
};
