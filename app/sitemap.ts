import type { MetadataRoute } from "next";

import { getCardGroupRoutes, getPosts } from "@/lib/content";
import { groupHref } from "@/lib/list";
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
 *   /zh/posts/<group>/ …     卡组页（目录自己的页面，`getCardGroupRoutes`；与正文页共用 catch-all，正文优先）
 *   /zh/tags/ 等三张清单页    标签 / 分类 / 归档（第 13 项；搜索页故意不进 sitemap）
 *   /zh/about/、/zh/links/   关于与友链（第 13 项；设置页 noindex，也不进 sitemap）
 *
 * 之后新加页面（比如真正的专题页）时，在 `pageRoutes` 里补一行；
 * 不要在这里写「还没有的页面」，sitemap 指向 404 是负分。
 *
 * 文章 URL 与正文页的路由必须一致：两者都由 `PostMeta.href`（lib/content.ts）决定 ——
 * 这里的 `${SITE.url}${post.href}` 与 app/[lang]/posts/[...slug]/page.tsx 的
 * `generateStaticParams` 是同一个来源，改 slug 规则时只需要改 lib/content.ts 一处。
 */

/**
 * 第 13 项的清单页：路径 + 在 sitemap 里的优先级。
 * 加一页只动这张表（`path` 末尾的斜杠与 `lib/site.ts` 的 ROUTES 写法保持一致）。
 */
const FACET_PAGES: { path: string; priority: number }[] = [
  { path: "/tags/", priority: 0.5 },
  { path: "/categories/", priority: 0.5 },
  { path: "/archives/", priority: 0.6 },
  { path: "/about/", priority: 0.6 },
  { path: "/links/", priority: 0.3 },
];

export const dynamic = "force-static";

/** 每语言的固定页面（首页 + 文章列表页 + 第 13 项的清单页）。关于 / 友链 / 设置落地时在这里补 */
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

    /**
     * 第 13 项的清单页：标签 / 分类 / 归档（地址模板一样，只有路径与优先级不同）。
     * **搜索页故意不在这里**：那一页的 `metadata.robots` 是 `noindex` —— 它的内容是
     * 文章列表的一份投影，收录进来只会与文章页抢位置。
     */
    for (const page of FACET_PAGES) {
      const languages = languageUrls(page.path);
      routes.push({
        url: `${SITE.url}/${lang}${page.path}`,
        changeFrequency: "weekly",
        priority: page.priority,
        alternates: {
          languages: {
            ...languages,
            "x-default": `${SITE.url}/${SITE.defaultLang}${page.path}`,
          },
        },
      });
    }
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

/**
 * 卡组页（`/zh/posts/notes/`）：有文章的目录都有自己的一页，列进 sitemap。
 * 用 `getCardGroupRoutes()` —— 与 `app/[lang]/posts/[...slug]/page.tsx` 的
 * `generateStaticParams` **同一个来源**（地址由 `groupHref()` 生成）。
 * 零文章、零目录时它返回空数组，sitemap 照旧合法。
 */
function groupRoutes(): MetadataRoute.Sitemap {
  return LANGS.flatMap((lang) =>
    getCardGroupRoutes(lang).map((group) => ({
      url: `${SITE.url}${groupHref(lang, group.slug)}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [...pageRoutes(), ...groupRoutes(), ...postRoutes()];
}
