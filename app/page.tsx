import LangRedirect from "@/components/LangRedirect";
import { SITE } from "@/lib/site";

/**
 * 站点根路径：只做语言分流，不放任何内容。
 * 静态托管上 /index.html 就是这一页。
 * 排版用第 6 项的 `.page` 原子件 + 令牌工具类（text-ink-muted / bg-canvas 之类），
 * 别在这里写死颜色。
 */
export default function RootPage() {
  return (
    <main className="page flex flex-col items-center justify-center gap-4 text-center">
      <LangRedirect defaultLang={SITE.defaultLang} />
      <h1 className="text-2xl font-semibold tracking-tight">{SITE.title}</h1>
      <p className="text-sm text-ink-muted">编辑此处：一句话站点标语</p>
      <p className="text-sm">
        <a className="text-accent underline underline-offset-2" href="/zh/">
          中文
        </a>
        <span className="px-2 text-ink-subtle">·</span>
        <a className="text-accent underline underline-offset-2" href="/en/">
          English
        </a>
      </p>
    </main>
  );
}
