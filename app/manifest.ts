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
 * 图标用 `public/wunai_logo.png`（站点 logo，1500×1500）。
 * `sizes` 写真实尺寸而不是 "any"：PNG 不是矢量，浏览器与「加到主屏幕」都按 ≥144px
 * 判这个图标能不能用，1500 满足，因此不必再维护一份缩放副本。
 * ⚠️ 换了 logo（换了尺寸）记得改这里的 `sizes`。
 *
 * `dynamic = "force-static"` 是静态导出的硬要求，和 app/feed.xml/route.ts 同理：
 * 不写这一行，`next build` 会在「Collecting page data」阶段直接失败
 * （Error: export const dynamic = "force-static"/export const revalidate not configured
 * on route "/manifest.webmanifest" with "output: export"）。
 */
export const dynamic = "force-static";

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
        src: "/wunai_logo.png",
        sizes: "1500x1500",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
