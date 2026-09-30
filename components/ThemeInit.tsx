import { THEME_INIT_SCRIPT } from "@/lib/theme";

/**
 * 首帧主题脚本（第 6 项）
 *
 * 为什么是内联脚本而不是 useEffect：useEffect 要等 React 水合之后才跑，
 * 那之前浏览器已经用默认底色画过一帧了 —— 选了暗色的读者会看到一下白闪（FOUC）。
 * 这个脚本在 HTML 解析到它的那一行就同步执行，把 `<html data-theme>` 写好，
 * 所以它必须是 **body 的第一个子元素**（见 app/layout.tsx）。
 *
 * 脚本内容在 lib/theme.ts 的 THEME_INIT_SCRIPT 里（和 applyTheme() 一套逻辑的
 * 无依赖版本，改了那边记得一起改这里）。React 不会水合这个 <script>，
 * 它只是原样出现在 HTML 里 —— 也就意味着它不花任何运行时成本，
 * 而且没有 JS 时页面会退回 `:root` 的「纸」令牌（护眼暖白），不是白屏。
 */
export default function ThemeInit() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
