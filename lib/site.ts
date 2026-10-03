/**
 * lib/site.ts —— 站点核心配置
 *
 * 这里只放「跟站点有关、但不属于任何一页」的**配置**。原先这个文件混了七类东西，
 * 已经按用途拆开了 —— 要改哪一块，直接去对应的文件，别在这里翻：
 *
 *   | 想改什么 | 去哪 |
 *   | --- | --- |
 *   | 站点标题 / 作者 / 域名 / 描述 | 本文件 `SITE` |
 *   | 联系方式（邮箱 / GitHub / 仓库） | 本文件 `CONTACT` |
 *   | 顶栏右上角那张图 | 本文件 `HEADER_IMAGE` |
 *   | 评论区（giscus） | 本文件 `COMMENTS` |
 *   | 订阅源地址（RSS） | 本文件 `feedHref` / `feedAlternatesTypes` |
 *   | **友链名单** | lib/links.ts |
 *   | **界面文案（中英文）** | lib/site-strings.ts |
 *   | **路由表 / 站内导航** | lib/routes.ts |
 *   | **语言（zh / en）** | lib/lang.ts |
 *
 * 零依赖（只 import 本站自己的模块），服务端组件与客户端组件都能直接用。
 *
 * 文案分两处维护：页面骨架的文案在 lib/site-strings.ts（挂在下面的 `SITE.i18n`）；
 * 选项文案跟着选项走 —— 外观在 lib/theme.ts 的 `THEME_LABELS`，
 * 阅读偏好在 lib/prefs.ts 的 `READING_*` 表。
 */

import type { Lang } from "./lang";
import { I18N } from "./site-strings";

/* ------------------------------ 站点与联系 ------------------------------ */

export const SITE = {
  title: "wunai's blog",
  author: "wunai",
  url: "https://blog.wunai.top",
  defaultLang: "zh" as Lang,
  description: "wunai的数字文章笔记库",
  i18n: I18N,
};

/**
 * 联系方式。空着的条目在页脚显示「编辑此处」，
 * 不会渲染成空链接（点一下什么都不发生比缺一行更糟）。
 */
export const CONTACT: { email: string; github: string; repo: string } = {
  email: "3234319738@qq.com", // 编辑此处：邮箱，例如 you@example.com
  github: "https://github.com/wunai-xc", // 编辑此处：GitHub 主页，例如 https://github.com/your-name
  repo: "https://github.com/wunai-xc/Text-only-blog", // 编辑此处：本站仓库地址（公开后再填）
};

/**
 * 顶栏右侧那张图（顶栏第三段，对齐 wunai-blog 参考稿的 `image-placeholder`）。
 *
 * 怎么用：把图片放进 `public/`（例如 `public/header.jpg`），再把文件名填到下面的 `src`，
 * 例如 `src: "/header.jpg"`。**留空时**这一格画成一个虚线空位、写着「图片位 · 编辑此处」，
 * 尺寸与有图时完全一致 —— 所以以后补图不会让顶栏高度跳一下。
 *
 * 尺寸建议：横构图、主体居中。桌面上这一格是 15rem × 顶栏高（约 240 × 88px），
 * 按 2 倍屏准备 480×176 左右就够；窄屏收窄到 140px / 80px，由 `object-fit: cover` 居中裁切。
 *
 * `alt` 留空 = 它是**装饰**（整格带 `aria-hidden`，与 wunai-blog 一致）；
 * 想让读屏读出来（例如这是站标）就填上 alt，那时它不再被当作装饰。
 */
export const HEADER_IMAGE: { src: string; alt: string } = {
  src: "/wunai_xc.png", // 顶栏右上角那张图（文件在 public/wunai_xc.png）
  alt: "",
};

/* ------------------------------ 评论 ------------------------------ */

/**
 * giscus 评论（文章页）。
 *
 * 四个值都填了评论才挂上去；任何一个留空，文章页就按约定第 2 条显示「编辑此处」+
 * 怎么配，而不是一个空壳 iframe —— 这个开关留着有用（换仓库、临时关评论都靠它）。
 *
 * 换仓库要同时改三处：仓库必须**公开**、在 Settings → General → Features 里打开
 * Discussions、并装过 giscus 应用；然后到 https://giscus.app 选中仓库与分类，
 * 页面会把下面这四个值生成出来。`category` 是分类**名**（不是 id），两个都要填。
 *
 * 当前挂在 Discussions 自带的 `Announcements` 分类上 —— 这是 giscus 官方推荐的选法：
 * 只有维护者能发起讨论，giscus 机器人写得进去，读者也不会在评论区里建出一堆散帖。
 */
export const COMMENTS: {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
} = {
  repo: "wunai-xc/Text-only-blog",
  repoId: "R_kgDOU0PvBQ",
  category: "Announcements",
  categoryId: "DIC_kwDOU0PvBc4DG5Ok",
};

/** 评论是否已经配置好（四项都填了才算） */
export function commentsReady(): boolean {
  return (
    COMMENTS.repo !== "" &&
    COMMENTS.repoId !== "" &&
    COMMENTS.category !== "" &&
    COMMENTS.categoryId !== ""
  );
}

/* ------------------------------ 订阅源 ------------------------------ */

/** 每语言的 RSS 地址（路由见 app/[lang]/feed.xml/route.ts） */
export function feedHref(lang: Lang): string {
  return `/${lang}/feed.xml`;
}

/**
 * 「阅读器自动发现订阅源」用的 `alternates.types`（根布局与各页面共用一份）。
 *
 * ⚠️ Next 的 metadata 是**浅合并**：页面一旦自己写了 `alternates`（哪怕只写 canonical
 * 或 languages），根布局里这一份 `types` 就被整体覆盖掉。所以自己写 alternates 的页面
 * 要把它一起带上 —— 别在页面里手抄第二份地址：
 *
 *   alternates: { canonical, languages, types: feedAlternatesTypes() }
 */
export function feedAlternatesTypes(): Record<string, { url: string; title: string }[]> {
  return {
    "application/rss+xml": [
      { url: "/zh/feed.xml", title: `${SITE.title}（中文）` },
      { url: "/en/feed.xml", title: `${SITE.title} (English)` },
    ],
  };
}