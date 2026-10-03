import HomeBlockHead from "./HomeBlockHead";
import PostCard from "@/components/list/PostCard";
import type { PostMeta } from "@/lib/content";
import { HOME_TEXT } from "@/lib/home";
import { toListPost } from "@/lib/list";
import type { Lang } from "@/lib/lang";

/**
 * 第 2 栏：文章卡片（第 9 项建立，第 11 项换成共用的三档卡片）
 *
 * 列表来自第 2 项的 `getHomePosts`（置顶优先、时间倒序、排除 hiddenInHomeList 与 about），
 * 条数由 app/[lang]/page.tsx 的 HOME_POST_LIMIT 决定。
 *
 * 卡片本身是 `components/list/PostCard.tsx`（第 11 项的三档密度），首页用的是**适中档**：
 * 与这一栏原来的样子一致（标题 / 日期 / 时长 / 摘要 / 标签）。也就是说「卡片长什么样」
 * 只有一份实现，首页与列表页不会各长一套出来（第 12 项的文章页没有卡片，它给的是正文）。
 *
 * 卡片上的文案（几分钟、置顶、草稿、AI）跟着卡片走（lib/list.ts 的 LIST_TEXT），
 * 所以 lib/home.ts 里那两句 `posts.minutes` / `articlePending` 已经删掉 —— 别再加回来。
 *
 * 标题可点与否由 PostCard 自己判断（第 12 项的正文页已落地，所以现在是真链接），
 * 落点只有一个：lib/site.ts 的 ARTICLE_ROUTE（约定第 8 条）。
 *
 * 零文章时显示空状态（约定第 4 条：所有页面要有空状态）。
 */
export default function HomePostCards({ lang, posts }: { lang: Lang; posts: PostMeta[] }) {
  const t = HOME_TEXT[lang].posts;

  return (
    <>
      <HomeBlockHead id="posts" lang={lang} />
      {posts.length > 0 ? (
        <>
          <p className="home-note">{t.count(posts.length)}</p>
          <div className="home-posts">
            {posts.map((post) => (
              <PostCard key={post.slug} post={toListPost(post)} lang={lang} density="cozy" />
            ))}
          </div>
        </>
      ) : (
        <p className="home-note">{t.empty}</p>
      )}
    </>
  );
}
