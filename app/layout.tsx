import type { Metadata, Viewport } from "next";
import "./globals.css";
import FigureLayer from "@/components/FigureLayer";
import CardIntro from "@/components/CardIntro";
import PageIntro from "@/components/PageIntro";
import PrefsInit from "@/components/PrefsInit";
import LocalFontSync from "@/components/LocalFontSync";
import RouteLoading from "@/components/RouteLoading";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import ThemeInit from "@/components/ThemeInit";
import ThemeSync from "@/components/ThemeSync";
import { feedAlternatesTypes, SITE } from "@/lib/site";
import { THEME_CHROME } from "@/lib/theme";

export const metadata: Metadata = {
  // 编辑此处：站点标题 / 描述 / 域名
  title: { default: SITE.title, template: `%s · ${SITE.title}` },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  applicationName: SITE.title,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
  // 阅读器/浏览器靠这个自己发现订阅源（/feed.xml 是默认语言的别名）。
  // 地址表在 lib/site.ts：页面自己写 alternates 时要用同一份（metadata 是浅合并）。
  alternates: { types: feedAlternatesTypes() },
};

export const viewport: Viewport = {
  /**
   * 主题色（地址栏 / 状态栏）只给一条，值取「纸」的底色。
   *
   * 为什么不用 Next 支持的那种 `[{ media: "(prefers-color-scheme: dark)" …}]` 写法：
   * 读者可以显式选「纸 / 亮 / 暗」，这时系统深浅色跟页面外观已经对不上了，
   * 带 media 的两条反而会挑错颜色。所以：没有 JS 时就是纸的底色，
   * JS 起来后由 lib/theme.ts（首帧脚本 + applyTheme）按当前令牌改写 content。
   */
  themeColor: THEME_CHROME.paper,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /* <html lang> 由 app/[lang]/layout.tsx 里的客户端脚本按路由纠正 */
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        {/* 必须是 body 第一个元素：在任何内容之前把 data-theme 写好，避免首帧闪白 */}
        <ThemeInit />
        {/* 阅读偏好（宽度/字号/行距）也要在首帧之前落好，否则会看到一次版面跳动（第 7 项） */}
        <PrefsInit />
        {/* 装饰层：几何实体（主实体 + 小卫星，随路由形变、随滚动轻移）。
            固定在最底（z-index: -1）、不接鼠标事件、不进无障碍树；实体永远在正文后面 */}
        <FigureLayer />
        {/* 换页渐入：只给 <html> 挂一个属性，正文淡入一次（样式在 globals.css 第 5d 节） */}
        <PageIntro />
        {/* 全站加载动画：换页 / 首屏资源时顶栏上面那条细线（静态导出没有 loading.tsx） */}
        <RouteLoading />
        {/* 文章卡片的入场动画：只给卡片加属性，样式在 CSS（首页第 2 栏 / 列表页 / 卡组页共用） */}
        <CardIntro />
        {/* 跟随系统深浅色变化（只在读者选择「跟随系统」时生效） */}
        <ThemeSync />
        {/* 把读者上传的自定义字体（IndexedDB 里那份）注册回 FontFace，每个页面都要做一次 */}
        <LocalFontSync />
        {children}
        {/* 第 5 项：生产构建里注册 Service Worker（离线 + 缓存）；dev 下它只负责清理旧 SW */}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
