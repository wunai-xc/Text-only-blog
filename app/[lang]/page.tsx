import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getContentStats } from "@/lib/content";
import { isLang, SITE } from "@/lib/site";

export const metadata: Metadata = { title: SITE.title };

/**
 * 占位首页：第 9 项会换成八栏吸附式首页。
 * 这里顺手读一次内容统计，用来验证第 2 项的内容管线在 dev / build 里真的能跑通；
 * 开发环境再挂一个渲染管线自检（第 3 项的渲染器），生产构建里整块会被摇掉。
 */
export default async function LangHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const stats = getContentStats(lang);
  const pipeline = stats.posts
    ? `内容管线就绪：${stats.posts} 篇 / ${stats.words} 字 / ${stats.tags} 个标签`
    : "内容管线就绪：content/ 下还没有文章，第一篇由你亲笔写";

  // 自检不是站点内容：生产构建里既不会渲染，也不会被打进产物
  const DevPipelineCheck =
    process.env.NODE_ENV === "production"
      ? null
      : (await import("@/components/dev/PipelineCheck")).default;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{SITE.title}</h1>
      <p className="text-sm opacity-70">编辑此处：本站介绍</p>
      <p className="font-mono text-xs opacity-50">{pipeline}</p>
      {DevPipelineCheck ? <DevPipelineCheck /> : null}
    </main>
  );
}
