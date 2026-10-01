"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

import { AMBIENT_BASE_VMAX, decorate, type AmbientBlob } from "@/lib/decor";

/**
 * 环境色层（第 8 项的扩展）：正文底下的**大色块**，每页一组，换页时**形变**成下一页的样子。
 *
 * ⚠️ 这一层**只有软边的大色块，没有任何图案 / 格子 / 线** —— 站长的要求是
 * 「不要任何格子背景，背景干净点」。想在背景上加线条或网格之前先问一声。
 * （图纸图案那一套还留在 `lib/decor.ts` 的 `DECOR_PATTERNS` 开关后面，默认关着 —— 那是另一层。）
 *
 * 为什么另起一层、而不是复用 `BlueprintBackground`：
 *   1. 蓝图那一层是「图纸图案」（1px 线，现在关着），这一层是「颜色的气氛」（大块、软边、低浓度）
 *      —— 两件事，开关与取舍都该分开；
 *   2. 层序上这一层在蓝图层**下面**（挂载顺序：AmbientBackdrop → BlueprintBackground），
 *      所以右下角那张图签、以及将来打开的网格线都还压在大色块上面。
 * 两层都是 `position: fixed; z-index: -1; pointer-events: none; aria-hidden` ——
 * 装饰层不接鼠标、不进无障碍树、不抢正文的字（约定第 5 条）。
 *
 * **形变怎么做（这一层唯一的技术点）**：
 *   - 色块**固定三块**（`lib/decor.ts` 的 `AMBIENTS` 里那三块是定长元组）：元素不增不减，
 *     换页只是把新的 `transform` / `background-color`（走 `data-tint`）/ `opacity` 交上去，
 *     过渡由 CSS 的 transition 跑完 —— 于是「大色块丝滑变成另一种大色块」；
 *   - 每块的方框尺寸**恒定**（`AMBIENT_BASE_VMAX`），远近大小全靠 `transform: scale()`：
 *     改宽高会让遮罩每帧重栅格化，手机上发涩（见 lib/decor.ts 里那个常量的注释）；
 *   - 全部在 `transform` 上完成，所以是合成器在动，不重排、不重绘正文。
 *
 * 首帧不播：首屏是一次「已经铺好的纸」，没有「换页」这回事（与 BlueprintBackground 同一条规矩）。
 * `prefers-reduced-motion: reduce` 的读者：色块直接落位，不做过渡（CSS 那边一并关掉）。
 * 打印：整层 `display: none`（见 globals.css 末尾的 `@media print`）。
 */

/**
 * 一块色块的最终形态。全部写在**行内样式**里是有意的：换页时 React 只是把新的值写上去，
 * 浏览器按 CSS 里声明的那几条 transition 跑过渡 —— 组件里没有一行动画代码。
 */
function blobStyle(blob: AmbientBlob): CSSProperties {
  const base = AMBIENT_BASE_VMAX;
  const scaleX = blob.size / base;
  const scaleY = (blob.size * (blob.stretch ?? 1)) / base;

  return {
    // 基准方框：恒定不变（见文件头），负外边距让它以「自己的中心」对齐 left/top: 0 那一点
    width: `${base}vmax`,
    height: `${base}vmax`,
    margin: `${-base / 2}vmax 0 0 ${-base / 2}vmax`,
    // 圆心落在 (x vw, y vh)，再旋转 / 双向缩放成椭圆 —— 换页时这几个数一起被插值
    transform:
      `translate(${blob.x}vw, ${blob.y}vh) rotate(${blob.rot ?? 0}deg) ` +
      `scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`,
    opacity: blob.fade ?? 1,
  };
}

export default function AmbientBackdrop() {
  const pathname = usePathname();
  const decor = decorate(pathname);
  const { blobs } = decor.ambient;

  return (
    /* data-route 只给 CSS 用（正文页整层压淡一档，见 globals.css 第 5c 节） */
    <div className="ambient" data-route={decor.section} aria-hidden="true">
      <div className="ambient-field">
        {/* 三块大色块：颜色走 data-tint（色值在三套外观的令牌里），几何走行内样式 */}
        {blobs.map((blob, index) => (
          <span
            key={index}
            className="ambient-blob"
            data-tint={blob.tint}
            style={blobStyle(blob)}
          />
        ))}
      </div>
    </div>
  );
}
