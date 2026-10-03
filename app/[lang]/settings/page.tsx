import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SettingsCenter from "@/components/SettingsCenter";
import { decorate } from "@/lib/decor";
import { PAGES_TEXT } from "@/lib/pages";
import { isLang } from "@/lib/lang";
import { feedAlternatesTypes } from "@/lib/site";

/**
 * 设置页（第 13 项）：`/zh/settings/` 与 `/en/settings/`
 *
 * ⚠️ 这一页**没有新写一份设置界面**：直接复用第 7 项的 `components/SettingsCenter.tsx`
 * （它只负责内容、不管容器，抽屉与这一页共用同一份 —— 那一条当时就写进 PROJECTS.md 的待办里了）。
 * 所以顶栏外观按钮、首页第 7/8 栏、抽屉、这一页四处永远是同一套行为与样式。
 *
 * 两个取舍：
 *   1. **noindex**：设置页对搜索引擎没有价值（里面的选项对每个读者都一样），
 *      所以 `robots: { index: false }`，也不进 `app/sitemap.ts`；
 *   2. 页面头用第 13 项通用的页头类（`.list-head` 系），图纸编号取 `decorate()`（10，分栏线图案）。
 *
 * 这一页是**客户端组件的内容放进服务端页面**：`SettingsCenter` 自带 "use client"，
 * 首帧按默认值渲染、挂载后再读 localStorage（与抽屉里一模一样，不会水合不一致）。
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const t = PAGES_TEXT[lang].settings;
  return {
    title: t.title,
    description: t.lead,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `/${lang}/settings/`,
      languages: { zh: "/zh/settings/", en: "/en/settings/", "x-default": "/zh/settings/" },
      types: feedAlternatesTypes(),
    },
  };
}

export default async function LangSettings({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const t = PAGES_TEXT[lang].settings;
  const decor = decorate(`/${lang}/settings/`);

  return (
    <div className="page settings-page">
      <header className="list-head">
        <p className="list-kicker">
          <span className="list-no">{decor.sheet}</span>
          {t.kicker}
          <span className="list-rule" />
        </p>
        <h1 className="list-title">{t.title}</h1>
        <p className="list-lead">{t.lead}</p>
      </header>

      {/* 与左下角抽屉里是同一份组件（一份实现，四处共用：顶栏按钮 / 首页两栏 / 抽屉 / 这一页） */}
      <div className="settings-page-body">
        <SettingsCenter lang={lang} />
      </div>
    </div>
  );
}
