import type { MetadataRoute } from "next";

import { getPosts } from "@/lib/content";
import { LANGS, SITE, type Lang } from "@/lib/site";

/**
 * sitemap.xml（第 5 项：构建产物）
 *
 * 静态导出下 sitemap.ts 会被求值成 out/sitemap.xml；
 * `dynamic = "force-static"` 必须显式写（同 app/manifest.ts、app/robots.ts）：
 * output: "export" 下不写它会在构建的「Collecting page data」阶段报错。
 *
 * 目前列出的页面：
 *   /                        语言分流页（app/page.tsx）
 *   /zh/、/en/               各语言首页
 *   /zh/posts/、/en/posts/   文章列表页（第 10 项）
 *   /zh/posts/<slug>/ …      文章正文页，URL 由 content/ 里的文章推出（第 12 项落地后已能访问）
 *
 * 第 13 项新加页面（标签、分类、归档、关于、搜索、友链）时，在 `pageRoutes` 里补一行；
 * 不要在这里写「还没有的页面」，sitemap 指向 404 是负分。
 *
 * 文章 URL 与正文页的路由必须一致：两者都由 `PostMeta.href`（lib/content.ts）决定 ——
 * 这里的 `${SITE.url}${post.href}` 与 app/[lang]/posts/[...slug]/page.tsx 的
 * `generateStaticParams` 是同一个来源，改 slug 规则时只需要改 lib/content.ts 一处。
 */

export const dynamic = "force-static";

/** 每语言的固定页面（首页 + 文章列表页）。第 13 项做标签 / 分类 / 归档 / 关于 / 搜索 / 友链时在这里补 */
function pageRoutes(): MetadataRoute.Sitemap {
  /** 同一个路径模板在各语言下的绝对地址（hreflang 用） */
  const languageUrls = (path: string): Record<string, string> =>
    Object.fromEntries(LANGS.map((lang) => [lang, `${SITE.url}/${lang}${path}`]));

  const homeLanguages = languageUrls("/");
  const listLanguages = languageUrls("/posts/");

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${SITE.url}/`,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: { ...homeLanguages, "x-default": `${SITE.url}/` } },
    },
  ];

  for (const lang of LANGS) {
    routes.push({
      url: `${SITE.url}/${lang}/`,
      changeFrequency: "daily",
      priority: 1,
      alternates: { languages: { ...homeLanguages, "x-default": `${SITE.url}/` } },
    });

    // 文章列表页（第 10 项）：每语言一张，x-default 指向默认语言那一张
    routes.push({
      url: `${SITE.url}/${lang}/posts/`,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          ...listLanguages,
          "x-default": `${SITE.url}/${SITE.defaultLang}/posts/`,
        },
      },
    });
  }

  return routes;
}

/** 文章页：用 slug 跨语言配对，配上 hreflang 供搜索引擎关联同一篇的中英版本 */
function postRoutes(): MetadataRoute.Sitemap {
  const byLang = new Map<Lang, Map<string, string>>();
  for (const lang of LANGS) {
    byLang.set(lang, new Map(getPosts(lang).map((post) => [post.slug, post.href])));
  }

  const routes: MetadataRoute.Sitemap = [];
  for (const lang of LANGS) {
    for (const post of getPosts(lang)) {
      const languages: Record<string, string> = {};
      for (const other of LANGS) {
        const href = byLang.get(other)?.get(post.slug);
        if (href) languages[other] = `${SITE.url}${href}`;
      }
      const fallback = byLang.get(SITE.defaultLang)?.get(post.slug);
      if (fallback) languages["x-default"] = `${SITE.url}${fallback}`;

      routes.push({
        url: `${SITE.url}${post.href}`,
        lastModified: post.updated ?? post.date,
        changeFrequency: "monthly",
        priority: post.pinned ? 0.9 : 0.7,
        ...(Object.keys(languages).length > 0 ? { alternates: { languages } } : {}),
      });
    }
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [...pageRoutes(), ...postRoutes()];
}
