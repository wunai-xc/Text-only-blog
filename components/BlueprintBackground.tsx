"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { decorCode, decorLabel, decorate } from "@/lib/decor";

/**
 * 蓝图草图背景层（第 6 项建立，第 8 项接上路由）
 *
 * 图案、边缘淡出、虚线图框全在 app/globals.css 的第 5 节用 CSS 画 —— 没有图片请求、
 * 没有 JS 计算 —— 所以断网 / PWA 离线时装饰也在。这个组件只负责两件事：
 *
 *   1. **把当前路径翻译成 data-* 钩子**：`data-decor`（图案名）与 `data-route`（哪一张图纸），
 *      翻译规则在 lib/decor.ts（唯一事实来源）。CSS 按 `data-decor` 换图案、
 *      按 `data-route` 微调边缘淡出（目前只有文章页那一处），
 *      于是每次跳转纸面都会换一张（首页整幅图纸 → 列表分栏线 → 文章刻度尺 → 分类剖面线…）。
 *   2. **换页时让纸面重铺一次**：`data-redraw="true"` 挂上 0.32s 的淡入，
 *      宁可只有这一点动效，也不做转场动画（那不是阅读站该抢的注意力）。
 *
 * 为什么是客户端组件：静态导出下服务端不知道当前路径，只有 `usePathname()` 知道。
 * 它读的是 App Router 的 pathname（构建期渲染该页时就是那一页的路径），
 * 所以首屏 HTML 里就已经是这一页的图案，不会先画一张再换一张。
 *
 * 约定第 5 条：整层 `aria-hidden` + `pointer-events: none`，线宽 1px、透明度 ≤ 0.26
 * —— 装饰层只做气质，不接鼠标、不进无障碍树、不抢正文的字。
 * z-index 仍然是 -1（夹在 <html> 的底色与内容之间）：**不要**把它往上层挪，
 * 顶栏是 20、设置齿轮 40、遮罩 45、抽屉 50（见 PROJECTS.md 第 4 节第 7 项的层清单）。
 *
 * 右下角那张图签（编号 + 图纸名 + 当前路径所属页）也画在这一层里 —— 放进装饰层
 * 就不会挡住正文与页脚（它跟着 -1 一起在内容下面，只是角落通常没有内容）。
 */

/** 与 globals.css 里 blueprint-redraw 的 0.32s 对齐，留一点余量再摘掉属性 */
const REDRAW_MS = 360;

export default function BlueprintBackground() {
  const pathname = usePathname();
  const decor = decorate(pathname);

  const [redraw, setRedraw] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    // 首帧不播：首屏是一次「已经铺好的图纸」，没有「换页」这回事
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setRedraw(true);
    const timer = window.setTimeout(() => setRedraw(false), REDRAW_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className="blueprint"
      data-route={decor.section}
      data-decor={decor.pattern}
      data-redraw={redraw ? "true" : undefined}
      aria-hidden="true"
    >
      <div className="blueprint-tag">
        <span className="blueprint-tag-code">{decorCode(decor)}</span>
        <span className="blueprint-tag-name">{decorLabel(decor.section, decor.lang)}</span>
      </div>
    </div>
  );
}
