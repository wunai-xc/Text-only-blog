import { READING_INIT_SCRIPT } from "@/lib/prefs";

/**
 * 首帧阅读偏好脚本（第 7 项）
 *
 * 与 components/ThemeInit.tsx 同一套路：内联脚本、在 HTML 解析到它那一行同步执行，
 * 必须紧跟在主题脚本之后（见 app/layout.tsx）。
 *
 * 为什么不是 useEffect：存了「窄 + 大字号 + 宽松」的读者，如果等 React 水合后才应用设置，
 * 会先看到一帧默认版面的文字再跳成他的设置 —— 那种重排比闪白更晃眼。
 *
 * 脚本内容在 lib/prefs.ts 的 READING_INIT_SCRIPT 里（由选项表生成，不手抄第二份）。
 */
export default function PrefsInit() {
  return <script dangerouslySetInnerHTML={{ __html: READING_INIT_SCRIPT }} />;
}
