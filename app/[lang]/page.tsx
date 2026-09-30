import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: SITE.title };

/** 占位首页：第 9 项会换成八栏吸附式首页 */
export default function LangHome() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-3 px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{SITE.title}</h1>
      <p className="text-sm opacity-70">编辑此处：本站介绍</p>
      <p className="font-mono text-xs opacity-50">脚手架就绪，首屏将在第 9 项实现</p>
    </main>
  );
}
