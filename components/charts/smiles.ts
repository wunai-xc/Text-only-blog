/**
 * components/charts/smiles.ts —— 化学结构式（SmilesDrawer）渲染器
 *
 * 只取代码块的第一行非空内容当 SMILES（多写几行时后面的当作备注忽略）。
 * 画到 <canvas> 上：按 devicePixelRatio 放大分辨率，再交给 CSS 缩回去，避免糊。
 * SmilesDrawer 的 draw 需要 canvas 的像素尺寸，所以宽高都按放大后的值给。
 */

import type { ChartRenderer } from "@/lib/charts";

interface DrawerOptions {
  width: number;
  height: number;
  padding?: number;
  bondThickness?: number;
  compactDrawing?: boolean;
  terminalCarbons?: boolean;
}

interface DrawerInstance {
  draw(tree: unknown, target: HTMLCanvasElement, theme?: string, hoverable?: boolean): void;
}

interface SmilesDrawerApi {
  parse(smiles: string, done: (tree: unknown) => void, fail?: (error: unknown) => void): void;
  Drawer: new (options: DrawerOptions) => DrawerInstance;
}

type SmilesModule = Partial<SmilesDrawerApi> & { default?: Partial<SmilesDrawerApi> };

const BASE_SIZE = 320;

export const render: ChartRenderer = async (target, source, context) => {
  const module = (await import("smiles-drawer")) as unknown as SmilesModule;
  const api = (module.parse ? module : module.default) as SmilesDrawerApi | undefined;
  if (!api || typeof api.parse !== "function" || typeof api.Drawer !== "function") {
    throw new Error("smiles-drawer 的导出结构与预期不符");
  }

  const smiles = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line !== "" && !line.startsWith("#"));
  if (!smiles) throw new Error("代码块里没有 SMILES 表达式");

  const tree = await new Promise<unknown>((resolve, reject) => {
    api.parse(
      smiles,
      (parsed) => resolve(parsed),
      (error) =>
        reject(
          new Error(
            `SMILES 解析失败：${typeof error === "string" ? error : smiles}`,
          ),
        ),
    );
  });

  const ratio = Math.min(2, typeof window === "undefined" ? 1 : window.devicePixelRatio || 1);
  const size = BASE_SIZE * ratio;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas.style.width = "100%";
  canvas.style.maxWidth = `${BASE_SIZE}px`;
  canvas.style.height = "auto";

  const theme = context.dark ? "dark" : "light";
  const drawer = new api.Drawer({
    width: size,
    height: size,
    padding: 12 * ratio,
    bondThickness: 1.4,
    compactDrawing: false,
  });
  drawer.draw(tree, canvas, theme, false);

  target.replaceChildren(canvas);
};
