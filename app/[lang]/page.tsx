import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getContentStats } from "@/lib/content";
import { isLang, SITE } from "@/lib/site";

export const metadata: Metadata = { title: SITE.title };

/**
 * 占位首页：第 9 项会换成八栏吸附式首页。
 *
 * 框架（顶栏 / 页脚 / 设置抽屉）已经在 app/[lang]/layout.tsx 里了，所以这里
 * 只放正文内容：一句「编辑此处」+ 一次内容统计（当作第 2 项管线的探针），
 * 开发环境再挂一个渲染管线自检（第 3 项的渲染器），生产构建里整块会被摇掉。
 * 样式走第 6 项的 `.page` 原子件与令牌工具类（text-ink-muted 等）。
 */
export default async function LangHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const stats = getContentStats(lang);
  const t = SITE.i18n[lang];
  const pipeline = stats.posts
    ? `${t.statsPosts(stats.posts)} · ${t.statsWords(stats.words)} · ${stats.tags} 个标签`
    : t.statsEmpty;

  // 自检不是站点内容：生产构建里既不会渲染，也不会被打进产物
  const DevPipelineCheck =
    process.env.NODE_ENV === "production"
      ? null
      : (await import("@/components/dev/PipelineCheck")).default;

  return (
    <main className="page flex flex-col gap-4">
      <p className="text-sm text-ink-muted">编辑此处：本站介绍（第 9 项换成八栏吸附式首页）</p>
      <p className="font-mono text-xs text-ink-subtle">{pipeline}</p>
      {DevPipelineCheck ? <DevPipelineCheck /> : null}
    </main>
  );
}
