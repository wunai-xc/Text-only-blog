"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react/offline";

import { icons } from "@/lib/icons";
import { SITE, otherLang, type Lang } from "@/lib/site";

/**
 * 语言切换（第 7 项）
 *
 * 必须是客户端组件：目标地址要用**当前路径**算出来（/zh/xxx/ ↔ /en/xxx/），
 * 服务端组件拿不到 pathname。静态导出下每一条路径都是构建期就存在的，
 * 所以直接用 <Link> 走客户端跳转。
 *
 * 同一份组件在页脚的导航栏与设置中心都用（外观一致、行为一致）。
 */
export default function LangSwitcher({
  lang,
  className,
}: {
  lang: Lang;
  className?: string;
}) {
  const pathname = usePathname() || `/${lang}/`;
  const target = otherLang(lang);
  const name = SITE.i18n[target].langName;

  // /zh/xxx/ → /en/xxx/；根路径（replace 后为空）补一个 "/"
  const rest = pathname.replace(/^\/(zh|en)/, "") || "/";
  const href = `/${target}${rest}`;

  return (
    <Link className={className} href={href} title={SITE.i18n[lang].langTitle(name)}>
      <Icon icon={icons["mdi:translate"]} width="1em" height="1em" />
      <span>{name}</span>
    </Link>
  );
}
