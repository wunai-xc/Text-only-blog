import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

/**
 * manifest.webmanifest（第 5 项：PWA）
 *
 * 静态导出下求值成 out/manifest.webmanifest —— 也就是 app/layout.tsx 里
 * `manifest: "/manifest.webmanifest"` 指的那个地址。
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
    background_color: "#f4f1e8",
    theme_color: "#f4f1e8",
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
