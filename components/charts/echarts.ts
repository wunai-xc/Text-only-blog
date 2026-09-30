/**
 * components/charts/echarts.ts —— ECharts 渲染器
 *
 * 代码块里是一份 ECharts option 的 JSON（JSON 不能写注释、不能用单引号，这点要记住）。
 * 暗色下注册一个自定义主题，不去 import "echarts/theme/dark"：
 * 那个路径没有类型声明，将来 echarts 加了 types 反而会让构建报错。
 * 配色是占位值，第 6 项的令牌体系落地后换成站点色。
 */

import type { ChartRenderer } from "@/lib/charts";

interface EchartsInstance {
  setOption(option: Record<string, unknown>, notMerge?: boolean): void;
  resize(): void;
  dispose(): void;
}

interface EchartsApi {
  init(target: HTMLElement, theme?: string, options?: Record<string, unknown>): EchartsInstance;
  registerTheme(name: string, theme: Record<string, unknown>): void;
}

const DARK_THEME: Record<string, unknown> = {
  backgroundColor: "transparent",
  textStyle: { color: "#d8d4c8" },
  color: ["#82aaff", "#c792ea", "#7fdbca", "#ffcb6b", "#f78c6c", "#89ddff"],
  axisLine: { lineStyle: { color: "#5b616b" } },
  splitLine: { lineStyle: { color: "#3a4046" } },
};

export const render: ChartRenderer = async (target, source, context) => {
  const echarts = (await import("echarts")) as unknown as EchartsApi;
  if (typeof echarts.init !== "function") throw new Error("echarts 的导出结构与预期不符");

  let option: unknown;
  try {
    option = JSON.parse(source);
  } catch (error) {
    throw new Error(
      `代码块不是合法的 JSON：${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (option === null || typeof option !== "object" || Array.isArray(option)) {
    throw new Error('ECharts 代码块需要一份 option 对象，形如 { "xAxis": …, "series": […] }');
  }

  if (context.dark) echarts.registerTheme("blog-dark", DARK_THEME);
  if (target.clientHeight === 0) target.style.height = "320px"; // 没样式兜底时也能画出来

  const instance = echarts.init(target, context.dark ? "blog-dark" : undefined, {
    renderer: "canvas",
  });
  instance.setOption(option as Record<string, unknown>);
  instance.resize();

  const observer = new ResizeObserver(() => instance.resize());
  observer.observe(target);

  return () => {
    observer.disconnect();
    instance.dispose();
  };
};
