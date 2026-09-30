/**
 * components/charts/echarts.ts —— ECharts 渲染器
 *
 * 代码块里是一份 ECharts option 的 JSON（JSON 不能写注释、不能用单引号，这点要记住）。
 * 内置主题一个都不用：自己按站点令牌注册一个（见下面的 themeFromTokens），
 * 三套外观共用同一份代码 —— 换主题时 ArticleBody 会带着新令牌把图表重绘一遍。
 */

import type { ChartRenderer } from "@/lib/charts";
import type { ThemeTokens } from "@/lib/theme";

interface EchartsInstance {
  setOption(option: Record<string, unknown>, notMerge?: boolean): void;
  resize(): void;
  dispose(): void;
}

interface EchartsApi {
  init(target: HTMLElement, theme?: string, options?: Record<string, unknown>): EchartsInstance;
  registerTheme(name: string, theme: Record<string, unknown>): void;
}

/**
 * 多序列调色板：只有第一支是令牌（站点重点色），其余是固定的中性色
 * —— ECharts 需要一眼能分开的 6~8 支颜色，全从令牌里取会不够用。
 * 想全跟随主题，就把它们也做成 `--c-*` 令牌（改 app/globals.css + lib/theme.ts）。
 */
const SERIES_PALETTE = ["#7a9ec2", "#9c8ab4", "#8fb08a", "#c9a06a", "#b57f7f"];

/** 把站点令牌翻译成一份 ECharts 主题（背景透明，好让图融进 .chart-block 的面） */
function themeFromTokens(tokens: ThemeTokens): Record<string, unknown> {
  return {
    backgroundColor: "transparent",
    textStyle: { color: tokens.ink, fontFamily: "inherit" },
    color: [tokens.accent, ...SERIES_PALETTE],
    title: { textStyle: { color: tokens.ink } },
    legend: { textStyle: { color: tokens.inkMuted } },
    tooltip: {
      backgroundColor: tokens.surface,
      borderColor: tokens.rule,
      textStyle: { color: tokens.ink },
    },
    axisLine: { lineStyle: { color: tokens.ruleStrong } },
    axisTick: { lineStyle: { color: tokens.ruleStrong } },
    axisLabel: { color: tokens.inkMuted },
    splitLine: { lineStyle: { color: tokens.rule, type: "dashed" } },
  };
}

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

  echarts.registerTheme("blog", themeFromTokens(context.colors));
  if (target.clientHeight === 0) target.style.height = "320px"; // 没样式兜底时也能画出来

  const instance = echarts.init(target, "blog", { renderer: "canvas" });
  instance.setOption(option as Record<string, unknown>);
  instance.resize();

  const observer = new ResizeObserver(() => instance.resize());
  observer.observe(target);

  return () => {
    observer.disconnect();
    instance.dispose();
  };
};
