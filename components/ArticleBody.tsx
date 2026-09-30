"use client";

import { useEffect, useRef } from "react";

import {
  chartLanguage,
  type ChartCleanup,
  type ChartContext,
  type ChartKind,
  type ChartModule,
} from "@/lib/charts";

/**
 * 图表类型 → 渲染器模块。
 *
 * 每个值都是一次动态 import：文章里没有图表时，mermaid / echarts / graphviz /
 * abcjs / smiles-drawer 一个字节都不会进客户端包，离线 PWA 也不会平白变大。
 * 而且它们只在浏览器里跑（需要 DOM、canvas、ResizeObserver），
 * 静态导出时无法预渲染，只能这样「客户端补齐」。
 */
const LOADERS: Record<ChartKind, () => Promise<ChartModule>> = {
  mermaid: () => import("./charts/mermaid"),
  echarts: () => import("./charts/echarts"),
  graphviz: () => import("./charts/graphviz"),
  abc: () => import("./charts/abc"),
  smiles: () => import("./charts/smiles"),
};

function prefersDark(): boolean {
  if (typeof window === "undefined") return false;

  // 第 6 项会在 <html data-theme> 上写站点自己的主题；有它就听它的
  const configured = document.documentElement.dataset.theme;
  if (configured === "dark") return true;
  if (configured === "light" || configured === "paper") return false;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 出错时把原因写在图的位置上，作者一眼能看到，读者也不会看到半张图 */
function markError(block: HTMLElement, message: string): void {
  block.dataset.chartState = "error";
  const target = block.querySelector<HTMLElement>(".chart-canvas") ?? block;

  const node = document.createElement("p");
  node.className = "chart-error";
  node.textContent = message; // 用 textContent：源码里的尖括号不会被当成标签
  target.replaceChildren(node);

  console.error("[chart]", message);
}

export interface ArticleBodyProps {
  /** lib/markdown.ts 渲染出来的正文 HTML */
  html: string;
  className?: string;
}

/**
 * 正文容器：渲染 HTML，并把里面的图表占位逐个交给对应渲染器。
 *
 * HTML 来自构建期（本仓库自己的 Markdown），不是运行时用户输入；
 * 作者在正文里写内联 HTML 也是被允许的（见 content/README.md）。
 */
export default function ArticleBody({ html, className }: ArticleBodyProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const blocks = Array.from(
      host.querySelectorAll<HTMLElement>("figure.chart-block[data-chart]"),
    );
    if (blocks.length === 0) return;

    const context: ChartContext = { dark: prefersDark() };
    const cleanups: ChartCleanup[] = [];
    let cancelled = false;

    const run = async (): Promise<void> => {
      for (const block of blocks) {
        if (cancelled) return;

        const kind = block.dataset.chart as ChartKind | undefined;
        const language = chartLanguage(block.dataset.chartLanguage ?? kind ?? null);
        const label = language?.label ?? kind ?? "未知";
        const loader = kind ? LOADERS[kind] : undefined;

        const canvas = block.querySelector<HTMLElement>(".chart-canvas");
        const source = block.querySelector<HTMLElement>(".chart-source")?.textContent ?? "";

        if (!loader || !canvas) {
          markError(block, `暂不支持的图表类型：${kind ?? "未知"}`);
          continue;
        }
        if (source.trim() === "") {
          markError(block, `${label} 代码块是空的`);
          continue;
        }

        try {
          const module = await loader();
          const cleanup = await module.render(canvas, source, context);
          if (cancelled) {
            if (typeof cleanup === "function") cleanup();
            continue;
          }
          if (typeof cleanup === "function") cleanups.push(cleanup);
          block.dataset.chartState = "ready";
        } catch (error) {
          markError(block, `${label} 渲染失败：${errorText(error)}`);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      for (const cleanup of cleanups) cleanup();
    };
  }, [html]);

  return (
    <div
      ref={hostRef}
      className={className ? `article-body ${className}` : "article-body"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
