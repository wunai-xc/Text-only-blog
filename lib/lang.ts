/**
 * lib/lang.ts —— 站点语言（从 lib/site.ts 拆出）
 *
 * 「站点支持哪些语言」与「站点叫什么名字」是两件事：加一门语言要动的是这里、
 * `content/` 下的目录、以及各处读 LANGS 的地方 —— 跟顶栏图、联系方式、评论配置
 * 没有半点关系。所以单独一个文件，加语言只来这一处。
 *
 * 零依赖（不 import 任何包），服务端组件与客户端组件都能直接用。
 */

export type Lang = "zh" | "en";

/**
 * 站点支持的语言，顺序即语言切换器里的顺序。
 * ⚠️ 加语言就改这一行（isLang 由它推导，不用再改第二处），
 * 另外记得在 content/ 下建同名目录、在 lib/site-strings.ts 的 I18N 里补一份文案。
 */
export const LANGS: Lang[] = ["zh", "en"];

/** 是不是本站支持的语言（路径参数校验、语言探针都用它） */
export function isLang(v: string): v is Lang {
  return (LANGS as string[]).includes(v);
}

/** 另一种语言（语言切换、hreflang 之类都用它） */
export function otherLang(lang: Lang): Lang {
  return lang === "zh" ? "en" : "zh";
}