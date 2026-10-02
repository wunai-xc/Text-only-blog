"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

import {
  FIGURE_SCROLL_SHIFT_VH,
  decorCode,
  decorLabel,
  decorate,
  type Decor,
  type Figure,
} from "@/lib/decor";

/**
 * 几何实体层（第 15 项）：正文底下的**硬边几何实体**，每页一枚主实体 + 一枚小卫星，
 * 换页时**形变**（挪位 / 换形 / 换色）过去，滚动时跟着轻微上下挪一点。
 *
 * ⚠️ 两点与上一版（环境色大色块）不同，都是站长这一轮点名要的：
 *   1. **硬边**：实心填充 + 两道描边（第二道错位 1~2px），**没有模糊 / 没有遮罩**；
 *   2. **手绘草稿线**：沿实体边界画的轮廓双线 + 构造线（内联 SVG，细线、只跟着实体走）。
 * 整层仍然 `position: fixed; z-index: -1; pointer-events: none; aria-hidden` ——
 * **永不**上移，实体**永远在文字后面**（正文列不加不透明底）。没有任何指针交互。
 *
 * 形变怎么做（沿用上一版机制，元素数量恒定）：
 *   - `.figure-slot` 管**位置与尺寸**（left / top / width / height），换页时被插值；
 *   - `.figure-body` 管**朝向 / 浓度**（注解与尺寸文字也挂这一层，免得被实体的 clip-path 裁掉）；
 *   - `.figure-item` 管**形状 / 颜料**（三角形 / 十字靠 clip-path，弧靠 border-radius）；
 *   - 滚动联动只改 CSS 变量（`--scroll-shift` / `--scroll-shift-satellite`），落在 `.figure-slot`
 *     的 `translateY` 上，而那条 `transform` **没有过渡**，所以滚动是跟手的
 *     （不会被 1100ms 的形变拖住）。
 * 卫星比主实体**晚动** `--figure-delay`（160ms，见 globals.css 与 lib/decor.ts 的常量）且用一条
 * 带过冲的曲线，滚动时又走欠阻尼弹簧 —— 合起来就是 V2 说的「二阶运动」，
 * 看起来像「一个东西带着一个小东西走」。
 *
 * 手绘路径必须**确定性**：种子来自路径字符串（hash + 一个极小的 PRNG），
 * **禁止 `Math.random()` / `Date.now()`** —— 否则构建期与客户端渲染出两份不同的路径，
 * hydration 会报错。内联 SVG，不引图片、不发请求，断网与 PWA 离线照旧。
 *
 * 首帧不播：首屏是一次「已经铺好的纸」，没有「换页」这回事。
 * `prefers-reduced-motion: reduce`：不形变、不联动，实体直接落位且照样看得见。
 * 打印：整层 `display: none`（见 globals.css 末尾的 @media print）。
 */

/** 手绘抖动幅度（viewBox 单位，0~100 坐标系）；线宽另由 CSS 控制为 1px */
const JITTER = 1.2;

/** 轮廓线往内收一点，别贴死在边界上（viewBox 单位） */
const CONTOUR_INSET = 1.6;

/** 圆的采样点数：越多越圆滑，48 足够且路径字符串不至于太长 */
const CIRCLE_POINTS = 48;

/** 圆轮廓的基准半径（viewBox 单位） */
const CIRCLE_RADIUS = 47;

/** 三角形顶点（viewBox 单位）—— V2 的轮廓抖动与排线裁剪都用它 */
const TRIANGLE_CORNERS: Array<[number, number]> = [
  [50, CONTOUR_INSET],
  [100 - CONTOUR_INSET, 100 - CONTOUR_INSET],
  [CONTOUR_INSET, 100 - CONTOUR_INSET],
];

/** 十字（正号）顶点：臂宽 30%（35%~65%）。必须与 globals.css 的 clip-path 逐点一致 */
const CROSS_CORNERS: Array<[number, number]> = [
  [35, 0], [65, 0], [65, 35], [100, 35], [100, 65], [65, 65],
  [65, 100], [35, 100], [35, 65], [0, 65], [0, 35], [35, 35],
];

/** 弧（半圆穹顶）的采样点数 */
const ARC_POINTS = 36;

/** 排线（hatch）的线距（viewBox 单位） */
const HATCH_STEP = 5;

/* ---------- 确定性随机：hash + mulberry32 ---------- */

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 路径生成（都在 0~100 的 viewBox 里，preserveAspectRatio="none"） ---------- */

/** 长方形轮廓：四条边各切成几段，每一段轻微抖动，首尾闭合 */
function rectContour(rnd: () => number): string {
  const a = CONTOUR_INSET;
  const b = 100 - CONTOUR_INSET;
  const span = b - a;
  const steps = 5;
  const wobble = () => (rnd() * 2 - 1) * JITTER;
  const points: Array<[number, number]> = [];

  for (let i = 0; i <= steps; i += 1) points.push([a + (span * i) / steps, a + wobble()]);
  for (let i = 1; i <= steps; i += 1) points.push([b + wobble(), a + (span * i) / steps]);
  for (let i = 1; i <= steps; i += 1) points.push([b - (span * i) / steps, b + wobble()]);
  for (let i = 1; i < steps; i += 1) points.push([a + wobble(), b - (span * i) / steps]);

  return `M ${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`;
}

/** 圆轮廓：把圆采样成一圈点，半径轻微抖动 */
function circleContour(rnd: () => number): string {
  const points: Array<[number, number]> = [];
  for (let i = 0; i < CIRCLE_POINTS; i += 1) {
    const angle = (i / CIRCLE_POINTS) * Math.PI * 2;
    const radius = CIRCLE_RADIUS + (rnd() * 2 - 1) * JITTER * 1.4;
    points.push([50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius]);
  }
  return `M ${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`;
}

/** 折线轮廓：把给定顶点连成的多边形逐边细分、逐点抖动（三角形 / 十字用） */
function polyContour(corners: Array<[number, number]>, rnd: () => number, steps = 4): string {
  const wobble = () => (rnd() * 2 - 1) * JITTER;
  const points: Array<[number, number]> = [];
  for (let i = 0; i < corners.length; i += 1) {
    const [x0, y0] = corners[i];
    const [x1, y1] = corners[(i + 1) % corners.length];
    for (let s = 0; s < steps; s += 1) {
      const t = s / steps;
      points.push([x0 + (x1 - x0) * t + wobble(), y0 + (y1 - y0) * t + wobble()]);
    }
  }
  return `M ${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`;
}

/** 弧（半圆穹顶）轮廓：椭圆上半个圆周采样，底边自动闭合 */
function arcContour(rnd: () => number): string {
  const baseY = 100 - CONTOUR_INSET;
  const rx = 50 - CONTOUR_INSET;
  const ry = 100 - CONTOUR_INSET * 2;
  const points: Array<[number, number]> = [];
  for (let i = 0; i <= ARC_POINTS; i += 1) {
    const angle = Math.PI + (i / ARC_POINTS) * Math.PI; // 180° → 360°，即上半个椭圆
    const wobble = (rnd() * 2 - 1) * JITTER;
    points.push([50 + Math.cos(angle) * (rx + wobble), baseY + Math.sin(angle) * (ry + wobble)]);
  }
  return `M ${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`;
}

function contourFor(shape: Figure["shape"], rnd: () => number): string {
  switch (shape) {
    case "circle":
      return circleContour(rnd);
    case "triangle":
      return polyContour(TRIANGLE_CORNERS, rnd);
    case "cross":
      return polyContour(CROSS_CORNERS, rnd, 3);
    case "arc":
      return arcContour(rnd);
    default:
      return rectContour(rnd);
  }
}

/** 构造线：中心十字（density 1）+ 对角线（density 2），都带一点抖动 */
function constructionPath(figure: Figure, rnd: () => number): string {
  const wobble = () => (rnd() * 2 - 1) * JITTER;
  const lines = [
    `M 0 ${(50 + wobble()).toFixed(1)} L 100 ${(50 + wobble()).toFixed(1)}`,
    `M ${(50 + wobble()).toFixed(1)} 0 L ${(50 + wobble()).toFixed(1)} 100`,
  ];
  if (figure.sketch.density >= 2) {
    lines.push(`M ${wobble().toFixed(1)} ${wobble().toFixed(1)} L ${(100 + wobble()).toFixed(1)} ${(100 + wobble()).toFixed(1)}`);
    lines.push(`M ${(100 + wobble()).toFixed(1)} ${wobble().toFixed(1)} L ${wobble().toFixed(1)} ${(100 + wobble()).toFixed(1)}`);
  }
  return lines.join(" ");
}

/** 实体的实心轮廓（viewBox 单位）—— 与 CSS 的 border-radius / clip-path 一致，供排线裁剪用。
    排线只填在这个路径里，所以**绝不会铺到实体之外**。 */
function fillPath(shape: Figure["shape"]): string {
  switch (shape) {
    case "circle":
      return "M 0 50 A 50 50 0 1 1 100 50 A 50 50 0 1 1 0 50 Z";
    case "triangle":
      return "M 50 0 L 100 100 L 0 100 Z";
    case "cross":
      return `M ${CROSS_CORNERS.map(([x, y]) => `${x} ${y}`).join(" L ")} Z`;
    case "arc":
      return "M 0 100 A 50 100 0 0 1 100 100 Z";
    default:
      return "M 0 0 H 100 V 100 H 0 Z";
  }
}

/** 尺寸标注（V2）：实体**左侧**竖着一条尺寸线 + 两端刻度与箭头；文字由 HTML 的 `.figure-dim` 承担。
    竖放而不是横放，是因为主角（文章页那枚红长方形）比视口还高 —— 横线会落到屏幕外，
    竖线贴着它的侧边、只取中段（36%~64%），无论实体多高都留在视口里。 */
function dimensionPath(): string {
  const x = -9;
  const y0 = 36;
  const y1 = 64;
  const tick = 4;
  const arrow = 6;
  return [
    `M ${x} ${y0} L ${x} ${y1}`,
    `M ${x - tick} ${y0} L ${x + tick} ${y0}`,
    `M ${x - tick} ${y1} L ${x + tick} ${y1}`,
    `M ${x} ${y0} L ${x - 3} ${y0 + arrow}`,
    `M ${x} ${y0} L ${x + 3} ${y0 + arrow}`,
    `M ${x} ${y1} L ${x - 3} ${y1 - arrow}`,
    `M ${x} ${y1} L ${x + 3} ${y1 - arrow}`,
  ].join(" ");
}

/* ---------- 一枚实体 ---------- */

interface FigureNodeProps {
  figure: Figure;
  variant: "main" | "satellite";
  /** 路径字符串，用来给手绘线播种（同一页每次渲染都一样） */
  seedKey: string;
  code: string;
  label: string;
}

function FigureNode({ figure, variant, seedKey, code, label }: FigureNodeProps) {
  const seed = hashString(`${seedKey}|${variant}`);
  const outlineA = contourFor(figure.shape, mulberry32(seed));
  const outlineB = contourFor(figure.shape, mulberry32(seed ^ 0x9e3779b9));
  const construction = figure.sketch.construction
    ? constructionPath(figure, mulberry32(seed ^ 0x85ebca6b))
    : "";
  /* 排线（V2）：45° 细线只铺在实体的实心轮廓里。pattern 的 id 由种子推出来
     （确定性、同一页每次推导都一样，也就不会和另一枚实体的 id 撞车）。 */
  const hatchId = `figure-hatch-${seed.toString(36)}`;

  // 位置 / 尺寸走 CSS，换页时被 transition 插值；圆心靠 translate(-50%, -50%) 对齐
  const slotStyle: CSSProperties = {
    left: `${figure.x}vw`,
    top: `${figure.y}vh`,
    width: `${figure.w}vmax`,
    height: `${figure.h}vmax`,
  };
  // 朝向 / 浓度走行内样式（`.figure-body` 的形变，与位置分开）
  const bodyStyle: CSSProperties = {
    transform: `rotate(${figure.rot}deg)`,
    opacity: figure.fade ?? 1,
  };

  return (
    <div className="figure-slot" data-variant={variant} style={slotStyle}>
      {/* body 只负责朝向 / 浓度。注解与尺寸文字挂在这一层 —— 实体被 clip-path
          裁成三角形 / 十字时，它们才不会被一起裁掉。 */}
      <div className="figure-body" style={bodyStyle}>
        <div className="figure-item" data-shape={figure.shape} data-tint={figure.tint}>
          {/* 手绘草稿线：排线 + 轮廓双线 + 构造线 + 尺寸线。内联、确定性，不引图片 */}
          <svg
            className="figure-sketch"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            {figure.sketch.hatch ? (
              <>
                <defs>
                  <pattern
                    id={hatchId}
                    width={HATCH_STEP}
                    height={HATCH_STEP}
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <line
                      className="figure-hatch-line"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2={HATCH_STEP}
                      vectorEffect="non-scaling-stroke"
                    />
                  </pattern>
                </defs>
                <path className="figure-hatch" d={fillPath(figure.shape)} fill={`url(#${hatchId})`} />
              </>
            ) : null}
            {figure.sketch.contour ? (
              <path className="figure-outline" d={outlineA} vectorEffect="non-scaling-stroke" />
            ) : null}
            {figure.sketch.contour ? (
              <path
                className="figure-outline figure-outline-soft"
                d={outlineB}
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            {construction ? (
              <path
                className="figure-construct"
                d={construction}
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            {figure.sketch.dimension ? (
              <path
                className="figure-dim-line"
                d={dimensionPath()}
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>
        </div>
        {/* 实体注解（答复 7）：原来的右下角图签合并到这里，跟着实体一起挪 */}
        <span className="figure-note" data-note={figure.note}>
          <span className="figure-note-code">{code}</span>
          <span className="figure-note-name">{label}</span>
        </span>
        {/* 尺寸标注的文字（V2）：与 SVG 里那条尺寸线配成一组 */}
        {figure.sketch.dimension ? (
          <span className="figure-dim">
            {figure.w} × {figure.h}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- 整层 ---------- */

function FigureNodeFor({
  figure,
  variant,
  decor,
  pathname,
}: {
  figure: Figure;
  variant: "main" | "satellite";
  decor: Decor;
  pathname: string;
}) {
  return (
    <FigureNode
      figure={figure}
      variant={variant}
      seedKey={pathname}
      code={decorCode(decor)}
      label={decorLabel(decor.section, decor.lang)}
    />
  );
}

export default function FigureLayer() {
  const pathname = usePathname();
  const decor = decorate(pathname);
  const layerRef = useRef<HTMLDivElement | null>(null);

  /**
   * 滚动联动：只**读**滚动，绝不改滚动位置（没有 scroll-jacking、不动 scroll-snap）。
   * 一次 `scroll`（passive）+ rAF 节流，往整层写两个 CSS 变量，实体的 `translateY` 用 `var()` 读：
   *   - `--scroll-shift`：主实体的位移，**跟手**（每帧直接写）；
   *   - `--scroll-shift-satellite`：卫星的位移，用**欠阻尼弹簧（二阶）**跟随主实体 ——
   *     晚一拍、并轻微过冲，看着像被主实体「拖」着走（V2 的二阶运动）。
   * 位移上限 ±FIGURE_SCROLL_SHIFT_VH（8vh）—— 实体任何时刻都要有一大半留在视口里
   * （「我一眼能看得到」是硬要求）。
   * 变量没写 / 无 JS / reduced-motion：实体停在基准位置，照样看得见。
   */
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let targetShift = 0; // 主实体的位移（跟手）
    let satShift = 0; // 卫星当前位移 —— 弹簧的状态量之一
    let satVel = 0; // 卫星速度 —— 弹簧的另一个状态量

    const readTarget = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0.5;
      return (progress - 0.5) * 2 * FIGURE_SCROLL_SHIFT_VH;
    };

    const apply = () => {
      layer.style.setProperty("--scroll-shift", `${targetShift.toFixed(2)}vh`);
      layer.style.setProperty("--scroll-shift-satellite", `${satShift.toFixed(2)}vh`);
    };

    /** 二阶（欠阻尼弹簧）跟随：卫星晚主实体一拍，且会轻微过冲 */
    const step = () => {
      raf = 0;
      satVel += (targetShift - satShift) * 0.09;
      satVel *= 0.78;
      satShift += satVel;
      apply();
      const settled = Math.abs(targetShift - satShift) < 0.02 && Math.abs(satVel) < 0.02;
      if (!settled) raf = window.requestAnimationFrame(step);
    };

    const onScroll = () => {
      targetShift = readTarget();
      if (!raf) raf = window.requestAnimationFrame(step);
    };

    // 首帧：两枚都落在基准位置（不播动画）
    targetShift = readTarget();
    satShift = targetShift;
    apply();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    /* data-route 只给 CSS 用（这一页是哪一张图纸） */
    <div className="figure" data-route={decor.section} aria-hidden="true" ref={layerRef}>
      <div className="figure-field">
        <FigureNodeFor figure={decor.figure.main} variant="main" decor={decor} pathname={pathname} />
        <FigureNodeFor
          figure={decor.figure.satellite}
          variant="satellite"
          decor={decor}
          pathname={pathname}
        />
      </div>
    </div>
  );
}
