"use client";

import { useEffect } from "react";

/**
 * 根路径跳转。
 * 静态导出没有服务端重定向，所以浏览器端把 / 送到站点默认语言。
 * 跳不动也有纯 <a> 兜底（见 app/page.tsx）。
 */
export default function LangRedirect({ defaultLang }: { defaultLang: "zh" | "en" }) {
  useEffect(() => {
    window.location.replace(`/${defaultLang}/`);
  }, [defaultLang]);

  return null;
}
