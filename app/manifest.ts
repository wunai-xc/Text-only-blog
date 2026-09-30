import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";
import { THEME_CHROME } from "@/lib/theme";

/**
 * manifest.webmanifest（第 5 项：PWA）
 *
 * 静态导出下求值成 out/manifest.webmanifest —— 也就是 app/layout.tsx 里
 * `manifest: "/manifest.webmanifest"` 指的那个地址。
 *
 * 配色（第 6 项）：`background_color` / `theme_color` 取「纸」的底色
 * （THEME_CHROME.paper，与 app/globals.css 的 `--c-canvas` 同值）。
 * manifest 是构建期产物、拿不到运行时选择的主题，所以只能写一个：
 * 挑默认的「纸」—— 也就是「没有 JS 时读者看到的那一套」。
 *
 * 图标只有一个 SVG（`sizes: "any"`）：本仓库不能凭空生成 PNG 二进制文件。
 * 想装到手机上更稳，就把 192 / 512 的 PNG 放进 public/ 并在这里补两条 ——
 * 细节见 PROJECTS.md 第 4 节「第 5 项：构建产物 / PWA」里标了「编辑此处」的那一条。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.title,
    short_name: SITE.title,
    description: SITE.description,
    lang: "zh-CN",
    dir: "ltr",
    id: `/${SITE.defaultLang}/`,
    start_url: `/${SITE.defaultLang}/`,
    scope: "/",
    display: "standalone",
    background_color: THEME_CHROME.paper,
    theme_color: THEME_CHROME.paper,
    categories: ["blog"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
