import Link from "next/link";

/** 静态导出会把它输出成 out/404.html，Cloudflare Pages 自动接管未知路径 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm opacity-60">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">页面不存在</h1>
      <p className="text-sm opacity-70">编辑此处：这一页的说明文案</p>
      <Link className="text-sm underline" href="/zh/">
        返回首页
      </Link>
    </main>
  );
}
