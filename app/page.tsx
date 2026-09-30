import LangRedirect from "@/components/LangRedirect";
import { SITE } from "@/lib/site";

/**
 * 站点根路径：只做语言分流，不放任何内容。
 * 静态托管上 /index.html 就是这一页。
 */
export default function RootPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <LangRedirect defaultLang={SITE.defaultLang} />
      <h1 className="text-2xl font-semibold tracking-tight">{SITE.title}</h1>
      <p className="text-sm opacity-70">编辑此处：一句话站点标语</p>
      <p className="text-sm">
        <a className="underline" href="/zh/">
          中文
        </a>
        <span className="px-2 opacity-40">·</span>
        <a className="underline" href="/en/">
          English
        </a>
      </p>
    </main>
  );
}
