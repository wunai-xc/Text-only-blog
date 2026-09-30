"use client";

import { useEffect } from "react";

/**
 * 根路径语言跳转。
 * 静态导出没有服务端重定向，所以：优先读用户上次的选择，其次看浏览器语言，
 * 都没有就用站点默认语言。跳不动也有纯 <a> 兜底（见 app/page.tsx）。
 */
export default function LangRedirect({ defaultLang }: { defaultLang: "zh" | "en" }) {
  useEffect(() => {
    const KEY = "tob:lang";
    let target = defaultLang;
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "zh" || saved === "en") {
        target = saved;
      } else {
        const nav = (navigator.languages?.[0] || navigator.language || "").toLowerCase();
        if (nav) target = nav.startsWith("zh") ? "zh" : "en";
      }
    } catch {
      /* 隐私模式下 localStorage 不可用，忽略 */
    }
    if (!window.location.pathname.startsWith(`/${target}/`)) {
      window.location.replace(`/${target}/`);
    }
  }, [defaultLang]);

  return null;
}
