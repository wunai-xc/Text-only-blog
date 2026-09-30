import { notFound } from "next/navigation";

import HtmlLang from "@/components/HtmlLang";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { isLang, LANGS } from "@/lib/site";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const dynamicParams = false;

/**
 * 语言布局 —— 也是全站的**框架层**（第 7 项）
 *
 * 顶栏与页脚放在这里而不是各页面里：第 9~13 项每加一个页面就自动带上同样的框架，
 * 不需要在每个 page.tsx 里重复 import 两行 —— 这正是「框架 UI」这一项的意义。
 * （wunai-blog 是每页各写一次，那边首页有自己的一套外壳；本站的首页也只是普通一页。）
 *
 * `<html lang>` 依旧由 HtmlLang 在客户端纠正（静态导出下服务端不知道当前语言，
 * 根布局只能先写死 zh）。
 */
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <>
      <HtmlLang lang={lang} />
      <div className="site-shell">
        <SiteHeader lang={lang} />
        <div className="site-main">{children}</div>
        <SiteFooter lang={lang} />
      </div>
    </>
  );
}
