/**
 * 站点配置（脚手架最小版）。
 * 第 7 项（框架 UI）会把这里扩成完整的：联系方式、菜单、i18n 文案表、阅读偏好默认值等。
 * 主题令牌与主题读写不在这里 —— 那些在 lib/theme.ts（第 6 项）。
 * 凡是「需要你亲笔写」的字段，值统一留成 编辑此处。
 */
export type Lang = "zh" | "en";

export const LANGS: Lang[] = ["zh", "en"];

export function isLang(v: string): v is Lang {
  return v === "zh" || v === "en";
}

export const SITE = {
  title: "wunai's blog",
  author: "wunai",
  url: "https://blog.wunai.top",
  defaultLang: "zh" as Lang,
  description: "编辑此处：站点描述（会用于 SEO 与 RSS）",
};
