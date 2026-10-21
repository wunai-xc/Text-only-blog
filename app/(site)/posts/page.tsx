import type { Metadata } from "next";

import { ListPage } from "@/components/list/ListPage";
import { LIST_TEXT } from "@/lib/list";
import { feedAlternatesTypes } from "@/lib/site";

/**
 * 文章列表页：/posts/
 *
 * 版面与行为在 `components/list/ListPage.tsx`（资料页共用同一份实现）；
 * 这里只声明这一页的 metadata 与内容集合。
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: LIST_TEXT.title,
    description: LIST_TEXT.lead,
    // ⚠️ 页面自己写了 alternates，根布局里那份 RSS 发现表就会被整体覆盖 —— 所以带上它
    alternates: { canonical: "/posts/", types: feedAlternatesTypes() },
  };
}

export default function PostsPage() {
  return <ListPage collection="posts" text={LIST_TEXT} canonical="/posts/" />;
}
