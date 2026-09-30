/**
 * components/charts/graphviz.ts —— Graphviz（dot 语言）渲染器
 *
 * 走 @hpcc-js/wasm-graphviz：Graphviz 被编译成 WebAssembly，在浏览器里算布局，
 * 构建期完全不需要 dot 可执行文件。
 *
 * 注意：wasm 二进制由这个包自己加载（打包器会把 .wasm 作为资源发出）。
 * 如果首次运行看到 wasm 404，把 .wasm 放进 public/ 后用 load() 的显式路径参数指过去。
 */

import type { ChartRenderer } from "@/lib/charts";

interface GraphvizInstance {
  layout?(source: string, format?: string, engine?: string): Promise<string> | string;
  dot?(source: string, format?: string): Promise<string> | string;
}

interface GraphvizFactory {
  load(): Promise<GraphvizInstance>;
}

export const render: ChartRenderer = async (target, source) => {
  const module = (await import("@hpcc-js/wasm-graphviz")) as unknown as {
    Graphviz?: GraphvizFactory;
    default?: (GraphvizFactory & { Graphviz?: GraphvizFactory }) | undefined;
  };

  const factory = module.Graphviz ?? module.default?.Graphviz ?? module.default;
  if (!factory || typeof factory.load !== "function") {
    throw new Error("@hpcc-js/wasm-graphviz 的导出结构与预期不符");
  }

  const graphviz = await factory.load();
  const svg =
    typeof graphviz.layout === "function"
      ? await graphviz.layout(source, "svg", "dot")
      : typeof graphviz.dot === "function"
        ? await graphviz.dot(source, "svg")
        : null;

  if (!svg) throw new Error("Graphviz 没有返回 SVG（检查 dot 语法）");
  target.innerHTML = svg;
};
