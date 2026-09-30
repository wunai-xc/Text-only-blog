import Link from "next/link";

/** 静态导出会把它输出成 out/404.html，Workers 静态资源按 not_found_handling="404-page" 接管未知路径 */
export default function NotFound() {
  return (
    <main className="page flex flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-sm text-ink-subtle">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">页面不存在</h1>
      <p className="text-sm text-ink-muted">编辑此处：这一页的说明文案</p>
      <Link
        className="text-sm text-accent underline underline-offset-2"
        href="/zh/"
      >
        返回首页
      </Link>
    </main>
  );
}
