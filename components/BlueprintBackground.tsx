"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { decorCode, decorLabel, decorate } from "@/lib/decor";

/**
 * 蓝图草图背景层（第 6 项建立，第 8 项接上路由）
 *
 * ⚠️ **背景现在是纯色**：`lib/decor.ts` 的 `DECOR_PATTERNS = false`，所以 data-decor 永远是
 * `plain`，这一层不画网格 / 不画图框（CSS 第 5 节那套图案一行没删，开关改回 `true` 就恢复）。
 * 它现在实际负责两件事：
 *
 *   1. **右下角那张图签**（编号 `TOB-ZH-01` + 这一页的名字）：仍然随路径变，
 *      映射在 lib/decor.ts（唯一事实来源），所以「哪个页面印哪张图纸」这件事没丢；
 *   2. **换页时让这一层淡一下**（`data-redraw`，0.32s）—— 图案没了之后，看得见的效果只有
 *      图签淡入那一下，不做转场动画（那不是阅读站该抢的注意力）。
 *
 * 图案本身（如果哪天把开关打开）画在 `app/globals.css` 的第 5 节：没有图片请求、没有 JS 计算，
 * 所以断网 / PWA 离线时装饰也在；`data-route` 只用来微调边缘淡出（目前只有文章页那一处）。
 * 为什么是客户端组件：静态导出下服务端不知道当前路径，只有 `usePathname()` 知道 ——
 * 它读的是 App Router 的 pathname（构建期渲染该页时就是那一页的路径），首屏 HTML 就已确定。
 *
 * 约定第 5 条：整层 `aria-hidden` + `pointer-events: none` —— 装饰层不接鼠标、不进无障碍树、
 * 不抢正文的字。z-index 仍然是 -1（夹在 <html> 的底色与内容之间）：**不要**把它往上层挪，
 * 顶栏是 20、设置齿轮 40、遮罩 45、抽屉 50（见 PROJECTS.md 第 4 节第 7 项的层清单）。
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
