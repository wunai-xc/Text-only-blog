/**
 * components/charts/abc.ts —— 五线谱（ABC 记谱）渲染器
 *
 * abcjs 的导出在 CJS / ESM 下形状不同，这里两个都试一遍再报错。
 * responsive: "resize" 让它随容器宽度重排，手机上不用横向滚动。
 */

import type { ChartRenderer } from "@/lib/charts";

interface AbcjsApi {
  renderAbc(
    target: HTMLElement | string,
    abc: string,
    options?: Record<string, unknown>,
  ): unknown;
}

type AbcjsModule = Partial<AbcjsApi> & { default?: Partial<AbcjsApi> };

export const render: ChartRenderer = async (target, source) => {
  const module = (await import("abcjs")) as unknown as AbcjsModule;
  const abcjs = (module.renderAbc ? module : module.default) as AbcjsApi | undefined;
  if (!abcjs || typeof abcjs.renderAbc !== "function") {
    throw new Error("abcjs 的导出结构与预期不符");
  }

  const result = abcjs.renderAbc(target, source, {
    responsive: "resize",
    add_classes: true,
    staffwidth: 640,
    scale: 1.1,
  });

  if (!result || (Array.isArray(result) && result.length === 0)) {
    throw new Error("ABC 记谱没有解析出内容（检查 X: / K: 这些必需字段）");
  }
};
