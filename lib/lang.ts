/**
 * lib/lang.ts —— 站点语言
 *
 * 站点已是单语中文：保留 `Lang` 这个类型只是为了让 `<html lang>`、giscus 的
 * `lang` 属性之类需要 BCP 47 标签的地方有一个明确取值；内容目录、路由与界面文案
 * 都不再按语言分叉（见 content/posts、content/docs）。
 *
 * 零依赖，服务端组件与客户端组件都能直接用。
 */

export type Lang = "zh";

/** 站点语言（只有一个） */
export const LANG: Lang = "zh";

/** 兼容旧调用点：仍然只有一个元素 */
export const LANGS: Lang[] = [LANG];

/** 是不是本站支持的语言 */
export function isLang(v: string): v is Lang {
  return v === LANG;
}
