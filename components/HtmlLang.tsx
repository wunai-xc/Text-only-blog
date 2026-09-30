"use client";

import { useEffect } from "react";

/** 静态导出下没法在服务端知道当前语言，用它在客户端把 <html lang> 纠正过来 */
export default function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
