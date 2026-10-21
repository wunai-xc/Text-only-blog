import type { Metadata } from "next";

import { DOCS_TEXT } from "@/lib/list";
import { ListPage } from "@/components/list/ListPage";
import { feedAlternatesTypes } from "@/lib/site";

/**
 * 资料列表页：/docs/
 *
 * 与「全部文章」同一份实现（`ListPage`）：同样的搜索、筛选、密度与卡组折叠，
 * 只把内容集合换成 content/docs、称谓换成「资料」。
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: DOCS_TEXT.title,
    description: DOCS_TEXT.lead,
    alternates: { canonical: "/docs/", types: feedAlternatesTypes() },
  };
}

export default function DocsPage() {
  return <ListPage collection="docs" text={DOCS_TEXT} canonical="/docs/" />;
}
