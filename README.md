# Text-only-blog

纯文字博客 —— Next.js 16 静态导出、Markdown 手写、中英双语、护眼纸质版面、五类图表按需加载。

> **仓库里没有文章**，一篇都没有。`content/{zh,en}/posts/` 只放写作规范，
> 内容由作者亲笔写。所以克隆下来先读 [content/README.md](./content/README.md)（写作规范），
> 再决定写什么。零文章时站点也能构建、也能浏览（每个页面都有空状态）。

> 如果你想要使用该博客，'clone'后使用'clear-main'系列分支

**开发进度台账在 [PROJECTS.md](./PROJECTS.md)** —— 那里面记录了每一项为什么这样做、
踩过哪些坑、哪些东西还没在真机 / 真浏览器上验证过。写代码之前先看它。

---

## 1. 它是什么

| 想要什么 | 这里的做法 |
| --- | --- |
| 只读文字 | 背景是一整块纯色（没有图片、没有视频、没有头像位）；唯一能放图的地方是顶栏右上角那一格（`HEADER_IMAGE`，可以一直空着） |
| 中文读得舒服 | 渲染时自动优化排版（中英之间补空格、半角标点转全角……），四条规则可单篇关掉 |
| 版面可调 | 正文宽度 / 字号 / 行距各三档，写在本机 localStorage，瞬时生效 |
| 护眼 | 三套外观：纸（默认，暖白）、亮、暗；没有 JS 时就是「纸」 |
| 能带走 | 打印即排版好的 PDF；RSS 订阅；PWA 离线可读 |
| 零后端 | 纯静态导出，搜索索引 / RSS / sitemap / 更新日志全在 `next build` 里生成 |
| 数学与图表 | KaTeX（含 `\ce` 化学式）、Mermaid / ECharts / Graphviz / ABC 五线谱 / SMILES 结构式，按需动态加载 |

---

## 2. 快速开始

```bash
npm install          # 安装依赖
npm run dev          # 开发服务器；打开 / 会自动分流到 /zh/
npm run typecheck    # tsc --noEmit：只查类型，比 build 快，改完代码先跑它
npm run build        # 生产构建（静态导出到 out/）
npm run preview      # 本地预览 out/（Service Worker 只在这里能生效）
npm run deploy       # 部署到 Cloudflare Workers 静态资源
```

`npm run dev` 之后先做的三件事：

1. 打开 `/zh/`（或 `/en/`），**左下角有一颗齿轮** —— 外观、正文宽度 / 字号 / 行距、语言都在里面；
2. 往 `content/zh/posts/` 里丢一个 `.md`，刷新：首页第 2 栏、列表页、归档、搜索索引会一起出现它；
3. 想看三套外观的差别，可以直接用调试参数（不写 localStorage，刷新即失效）：
   `/zh/?theme=paper`、`/zh/?theme=light`、`/zh/?theme=dark`。

---

## 3. 写一篇文章

最短的一篇（YAML frontmatter，`---` 包起来）：

```markdown
---
title: 第一篇
date: 2026-01-01
description: 一句话摘要，列表页与 RSS 用它。
tags: [随笔]
categories: [生活]
---

正文从这里开始。
```

同一个文件也支持 TOML（`+++` 包起来），字段语义完全一样：

```markdown
+++
title = "第一篇"
date = 2026-01-01
tags = ["随笔"]
+++
```

放哪里、字段全集、卡组（`_index.md`）、参考文献、图表语言名、常见报错 —— 全在
**[content/README.md](./content/README.md)**。几条最容易忘的：

- 文件名决定 URL：`content/zh/posts/hello.md` → `/zh/posts/hello/`（目录也可以：`notes/a.md` → `/zh/posts/notes/a/`）；
- 文件名以 `_` 开头、以及 `README.md` 会被加载器跳过；
- 草稿写 `draft: true`：**生产构建里根本不含它**，`npm run dev` 下才会出现（带一个草稿徽章）；
- 想让某篇文章成为「关于」页的内容，写 `about: true`（每语言取最新的一篇，显示在 `/zh/about/`）；
- 不想让某一篇开评论区，写 `comments: false`。

---

## 4. 部署（Cloudflare Workers 静态资源）

静态导出后的 `out/` 交给 Cloudflare。`wrangler.toml` 已经配好：

```toml
name = "text-only-blog"

[assets]
directory = "./out"
not_found_handling = "404-page"          # 未知路径交给 out/404.html
html_handling = "auto-trailing-slash"    # 与 next.config.ts 的 trailingSlash 一致
```

- **Cloudflare 侧的构建设置**：Build command 用 `npm run build`，
  Deploy command 用默认的 **`npx wrangler deploy`**（不带参数：Worker 名读 `wrangler.toml` 的
  `name`，产物目录读 `assets.directory`）。**不需要**给 API token 加 Pages 权限 ——
  Workers Builds 自动生成的 token 里本来就有 `Workers Scripts: Edit`。
- **GitHub Actions**（`.github/workflows/deploy.yml`）：push 到 `main` 触发，用
  `cloudflare/wrangler-action@v3`；需要在仓库 Secrets 里配 `CLOUDFLARE_API_TOKEN` 与
  `CLOUDFLARE_ACCOUNT_ID`。`fetch-depth: 0` 是必要的 —— 更新日志在构建期读 `git log`。
- 想绑自定义域名：Workers & Pages → 该 Worker → Settings → Domains & Routes。
- **改部署目标之前先看 [PROJECTS.md](./PROJECTS.md) 第 7 节**：从 Pages 换到 Workers 是因为
  Pages 部署需要额外权限，不是偏好问题，那一段有完整的原因与备选路径。

---

## 5. 目录结构（概要）

```
app/
  layout.tsx  page.tsx  not-found.tsx  sitemap.ts  robots.ts  manifest.ts
  [lang]/
    layout.tsx              全站框架（顶栏 / 页脚 / 首帧脚本）
    page.tsx                首页（八栏吸附，一栏一屏；每栏无卡片外壳、内容多了在栏内滚）
    posts/page.tsx          文章列表（搜索 / 筛选 / 密度）
    posts/[...slug]/page.tsx 文章正文（目录 / 进度 / 上下篇 / 评论）
    tags|categories|archives|search|about|links|settings/page.tsx
  feed.xml/  [lang]/feed.xml/  search-index.json/  changelog.json/   构建期产物
components/                 界面（article / home / list / pages / charts / 框架件）
content/                    你写的东西（README.md 是写作规范）
lib/                        逻辑与文案（site / theme / prefs / home / list / article / pages …）
public/                     sw.js、favicon.svg
```

每一个 lib 文件都是**它那一块的事实来源**（首页版面在 `lib/home.ts`、列表与卡片在 `lib/list.ts`、
文章页在 `lib/article.ts`、其余页面在 `lib/pages.ts`、配色在 `app/globals.css` 的令牌里）。
改东西之前先看那个文件头的注释 —— 里面写了「为什么这样做」与「别在这里写死什么」。

---

## 6. 需要你亲自填的地方（搜索「编辑此处」）

| 在哪里 | 填什么 |
| --- | --- |
| `lib/site.ts` 的 `SITE.description` | 站点描述（SEO 与 RSS 用） |
| `lib/site.ts` 的 `CONTACT` | 邮箱 / GitHub / 本站源码地址（**留空则页脚显示「编辑此处」且不可点**） |
| `lib/site.ts` 的 `COMMENTS` | giscus 的 repo / repoId / category / categoryId（**留空则文章页显示「编辑此处」**，不加载任何第三方脚本） |
| `lib/site.ts` 的 `LINKS` | 友链（空数组时 `/links/` 只显示说明） |
| `lib/site.ts` 的 `HEADER_IMAGE` | 顶栏右上角那张图（**留空时是一格虚线空位，写着「图片位 · 编辑此处」**；尺寸与有图时一样，补图不会让顶栏跳一下） |
| `lib/home.ts` 的 `intro.body`、`themes.demo`、`fonts.sample` | 首页第 1 / 7 / 8 栏的示范文字 |
| `content/zh/posts/` 与 `content/en/posts/` | 文章本体（这里没有测试文章，一条都没有） |

另外两处**不是文案、是资源**，目前没有：

- **PNG 图标（192 / 512）**：本站只提供 `public/favicon.svg`（内联了亮 / 暗两套颜色）。
  想要更好的「加到主屏幕」体验，把 PNG 放进 `public/`，再到 `app/manifest.ts` 的 `icons` 里补两条；
  不打算做就这样留着（SVG 图标在 Chrome / Safari 上够用，只是 iOS 主屏幕图标偶有毛边）。
- **文章缩略图**：列表页支持 `thumbnail` 字段与 `public/thumbnails/`，但**纯文字站默认不用图**，
  卡片上没有图片位。

---

## 7. 验证状态（如实说明）

这个项目的全部代码是在**没有 shell 的环境**里写的：没有在本机跑过 `npm install`、
`npm run build`、也没有在真浏览器里点过。所以：

- 类型与构建的最终结果以你本地 `npm run typecheck && npm run build` 为准；
- 有报错就把日志贴回来，按证据修；
- **[PROJECTS.md](./PROJECTS.md) 第 8 节**列着「只有你本机能确认」的清单（每一项都有具体怎么看），
  从三套外观的对比度、首帧不闪、Service Worker 离线，到文章页的悬浮目录与进度条。

已经**在 Cloudflare 云构建里真跑过**的部分：`bun install` → Turbopack 编译 → 类型检查 →
静态导出（14/14 页）连续多次通过；部署命令踩过的坑（Pages 权限、命令拼错、JSON 尾逗号）
都记在 PROJECTS.md 第 4 节里。

---

## 8. 三条不能破的约定

1. **仓库不含文章**：`content/**/posts/` 里只有 `README.md`（写作规范），加载器显式跳过它。
   不写测试文章、不写示例文章。
2. **颜色只有一个落点**：`app/globals.css` 的三套令牌。页面里用语义色工具类
   （`text-ink-muted` / `bg-surface` / `border-rule` / `text-accent`），
   不写 `dark:` 变体、不写死色值。
3. **一站内链接、一类东西只有一份实现**：站内链接走 `components/RouteLink.tsx`（读 `ROUTES` 的落地状态）；
   文章卡片只有 `components/list/PostCard.tsx` 一份；「跳到某一类文章」只有 `lib/list.ts` 的
   `facetHref()` 一处。新页面先看能不能复用，而不是先动手写。

完整的十一条约定在 [PROJECTS.md](./PROJECTS.md) 第 5 节。另外顶栏与页脚长什么样、
为什么改成「品牌 / 友链 / 图片位」三段、导航为什么在页脚 —— 见 PROJECTS.md 的
「顶栏改版 —— 对齐 wunai-blog 参考稿」那一节。
