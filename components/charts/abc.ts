/**
 * components/charts/abc.ts —— 五线谱（ABC 记谱）渲染器
 *
 * abcjs 的导出在 CJS / ESM 下形状不同，这里两个都试一遍再报错。
 * responsive: "resize" 让它随容器宽度重排，手机上不用横向滚动。
 *
 * 配色（第 6 项留下的缺口，第 12 项补上）：五线谱是 abcjs 自己画的 SVG，谱线、符头、
 * 符干上的颜色是**写死的属性值**（黑），暗色外观下几乎看不见。abcjs 的配色入口在不同
 * 版本里换过名字（`foregroundColor` 之类），赌选项名不如直接改结果，所以：
 *   画完之后**只把「近黑」的 stroke / fill 换成当前外观的 --c-ink**，其余一律不碰 ——
 *   `fill="none"`（谱线、连音线）与作者自己指定的颜色都保持原样，因此亮色外观下画面
 *   完全不变，暗色外观下才有区别。这一条只依赖 DOM 属性，不依赖 abcjs 的选项名。
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

/**
 * 近黑判定。只认 `#rgb` / `#rrggbb` / `rgb()` / `rgba()` 四种写法，
 * 认不出来的一律当「不是黑」（`none`、`currentColor`、具名色都落到这里 —— 不碰）。
 */
function isNearBlack(value: string): boolean {
  const text = value.trim().toLowerCase();
  if (text === "" || text === "none" || text === "transparent" || text === "currentcolor") {
    return false;
  }

  let red: number;
  let green: number;
  let blue: number;

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(text);
  if (hex) {
    const digits =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((digit) => digit + digit)
            .join("")
        : hex[1];
    red = Number.parseInt(digits.slice(0, 2), 16);
    green = Number.parseInt(digits.slice(2, 4), 16);
    blue = Number.parseInt(digits.slice(4, 6), 16);
  } else {
    const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(text);
    if (!rgb) return false;
    red = Number(rgb[1]);
    green = Number(rgb[2]);
    blue = Number(rgb[3]);
  }

  if (![red, green, blue].every((channel) => Number.isFinite(channel))) return false;

  // 感知亮度（人眼对绿最敏感）：够暗才算「黑」，中灰及以上都不动
  const luma = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luma < 0.5;
}

/**
 * 把画好的 SVG 里近黑的 stroke / fill 换成当前外观的墨色。
 * 注意是**属性**替换（`setAttribute`），不是写 CSS：abcjs 用的是表现属性，
 * 而这一层在切主题时会被重新渲染一遍（ArticleBody 清空容器后重跑渲染器），
 * 所以不需要任何订阅逻辑。
 */
function recolorInk(target: HTMLElement, ink: string): void {
  for (const element of target.querySelectorAll<SVGElement>("[stroke], [fill]")) {
    for (const attribute of ["stroke", "fill"] as const) {
      const value = element.getAttribute(attribute);
      if (value !== null && isNearBlack(value)) element.setAttribute(attribute, ink);
    }
  }
}

export const render: ChartRenderer = async (target, source, context) => {
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

  // 画完了才动手：颜色跟着当前外观走（三套令牌由 ArticleBody 现读后传进来）
  recolorInk(target, context.colors.ink);
};
