/**
 * 蓝图草图背景层（第 6 项：设计系统）
 *
 * 只是一个固定在最底下的空 div —— 网格、边缘淡出、图纸边框全在
 * app/globals.css 的「蓝图草图背景层」一节里用 CSS 画（没有图片请求、没有 JS、
 * 不参与排版，所以断网 / PWA 离线时也在）。
 *
 * 约定第 5 条：装饰层必须 `aria-hidden` + `pointer-events: none`，且不影响正文可读性
 * —— 前者由这里的属性保证，后者由令牌的透明度（≤0.26）保证。
 *
 * 第 8 项（装饰与动效）要让它随路由变化时，往这个元素上挂 data-* 即可
 * （比如 `data-route={pathname}`），CSS 那边按属性换图案。
 */
export default function BlueprintBackground() {
  return <div className="blueprint" data-blueprint="sheet" aria-hidden="true" />;
}
