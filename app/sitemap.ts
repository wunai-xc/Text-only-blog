import type { MetadataRoute } from "next";

import { getPosts } from "@/lib/content";
import { LANGS, SITE, type Lang } from "@/lib/site";

/**
 * sitemap.xml（第 5 项：构建产物）
 *
 * 静态导出下 sitemap.ts 会被求值成 out/sitemap.xml（不用写 dynamic，
 * 它默认就是缓存的静态 Route Handler，只要不读 Request 数据）。
 *
 * 目前列出的页面：
 *   /                        语言分流页（app/page.tsx）
 *   /zh/、/en/               各语言首页
 *   /zh/posts/<slug>/ …      文章，URL 由 content/ 里的文章推出
 *
 * 第 10 / 13 项新加页面（标签、分类、归档、关于、搜索、友链）时，在 `pageRoutes` 里补一行；
 * 不要在这里写「还没有的页面」，sitemap 指向 404 是负分。
 *
 * ⚠️ 文章 URL 依赖第 12 项的文章页：在它落地之前，这些链接会指向 404（构建本身照常成功，
 * 只有真的部署了、且 content/ 里有文章时才会被爬虫看到）。台账里记成了第 12 项的待办。
 */

/** 每语言的首页 */
function pageRoutes(): MetadataRoute.Sitemap {
  const homeLanguages = Object.fromEntries(
    LANGS.map((lang) => [lang, `${SITE.url}/${lang}/`]),
  ) as Record<Lang, string>;

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
