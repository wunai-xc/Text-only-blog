import type { MetadataRoute } from "next";

import { COLLECTIONS, getCardGroupRoutes, getPosts } from "@/lib/content";
import { groupHref } from "@/lib/list";
import { SITE } from "@/lib/site";

/**
 * sitemap.xml（第 5 项：构建产物）
 *
 * 静态导出下 sitemap.ts 会被求值成 out/sitemap.xml；
 * `dynamic = "force-static"` 必须显式写（同 app/manifest.ts、app/robots.ts）：
 * output: "export" 下不写它会在构建的「Collecting page data」阶段报错。
 *
 * 目前列出的页面：
 *   /                        首页
 *   /posts/、/docs/          文章列表页与资料列表页
 *   /posts/<slug>/ …         文章正文页，URL 由 content/ 里的文章推出
 *   /docs/<slug>/ …          资料正文页，URL 由 content/docs 推出
 *   /tags/ 等三张清单页       标签 / 分类 / 归档（搜索页故意不进 sitemap）
 *   /about/、/links/         关于与友链（设置页 noindex，也不进 sitemap）
 *
 * 之后新加页面时，在 `FIXED_PAGES` 里补一行；不要在这里写「还没有的页面」，
 * sitemap 指向 404 是负分。
 */

/** 固定页面：路径 + 在 sitemap 里的优先级。 */
const FIXED_PAGES: { path: string; priority: number }[] = [
  { path: "/posts/", priority: 0.8 },
  { path: "/docs/", priority: 0.8 },
  { path: "/tags/", priority: 0.5 },
  { path: "/categories/", priority: 0.5 },
  { path: "/archives/", priority: 0.6 },
  { path: "/about/", priority: 0.6 },
  { path: "/links/", priority: 0.3 },
];

export const dynamic = "force-static";

function pageRoutes(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE.url}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...FIXED_PAGES.map((page) => ({
      url: `${SITE.url}${page.path}`,
      changeFrequency: "weekly" as const,
      priority: page.priority,
    })),
  ];
}

/** 文章 / 资料正文页（两个内容集合共用一套 slug 规则） */
function postRoutes(): MetadataRoute.Sitemap {
  return COLLECTIONS.flatMap((collection) =>
    getPosts(collection).map((post) => ({
      url: `${SITE.url}${post.href}`,
      lastModified: post.updated ?? post.date,
      changeFrequency: "monthly" as const,
      priority: post.pinned ? 0.9 : 0.7,
    })),
  );
}

/** 卡组页：有文章的目录都有自己的一页，列进 sitemap。 */
function groupRoutes(): MetadataRoute.Sitemap {
  return COLLECTIONS.flatMap((collection) =>
    getCardGroupRoutes(collection).map((group) => ({
      url: `${SITE.url}${groupHref(collection, group.slug)}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [...pageRoutes(), ...groupRoutes(), ...postRoutes()];
}
