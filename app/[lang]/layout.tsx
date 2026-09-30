import { notFound } from "next/navigation";
import HtmlLang from "@/components/HtmlLang";
import { isLang, LANGS } from "@/lib/site";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const dynamicParams = false;

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
      {children}
    </>
  );
}
