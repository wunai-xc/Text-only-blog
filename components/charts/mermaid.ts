/**
 * components/charts/mermaid.ts —— Mermaid 渲染器（只在文章里出现 ```mermaid 时被 import）
 *
 * securityLevel: "strict"：Mermaid 会清理节点文本，禁止点击跳转与脚本。
 * 渲染结果必须走 innerHTML —— 这是 Mermaid 官方给的用法，它只交回 <svg> 字符串。
 */

import type { ChartRenderer } from "@/lib/charts";

interface MermaidApi {
  initialize(config: Record<string, unknown>): void;
  render(id: string, text: string): Promise<{ svg: string }>;
}

let sequence = 0;

export const render: ChartRenderer = async (target, source, context) => {
  const module = (await import("mermaid")) as unknown as { default?: MermaidApi } & Partial<MermaidApi>;
  const mermaid = module.default ?? (module as MermaidApi);
  if (typeof mermaid.render !== "function") throw new Error("mermaid 的导出结构与预期不符");

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: context.dark ? "dark" : "neutral",
    fontFamily: "inherit",
    // 让图跟着正文的宽度收缩，不在手机上横向溢出
    flowchart: { useMaxWidth: true, htmlLabels: true },
    sequence: { useMaxWidth: true },
    gantt: { useMaxWidth: true },
  });

  sequence += 1;
  const { svg } = await mermaid.render(`chart-mermaid-${sequence}`, source);
  target.innerHTML = svg;

  const node = target.querySelector("svg");
  if (node) {
    // Mermaid 会给死高度，手机上会挤出横向滚动条；高度交给宽高比
    node.removeAttribute("height");
    node.style.maxWidth = "100%";
    node.style.height = "auto";
  }
};
