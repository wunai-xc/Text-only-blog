import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  // 编辑此处：站点标题 / 描述 / 域名
  title: { default: SITE.title, template: `%s · ${SITE.title}` },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  applicationName: SITE.title,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
  // 阅读器/浏览器靠这个自己发现订阅源（/feed.xml 是默认语言的别名）
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/zh/feed.xml", title: `${SITE.title}（中文）` },
        { url: "/en/feed.xml", title: `${SITE.title} (English)` },
      ],
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1416" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /* <html lang> 由 app/[lang]/layout.tsx 里的客户端脚本按路由纠正 */
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        {children}
        {/* 第 5 项：生产构建里注册 Service Worker（离线 + 缓存）；dev 下它只负责清理旧 SW */}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
