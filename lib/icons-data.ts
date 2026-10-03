/**
 * lib/icons-data.ts —— 站点用到的 MDI 图标数据（第 7 项：框架 UI）
 *
 * ⚠️ 由脚本从 `@iconify/icons-mdi@1.2.48` 导出生成的内联副本，**不要手改**：
 * 只包含 lib/icons.ts 实际用到的 49 个图标，图标清单以 lib/icons.ts 为准。
 *
 * 为什么内联、而不是继续依赖 `@iconify/icons-mdi`：
 * 那个包整包 110MB / 27742 个文件，而 CI（Cloudflare Workers Builds）每次构建都要
 * 完整跑一遍 `npm ci` —— 光这一个包就要写入两万多个文件，是构建慢的主因之一。
 * 这里只保留用到的图标数据（约几十 KB），安装量与依赖都显著变小。
 *
 * 类型与 types/iconify.d.ts 里那份结构声明一致（@iconify/react 的 Icon 直接收这个形状）。
 */

/** 单个图标数据（Iconify 的 IconifyIcon 结构的本地等价声明） */
export interface IconData {
  body: string;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  rotate?: number;
  hFlip?: boolean;
  vFlip?: boolean;
  hidden?: boolean;
}

/** mdi:home-outline */
export const mdiHomeOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"m12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3\"/>"};
/** mdi:post-outline */
export const mdiPostOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M19 5v14H5V5h14m2-2H3v18h18V3m-4 14H7v-1h10v1m0-2H7v-1h10v1m0-3H7V7h10v5Z\"/>"};
/** mdi:tag-multiple-outline */
export const mdiTagMultipleOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M6.5 10C7.3 10 8 9.3 8 8.5S7.3 7 6.5 7S5 7.7 5 8.5S5.7 10 6.5 10M9 6l7 7l-5 5l-7-7V6h5m0-2H4c-1.1 0-2 .9-2 2v5c0 .6.2 1.1.6 1.4l7 7c.3.4.8.6 1.4.6s1.1-.2 1.4-.6l5-5c.4-.4.6-.9.6-1.4c0-.6-.2-1.1-.6-1.4l-7-7C10.1 4.2 9.6 4 9 4m4.5 1.7l1-1l6.9 6.9c.4.4.6.9.6 1.4s-.2 1.1-.6 1.4L16 19.8l-1-1l5.7-5.8l-7.2-7.3Z\"/>"};
/** mdi:shape-outline */
export const mdiShapeOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M11 13.5v8H3v-8h8m-2 2H5v4h4v-4M12 2l5.5 9h-11L12 2m0 3.86L10.08 9h3.84L12 5.86M17.5 13c2.5 0 4.5 2 4.5 4.5S20 22 17.5 22S13 20 13 17.5s2-4.5 4.5-4.5m0 2a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5Z\"/>"};
/** mdi:archive-outline */
export const mdiArchiveOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M20 21H4V10h2v9h12v-9h2v11M3 3h18v6H3V3m6.5 8h5c.28 0 .5.22.5.5V13H9v-1.5c0-.28.22-.5.5-.5M5 5v2h14V5H5Z\"/>"};
/** mdi:magnify */
export const mdiMagnify: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5Z\"/>"};
/** mdi:account-multiple-outline */
export const mdiAccountMultipleOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M13.07 10.41a5 5 0 0 0 0-5.82A3.39 3.39 0 0 1 15 4a3.5 3.5 0 0 1 0 7a3.39 3.39 0 0 1-1.93-.59M5.5 7.5A3.5 3.5 0 1 1 9 11a3.5 3.5 0 0 1-3.5-3.5m2 0A1.5 1.5 0 1 0 9 6a1.5 1.5 0 0 0-1.5 1.5M16 17v2H2v-2s0-4 7-4s7 4 7 4m-2 0c-.14-.78-1.33-2-5-2s-4.93 1.31-5 2m11.95-4A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4Z\"/>"};
/** mdi:account-outline */
export const mdiAccountOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1Z\"/>"};
/** mdi:theme-light-dark */
export const mdiThemeLightDark: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M7.5 2c-1.79 1.15-3 3.18-3 5.5s1.21 4.35 3.03 5.5C4.46 13 2 10.54 2 7.5A5.5 5.5 0 0 1 7.5 2m11.57 1.5l1.43 1.43L4.93 20.5L3.5 19.07L19.07 3.5m-6.18 2.43L11.41 5L9.97 6l.42-1.7L9 3.24l1.75-.12l.58-1.65L12 3.1l1.73.03l-1.35 1.13l.51 1.67m-3.3 3.61l-1.16-.73l-1.12.78l.34-1.32l-1.09-.83l1.36-.09l.45-1.29l.51 1.27l1.36.03l-1.05.87l.4 1.31M19 13.5a5.5 5.5 0 0 1-5.5 5.5c-1.22 0-2.35-.4-3.26-1.07l7.69-7.69c.67.91 1.07 2.04 1.07 3.26m-4.4 6.58l2.77-1.15l-.24 3.35l-2.53-2.2m4.33-2.7l1.15-2.77l2.2 2.54l-3.35.23m1.15-4.96l-1.14-2.78l3.34.24l-2.2 2.54M9.63 18.93l2.77 1.15l-2.53 2.19l-.24-3.34Z\"/>"};
/** mdi:book-open-outline */
export const mdiBookOpenOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M21 4H3a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2M3 19V6h8v13H3m18 0h-8V6h8v13m-7-9.5h6V11h-6V9.5m0 2.5h6v1.5h-6V12m0 2.5h6V16h-6v-1.5Z\"/>"};
/** mdi:weather-sunny */
export const mdiWeatherSunny: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0-7l2.39 3.42C13.65 5.15 12.84 5 12 5c-.84 0-1.65.15-2.39.42L12 2M3.34 7l4.16-.35A7.2 7.2 0 0 0 5.94 8.5c-.44.74-.69 1.5-.83 2.29L3.34 7m.02 10l1.76-3.77a7.131 7.131 0 0 0 2.38 4.14L3.36 17M20.65 7l-1.77 3.79a7.023 7.023 0 0 0-2.38-4.15l4.15.36m-.01 10l-4.14.36c.59-.51 1.12-1.14 1.54-1.86c.42-.73.69-1.5.83-2.29L20.64 17M12 22l-2.41-3.44c.74.27 1.55.44 2.41.44c.82 0 1.63-.17 2.37-.44L12 22Z\"/>"};
/** mdi:weather-night */
export const mdiWeatherNight: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"m17.75 4.09l-2.53 1.94l.91 3.06l-2.63-1.81l-2.63 1.81l.91-3.06l-2.53-1.94L12.44 4l1.06-3l1.06 3l3.19.09m3.5 6.91l-1.64 1.25l.59 1.98l-1.7-1.17l-1.7 1.17l.59-1.98L15.75 11l2.06-.05L18.5 9l.69 1.95l2.06.05m-2.28 4.95c.83-.08 1.72 1.1 1.19 1.85c-.32.45-.66.87-1.08 1.27C15.17 23 8.84 23 4.94 19.07c-3.91-3.9-3.91-10.24 0-14.14c.4-.4.82-.76 1.27-1.08c.75-.53 1.93.36 1.85 1.19c-.27 2.86.69 5.83 2.89 8.02a9.96 9.96 0 0 0 8.02 2.89m-1.64 2.02a12.08 12.08 0 0 1-7.8-3.47c-2.17-2.19-3.33-5-3.49-7.82c-2.81 3.14-2.7 7.96.31 10.98c3.02 3.01 7.84 3.12 10.98.31Z\"/>"};
/** mdi:cog-outline */
export const mdiCogOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M12 8a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m-2 12c-.25 0-.46-.18-.5-.42l-.37-2.65c-.63-.25-1.17-.59-1.69-.99l-2.49 1.01c-.22.08-.49 0-.61-.22l-2-3.46a.493.493 0 0 1 .12-.64l2.11-1.66L4.5 12l.07-1l-2.11-1.63a.493.493 0 0 1-.12-.64l2-3.46c.12-.22.39-.31.61-.22l2.49 1c.52-.39 1.06-.73 1.69-.98l.37-2.65c.04-.24.25-.42.5-.42h4c.25 0 .46.18.5.42l.37 2.65c.63.25 1.17.59 1.69.98l2.49-1c.22-.09.49 0 .61.22l2 3.46c.13.22.07.49-.12.64L19.43 11l.07 1l-.07 1l2.11 1.63c.19.15.25.42.12.64l-2 3.46c-.12.22-.39.31-.61.22l-2.49-1c-.52.39-1.06.73-1.69.98l-.37 2.65c-.04.24-.25.42-.5.42h-4m1.25-18l-.37 2.61c-1.2.25-2.26.89-3.03 1.78L5.44 7.35l-.75 1.3L6.8 10.2a5.55 5.55 0 0 0 0 3.6l-2.12 1.56l.75 1.3l2.43-1.04c.77.88 1.82 1.52 3.01 1.76l.37 2.62h1.52l.37-2.61c1.19-.25 2.24-.89 3.01-1.77l2.43 1.04l.75-1.3l-2.12-1.55c.4-1.17.4-2.44 0-3.61l2.11-1.55l-.75-1.3l-2.41 1.04a5.42 5.42 0 0 0-3.03-1.77L12.75 4h-1.5Z\"/>"};
/** mdi:palette-outline */
export const mdiPaletteOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M12 22A10 10 0 0 1 2 12A10 10 0 0 1 12 2c5.5 0 10 4 10 9a6 6 0 0 1-6 6h-1.8c-.3 0-.5.2-.5.5c0 .1.1.2.1.3c.4.5.6 1.1.6 1.7c.1 1.4-1 2.5-2.4 2.5m0-18a8 8 0 0 0-8 8a8 8 0 0 0 8 8c.3 0 .5-.2.5-.5c0-.2-.1-.3-.1-.4c-.4-.5-.6-1-.6-1.6c0-1.4 1.1-2.5 2.5-2.5H16a4 4 0 0 0 4-4c0-3.9-3.6-7-8-7m-5.5 6c.8 0 1.5.7 1.5 1.5S7.3 13 6.5 13S5 12.3 5 11.5S5.7 10 6.5 10m3-4c.8 0 1.5.7 1.5 1.5S10.3 9 9.5 9S8 8.3 8 7.5S8.7 6 9.5 6m5 0c.8 0 1.5.7 1.5 1.5S15.3 9 14.5 9S13 8.3 13 7.5S13.7 6 14.5 6m3 4c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5Z\"/>"};
/** mdi:format-font */
export const mdiFormatFont: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M17 8h3v12h1v1h-4v-1h1v-3h-4l-1.5 3H14v1h-4v-1h1l6-12m1 1l-3.5 7H18V9M5 3h5c1.11 0 2 .89 2 2v11H9v-5H6v5H3V5c0-1.11.89-2 2-2m1 2v4h3V5H6Z\"/>"};
/** mdi:format-size */
export const mdiFormatSize: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M2 4v3h5v12h3V7h5V4H2m19 5h-9v3h3v7h3v-7h3V9Z\"/>"};
/** mdi:arrow-expand-horizontal */
export const mdiArrowExpandHorizontal: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M9 11h6V8l4 4l-4 4v-3H9v3l-4-4l4-4v3m-7 9V4h2v16H2m18 0V4h2v16h-2Z\"/>"};
/** mdi:format-line-spacing */
export const mdiFormatLineSpacing: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M10 13h12v-2H10m0 8h12v-2H10m0-10h12V5H10M6 7h2.5L5 3.5L1.5 7H4v10H1.5L5 20.5L8.5 17H6V7Z\"/>"};
/** mdi:format-indent-increase */
export const mdiFormatIndentIncrease: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M11 13h10v-2H11m0-2h10V7H11M3 3v2h18V3M11 17h10v-2H11M3 8v8l4-4m-4 9h18v-2H3v2Z\"/>"};
/** mdi:translate */
export const mdiTranslate: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"m12.87 15.07l-2.54-2.51l.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5l3.11 3.11l.76-2.04M18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12m-2.62 7l1.62-4.33L19.12 17h-3.24Z\"/>"};
/** mdi:check */
export const mdiCheck: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59L21 7Z\"/>"};
/** mdi:restore */
export const mdiRestore: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M13 3a9 9 0 0 0-9 9H1l3.89 3.89l.07.14L9 12H6a7 7 0 0 1 7-7a7 7 0 0 1 7 7a7 7 0 0 1-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.896 8.896 0 0 0 13 21a9 9 0 0 0 9-9a9 9 0 0 0-9-9Z\"/>"};
/** mdi:close */
export const mdiClose: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z\"/>"};
/** mdi:upload */
export const mdiUpload: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M9 16v-6H5l7-7l7 7h-4v6H9m-4 4v-2h14v2H5Z\"/>"};
/** mdi:delete-outline */
export const mdiDeleteOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12M8 9h8v10H8V9m7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5Z\"/>"};
/** mdi:email-outline */
export const mdiEmailOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6m-2 0l-8 5l-8-5h16m0 12H4V8l8 5l8-5v10Z\"/>"};
/** mdi:github */
export const mdiGithub: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z\"/>"};
/** mdi:source-repository */
export const mdiSourceRepository: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m6.75 11.5c2.75 0 3.49-2.03 3.68-3.1c.91-.29 1.57-1.14 1.57-2.15C18 7 17 6 15.75 6S13.5 7 13.5 8.25c0 .94.57 1.75 1.39 2.08C14.67 11 14 12 12 12c-1.38 0-2.34.35-3 .84V8.87c.87-.31 1.5-1.14 1.5-2.12c0-1.25-1-2.25-2.25-2.25S6 5.5 6 6.75c0 .98.63 1.81 1.5 2.12v6.26c-.87.31-1.5 1.14-1.5 2.12c0 1.25 1 2.25 2.25 2.25s2.25-1 2.25-2.25c0-.93-.56-1.75-1.37-2.07c.28-.68 1.1-1.68 3.62-1.68m-4.5 3a.75.75 0 0 1 .75.75a.75.75 0 0 1-.75.75a.75.75 0 0 1-.75-.75a.75.75 0 0 1 .75-.75m0-10.5a.75.75 0 0 1 .75.75a.75.75 0 0 1-.75.75a.75.75 0 0 1-.75-.75a.75.75 0 0 1 .75-.75m7.5 1.5a.75.75 0 0 1 .75.75a.75.75 0 0 1-.75.75a.75.75 0 0 1-.75-.75a.75.75 0 0 1 .75-.75Z\"/>"};
/** mdi:rss */
export const mdiRss: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z\"/>"};
/** mdi:filter-outline */
export const mdiFilterOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M15 19.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L9.29 16.7a.989.989 0 0 1-.29-.83v-5.12L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L15 10.75v9.13M7.04 5L11 10.06v5.52l2 2v-7.53L16.96 5H7.04Z\"/>"};
/** mdi:filter-variant-remove */
export const mdiFilterVariantRemove: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M21 8H3V6h18v2m-7.19 8H10v2h3.09c.12-.72.37-1.39.72-2M18 11H6v2h12v-2m3.12 4.46L19 17.59l-2.12-2.13l-1.41 1.42L17.59 19l-2.12 2.12l1.41 1.42L19 20.41l2.12 2.13l1.42-1.42L20.41 19l2.13-2.12l-1.42-1.42Z\"/>"};
/** mdi:calendar-outline */
export const mdiCalendarOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M12 12h5v5h-5v-5m7-9h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 2v2H5V5h14M5 19V9h14v10H5Z\"/>"};
/** mdi:sort-calendar-descending */
export const mdiSortCalendarDescending: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M19 7h-3l4-4l4 4h-3v14h-2V7M8 16h3v-3H8v3m5-11h-1V3h-2v2H6V3H4v2H3c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h10c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2M3 18v-7h10v7H3Z\"/>"};
/** mdi:sort-calendar-ascending */
export const mdiSortCalendarAscending: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M21 17h3l-4 4l-4-4h3V3h2v14M8 16h3v-3H8v3m5-11h-1V3h-2v2H6V3H4v2H3c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h10c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2M3 18v-7h10v7H3Z\"/>"};
/** mdi:view-compact-outline */
export const mdiViewCompactOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M3 5v14h19V5H3m2 2h15v4H5V7m0 10v-4h4v4H5m6 0v-4h9v4h-9Z\"/>"};
/** mdi:view-agenda-outline */
export const mdiViewAgendaOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M21 13H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1m-1 6H4v-4h16m1-12H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1m-1 6H4V5h16Z\"/>"};
/** mdi:text-box-outline */
export const mdiTextBoxOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M5 3c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2H5m0 2h14v14H5V5m2 2v2h10V7H7m0 4v2h10v-2H7m0 4v2h7v-2H7Z\"/>"};
/** mdi:robot-outline */
export const mdiRobotOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M17.5 15.5c0 1.11-.89 2-2 2s-2-.89-2-2s.9-2 2-2s2 .9 2 2m-9-2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.89 2-2s-.89-2-2-2M23 15v3c0 .55-.45 1-1 1h-1v1c0 1.11-.89 2-2 2H5a2 2 0 0 1-2-2v-1H2c-.55 0-1-.45-1-1v-3c0-.55.45-1 1-1h1c0-3.87 3.13-7 7-7h1V5.73c-.6-.34-1-.99-1-1.73c0-1.1.9-2 2-2s2 .9 2 2c0 .74-.4 1.39-1 1.73V7h1c3.87 0 7 3.13 7 7h1c.55 0 1 .45 1 1m-2 1h-2v-2c0-2.76-2.24-5-5-5h-4c-2.76 0-5 2.24-5 5v2H3v1h2v3h14v-3h2v-1Z\"/>"};
/** mdi:magnify-close */
export const mdiMagnifyClose: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M9 2a7 7 0 0 1 7 7c0 1.5-.5 3-1.39 4.19l.8.81H16l6 6l-2 2l-6-6v-.59l-.81-.8A7.07 7.07 0 0 1 9 16a7 7 0 0 1-7-7a7 7 0 0 1 7-7m2.12 3.46L9 7.59L6.88 5.46L5.46 6.88L7.59 9l-2.13 2.12l1.42 1.42L9 10.41l2.12 2.13l1.42-1.42L10.41 9l2.13-2.12l-1.42-1.42Z\"/>"};
/** mdi:alert-circle-outline */
export const mdiAlertCircleOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M11 15h2v2h-2v-2m0-8h2v6h-2V7m1-5C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8Z\"/>"};
/** mdi:folder-outline */
export const mdiFolderOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M20 18H4V8h16m0-2h-8l-2-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z\"/>"};
/** mdi:chevron-down */
export const mdiChevronDown: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6l1.41-1.42Z\"/>"};
/** mdi:format-list-bulleted */
export const mdiFormatListBulleted: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M7 5h14v2H7V5m0 8v-2h14v2H7M4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2H7m-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5Z\"/>"};
/** mdi:arrow-up */
export const mdiArrowUp: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M13 20h-2V8l-5.5 5.5l-1.42-1.42L12 4.16l7.92 7.92l-1.42 1.42L13 8v12Z\"/>"};
/** mdi:arrow-left */
export const mdiArrowLeft: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11h12Z\"/>"};
/** mdi:arrow-right */
export const mdiArrowRight: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M4 11v2h12l-5.5 5.5l1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5L16 11H4Z\"/>"};
/** mdi:comment-text-outline */
export const mdiCommentTextOutline: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M9 22a1 1 0 0 1-1-1v-3H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29H9m1-6v3.08L13.08 16H20V4H4v12h6M6 7h12v2H6V7m0 4h9v2H6v-2Z\"/>"};
/** mdi:download */
export const mdiDownload: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7l7-7Z\"/>"};
/** mdi:printer */
export const mdiPrinter: IconData = {"width":24,"height":24,"body":"<path fill=\"currentColor\" d=\"M18 3H6v4h12m1 5a1 1 0 0 1-1-1a1 1 0 0 1 1-1a1 1 0 0 1 1 1a1 1 0 0 1-1 1m-3 7H8v-5h8m3-6H5a3 3 0 0 0-3 3v6h4v4h12v-4h4v-6a3 3 0 0 0-3-3Z\"/>"};
