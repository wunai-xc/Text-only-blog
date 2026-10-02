# PROJECTS-ARCHIVE —— 历史档案（精简版）

> `PROJECTS.md` 的历史部分。现在：`PROJECTS.md` = 现行规范 + 交接（唯一要看的那份），本文件 = 历史，只作追溯查证。
> **口径**：刻意压过，只留结论 / 坑 / 数字 / 日期；解释性长文与过时细节已删。
> **逐字原文**：`git show 7fabe170:PROJECTS.md`（拆分前那一版整份台账）。
> 历史里仍适用的技术约定已收进 `PROJECTS.md` §15.7；**冲突一律以 §15 为准**。

---

## 1. 定位与技术栈

**Text-only-blog** —— 纯文字博客：内容手写 Markdown、**仓库不预置任何文章**（含测试文），
面向阅读优化（护眼纸底、中文排版优化、可控宽度/字号/行距、进度与目录），
能力对齐 `wunai-Blog`（双 frontmatter、GFM、公式、五类图表、参考文献、搜索、RSS/PWA）。
视觉是「设计图纸」气质，动效克制。需要作者补内容的地方统一标 **「编辑此处」**。

| 分类 | 选型 |
| --- | --- |
| 框架 / UI | Next 16.3（App Router，`output: "export"` 静态导出）、React 19.2、Tailwind 4（`@tailwindcss/postcss`）+ `app/globals.css`、TS 5 |
| Markdown | unified/remark（`parse`/`gfm`/`math`/`breaks`/`cjk-friendly`）+ rehype（`raw`/`highlight`/`katex`/`slug`/`autolink`/`stringify`） |
| 公式 / 检索 | KaTeX 0.16 + `katex/contrib/mhchem`（自定义宏）；Fuse.js 7（构建期索引，零后端） |
| 图表 | Mermaid、ECharts、Graphviz（`@hpcc-js/wasm-graphviz`）、abcjs、SmilesDrawer —— 全部**按需动态 import** |
| 图标 / 评论 / 部署 | `@iconify/react/offline` + `@iconify/icons-mdi`；giscus；Cloudflare Workers 静态资源 |

形态：**纯静态**，无后端 / 数据库 / 运行时接口，所有数据构建期生成。

---

## 2. 目录速览

```
app/          layout / page（根路径语言分流）/ not-found / globals.css
              [lang]/{page,posts,posts/[...slug],tags,categories,archives,search,about,links,settings}
              feed.xml、[lang]/feed.xml、search-index.json、changelog.json（Route Handler）
              sitemap.ts / robots.ts / manifest.ts / offline/
components/   ArticleBody；charts/*；article/*（Toc、StickyTitle、Progress、Pager、GiscusComments）
              home/*（栏头 + 八栏 + HomeIndex）；list/*（PostCard、PostList）；pages/FacetIndex
              框架件 SiteHeader / SiteFooter / RouteLink / ThemeSwitcher / LangSwitcher /
              SettingsDock / SettingsCenter / HeaderIntro / RouteLoading / CardIntro
              ThemeInit / PrefsInit / ThemeSync / HtmlLang / LangRedirect / ServiceWorkerRegistrar
              AmbientBackdrop（环境色层）/ BlueprintBackground（旧图案层）
lib/          site icons prefs decor home list article pages theme toml frontmatter content
              charts typography markdown search-index feeds changelog
content/      README.md + {zh,en}/posts/README.md（加载器跳过 README.md）
types/        iconify.d.ts
根目录        next.config.ts / postcss.config.mjs / tsconfig.json / package.json /
              wrangler.toml / .github/workflows/deploy.yml / README.md / PROJECTS.md
```

- `BlueprintBackground` 与 `AmbientBackdrop` 是旧的两个装饰层，§15 的 V1 要并成 `components/FigureLayer.tsx`。
- 规划中未创建：`content/{zh,en}/pages/*.md`、`public/thumbnails|covers/`、PNG 图标（192/512）。

---

## 3. 十四项清单（全部完成；第 14 项只差锁文件）

| # | 项目 | 交付物 |
| --- | --- | --- |
| 1 | 脚手架 | Next 16.3 静态导出、React 19.2、Tailwind 4、TS 5、wrangler + GitHub Actions |
| 2 | 内容管线 | YAML(`---`) / TOML(`+++`) 双 frontmatter、卡组、references、AI/draft/pinned |
| 3 | Markdown 渲染 | GFM、highlight.js(monokai)、KaTeX + mhchem + 宏、五类图表、`[reference:N]` 角标、中文 `**` 修正 |
| 4 | 中文排版 | `lib/typography.ts`：中英补空格、半角标点/成对括号转全角、`...`→`……`，四条规则可单开关 |
| 5 | 构建产物 | `/search-index.json`、RSS（默认 + 每语言）、sitemap、robots、PWA（`sw.js` + 离线页 + manifest + 图标）、`/changelog.json` |
| 6 | 设计系统 | 护眼纸底、蓝图背景层、纸/亮/暗三套令牌（`lib/theme.ts` + `globals.css`） |
| 7 | 框架 UI | 顶栏、页脚（左下角齿轮）、设置中心、`RouteLink`、`lib/icons.ts`、`lib/prefs.ts` |
| 8 | 装饰与动效 | `lib/decor.ts`（编号/图案/图签）；后扩出「环境色色块 + 换页渐入」 |
| 9 | 首页 | 八栏吸附、`lib/home.ts`、侧边指示器（后改版为「一栏一屏」） |
| 10 | 列表页 | 搜索（懒读索引）、筛选、语言、密度、AI 默认隐藏、工具栏默认收起 |
| 11 | 文章卡片 | 紧凑 / 适中 / 内容三档；首页与列表页共用；后分出「文章 / 笔记」 |
| 12 | 文章页 | 构建期渲染全文、可收起 TOC、可拖进度滑块、粘性标题、回顶进度环、giscus |
| 13 | 其余页面 | 标签 / 分类 / 归档 / 搜索 / 关于 / 友链 / 设置 + 404 / 离线页 |
| 14 | 交付 | README、git 提交；**锁文件缺**（无 shell，需本机 `bun install` 后提交） |

---

## 4. 各项要点（仍是历史，措辞不再约束）

**1 脚手架**：`output: "export"` + `trailingSlash: true` + `images.unoptimized`；静态导出下没有 rewrites/redirects/
图片优化 → 根路径分流放在浏览器端（`LangRedirect`，保留 `<a>` 兜底）。Tailwind 4 用 `@import "tailwindcss"` +
`@theme`，不生成 `tailwind.config.js`。版本策略：`next 16.3.1` / `react 19.2.8` 对齐参考项目，其余宽松 `^`；
`overrides` 把 katex 钉 `^0.16`。五个图表库不进首屏，只按需动态 import。图标离线打包，运行时不发请求。

**2 内容管线**：`lib/toml.ts` 自写 TOML（frontmatter 子集、支持转义与进字面量、报错带行列号 —— 为 `+++` 单独装包不划算）；
`lib/frontmatter.ts` 双格式识别 + 归一化（日期 ISO、tags 数组/分隔串、布尔容忍 `"true"`/`1`/`"是"`、缩略图别名）；
`lib/content.ts` 只读盘不渲染：识别卡组（`_index.md`）、`references`、`pinned/draft/about/hiddenInHomeList/isAI`、
字数与时长（中日韩按字、西文按词）、缩略图三级推断（frontmatter → `public/thumbnails|covers` → 正文首图）；
**跳过 `README.md` 与下划线开头的文件**；`目录/index.md` 代表目录；slug 冲突抛错；`draft` 只在非生产出现。
零文章 / 零配置一律返回空数组或 `null`，不抛错。写作规范在 `content/README.md` + 各语言 `posts/README.md`。

**3 Markdown 渲染**：单条 unified 管线（全在构建期跑，客户端只收 HTML）：
`parse → gfm → cjk-friendly → cjk-friendly-gfm-strikethrough → breaks → math → 图表块 → 引用角标 → rehype → raw → slug →
目录收集 → autolink-headings → katex → highlight → stringify`。
- **中文 `**` / `~~` 修正（2026-10-01，站长报《医药学笔记》加粗失效）**：根因是 CommonMark 的 CJK 强调规则
  （commonmark-spec#650：闭合定界符**内侧是标点**、**外侧既非空白也非标点**时不算右翼定界符），
  于是 `**抗生素（antibiotic）**的定义` 整段渲染成字面量星号（`**抗生素（antibiotic）**，` 却正常）。
  加 `remark-cjk-friendly` + `remark-cjk-friendly-gfm-strikethrough`（都从 `/parseOnly` 进）。
  **两条规矩**：两个必须一起挂；strikethrough 那个**必须排在 `remark-gfm` 之后**。
  ⚠️ 它不修「`1.有序` 不成列表」—— 有序列表标记后必须有空格，是撰写侧的事。
- 公式：KaTeX + mhchem（`\ce`/`\pu`）+ `KATEX_MACROS`；写错公式原位画错并着色，**不弄挂整站** ——
  这件事由 rehype-katex 自己保证（它先 `throwOnError: true` 试、记 vfile message、再 false 重画）；
  **传 `throwOnError` 反而类型报错**（被 `Omit` 掉了）。`trust: false`。
- 高亮 highlight.js + monokai（未知语言不报错）。五类图表：`lib/charts.ts` 登记表，构建期换成占位
  `<figure data-chart>` + 隐藏源码，客户端 `ArticleBody` 见到才动态 import 渲染器；
  没有图表时五个库一个字节都不进包。
- 参考文献 `[reference:N]` → 角标 + 文末列表；排序「纯数字 id 升序在前，其余按书写顺序」；找不到时红色 `cite-missing` + warning。
- 目录复用 `rehype-slug` 的 id，返回嵌套 `toc` + `flattenToc()`。已删的开发态自检 `components/dev/PipelineCheck.tsx`
  （要验证管线就写一篇真文章）。

**4 中文排版**：`lib/typography.ts` 零依赖，四条规则可单开关 —— ① 汉字↔半角字母数字补一个普通空格 U+0020
（不用窄空格，免得选不中）；② 前一个字符是中文语境时半角 `, . ; : ! ?` 转全角；③ `...` → `……`；④ 成对且一侧贴中文的
半角括号转全角（栈配对，落单不碰）。防误伤靠「只处理 mdast 的 `text` 节点」+「标点只看前一个字符是不是中文」，
于是 `1,000`、`3.14`、`v1.2.3`、`example.com`、`http://` 自动免疫；引号**刻意不转**；跨节点相邻不处理。
接入位置：`remarkMath` 之后、`remarkCitations` 之前。frontmatter 的 `typography` 在第 12 项接上。

**5 构建产物**：**方案变更** —— 原计划 `scripts/*.mjs` + `prebuild`，实际那样得把 frontmatter 解析与内容扫描在
`.mjs` 里再写一遍（必然漂移），于是改成**全部在 `next build` 里生成**（Route Handler 构建期渲染静态响应、只支持 GET、
必须显式 `dynamic = "force-static"`；sitemap/robots/manifest 有内建支持）。
产物：`/feed.xml`、`/{lang}/feed.xml`、`/search-index.json`、`/changelog.json`、`/sitemap.xml`、`/robots.txt`、
`/manifest.webmanifest`。`package.json` 里**删掉了 `prebuild`/`predev`**（指向从未创建的 `scripts/*.mjs`，
一直是 build/dev 直接失败的原因）。
- 搜索索引：每篇一条 `SearchDoc`（`lang/slug/href/title/description/excerpt/body/tags/categories/group/date/updated/
  pinned/isAI/words/readingMinutes/cover`），`fields` + `version` 一起写进索引；正文只取前 **1200** 字符。
  **格式变了就 +1 版本号**。
- RSS 2.0：只给摘要 + 链接（全文与「让人来站点读书」相反）、`FEED_LIMIT = 30`、清控制字符、空 channel 合法。
- 更新日志：**先 GitHub API 再 `git log`**（云构建是浅克隆，只有 API 拿得到完整历史），每条带 `url`；
  结果缓存一个 Promise；**两源都失败返回空数组 + warn，绝不挂构建**；`/changelog.json` 的 `source` 说明来源。
  ⚠️ 那处 `fetch` 必须 `cache: "force-cache"` —— `no-store` 会把页面标成动态渲染、构建直接失败。
- sitemap：`/`、`/{lang}/`、文章页、卡组页、标签/分类/归档/关于/友链 + hreflang；搜索页与设置页 `noindex` 不进。
  robots 只禁 `/offline/`、`/search-index.json`、`/changelog.json`。
- PWA：`manifest.ts`（`start_url` 默认语言首页、standalone、`THEME_CHROME.paper` = `#f1ece0`）；
  `public/sw.js`（不打包、普通 JS）：外壳预缓存（`/`、`/zh/`、`/en/`、`/offline/`、manifest、favicon），
  第 10 项把 `/zh/posts/`、`/en/posts/` 也加进清单（`CACHE_VERSION` 1 → **2**），
  `/search-index.json` **故意不进**；导航网络优先、同源静态缓存优先 + 后台更新；跨源 / 非 GET / Range 不插手。
  `app/offline/page.tsx`（`noindex` + robots 排除）；`ServiceWorkerRegistrar` 只在生产注册（dev 反向注销）。
  `favicon.svg` 内联 `prefers-color-scheme`。**PNG 图标（192/512）没做**（生成不了二进制）。
- RSS 自动发现登记在 `app/layout.tsx` 的 `alternates.types`；⚠️ Next 的 metadata **浅合并** ——
  页面自写 `alternates` 会把它整体覆盖，要在页面里补回来（文章页踩过）。

**6 设计系统**：颜色只有一份定义（`app/globals.css` 三套块），`lib/theme.ts` 只镜像三套**底色**（`THEME_CHROME`）。
纸 `#f1ece0` / 暖褐 `#8a6a3b`；亮 `#f4f6f6` / 蓝图青 `#1d4f63`；暗 `#0e1416` / 亮青 `#7fc3da`。
令牌五组（面 / 字 / 线 / 重点 / 蓝图层）+ 共用组：形状 `--shape-*`（**故意带前缀** —— 与 Tailwind 的 `--radius*`/`--shadow*`
同名会改坏 `rounded-lg` 之类）与阅读度量 `--reading-measure` / `--reading-size` / `--reading-leading`。
`@theme inline` 映射成语义色工具类；**不写 `dark:` 变体**（三套外观两态表达不了）。
自定义样式写进 `@layer base` / `@layer components` 才**能被工具类覆盖**（只有打印样式故意留层外）。
切主题落点只有一个：`<html data-theme>` + `data-theme-choice` —— 三处配合：`ThemeInit`（内联为 **body 第一个元素**，避免 FOUC）、
`ThemeSync`（只对「跟随系统」生效）、`lib/theme.ts` 运行时 API（`applyTheme`/`setThemeChoice`/`watchSystemTheme`/
`subscribeTheme`/`readThemeTokens`）。选择语义 `system|paper|light|dark`（`system` 浅色→纸、深色→暗），键 `tob:theme`。
**改令牌要同步三处**：`THEME_CHROME` / `THEME_INIT_SCRIPT` / `FALLBACK_TOKENS`。
图表跟主题走：`ChartContext = { theme, dark, colors }`（令牌现读），切换后「清空容器 → 重跑渲染器」；
echarts 注册 `blog` 主题、mermaid `themeVariables`、graphviz 注入默认属性、smiles 内置 light/dark、abc 第 12 项补。

**7 框架 UI**：`RouteLink` 是解耦点 —— `ROUTES[id].status` 为 `"ready"` 才渲染真 `<Link>`，`"pending"` 渲染成
不可点的 `span`（压暗 + 悬停说明「第 N 项落地」）；第 13 项起已无 pending。
设置中心 = 左下角 fixed 齿轮 + 左侧抽屉（`role="dialog"`/`aria-modal`、Esc、遮罩、锁 body 滚动、
0.18s 只在 `prefers-reduced-motion: no-preference`），四块：外观 / 阅读偏好 / 语言 / 恢复默认，并写明偏好只存本机。
`lib/prefs.ts` 三个决定：① 存档位 id（`narrow`/`normal`/`wide`…）而不是 rem 值；② 写 `<html>` **行内样式**，
「恢复默认」是**移除**变量而不是设回默认值；③ 首帧脚本由选项表 `JSON.stringify` 生成（不手抄第二份），
由 `PrefsInit` 内联为 **body 第二个元素**（否则存了「窄 + 大字号」的读者会先看到一帧默认版面）。
顶栏当时三段（品牌 / 导航 / 图签），后改版见 §5。页脚：联系方式留空只显示「编辑此处」且不可点（不生成点不动的空链接）。

**8 装饰与动效**：`lib/decor.ts` 是「路径 → 图纸」的唯一来源（`section` / `pattern` / `sheet` 两位编号 / `lang`）。
规则两条：① 先摘语言段（尾斜杠/查询串/哈希先规范化；`/offline/`、`/404.html` 退回默认语言）；
② 再看第一段（空→home；`posts` 后还有一段→article；`offline`；认得的 RouteId；其它→`unknown` 印 `00`）。
七套图案全在 CSS，零图片零滤镜：`sheet`/`columns`/`measure`/`grid`/`hatch`/`dots`/`plain`；
编号 01~11 + 00，图案重复是故意的。**为什么是客户端组件**：静态导出下只有 `usePathname()` 知道路径，
但组件里没有任何 `if` —— 图案的解释权在 CSS 与 `lib/decor.ts`。
动效只有两处：换页纸面重铺（同 div 挂 `data-redraw`，0.32s `opacity 0.45 → 1`，360ms 后摘属性；**首帧不播**；
reduced-motion 不参与）+ 顶栏光标闪烁；**刻意没有**页面转场动画。
右下角图签：等宽小字 `TOB-ZH-04` + 页名（RouteId 复用导航文案），画在蓝图层里（`z-index: -1`），窄于 48rem 不印，
整层 `aria-hidden` —— **它是装饰不是信息**（统计在页脚）。`data-route="article"` 把边缘淡出半径收小。
新增图纸两步：`PATTERNS` / `SHEETS` 各加一行 + CSS 一条（两张表是穷尽类型）。
「纸质颗粒」**没做**：CSS 造噪点只有内联 SVG 湍流（与「不加图片」矛盾）或高频渐变（开销 + 摩尔纹）。

**9 首页**（落地时形态，后改版见 §5）：交付物 `lib/home.ts` + `page.tsx` + `components/home/` 10 个组件。
八栏与来源：介绍 / 文章（`getHomePosts`，置顶优先）/ 统计 / 更新日志 / 站内内容 / 阅读改善 / 外观 / 字体；
当时只动两处顺序（文章提到第二；两两相关的栏并成一行 → 5 行）。版面与文案单一来源 `HOME_TEXT`（中英各一份），
`homeNumber()` 从版面推 01~08（调顺序不会错位）；页面里的 `Record<HomeBlockId, ReactNode>` 是穷尽的。
吸附全交给 CSS（`html:has(.home-flow)`）：`:has()` 认领首页容器，不用挂 class、不需要 JS，其它页不受影响；
`scroll-padding-top` 同时管吸附位置与锚点；偏移是 `--home-head-room`（由 `--header-h` 推）。reduced-motion 关吸附。
侧边指示器是**真锚点** + `IntersectionObserver`（`rootMargin: -45% 0 0 -45%`），可见项累积在 `useRef` 的 Set 里（不累积会闪），
栏名常驻 DOM、窄屏隐藏，`z-index: 18`。第 3 栏给的是**构建期数字**并写明要接外部服务才有访问量；
第 5 栏「笔记」映射到卡组；第 4 栏读提交历史（含空状态，绝不挂构建）；第 2 栏卡片当时不可点（读 `ARTICLE_ROUTE`）。

**10 列表页**：数据全在构建期取（HTML 里就有完整列表，无 JS / 爬虫 / 离线都能读）。
搜索**第一次输入时**才 `fetch("/search-index.json")` + 动态 `import("fuse.js")`；字段权重读索引自带的 `fields`，
权重表 `SEARCH_FIELD_WEIGHTS`（标题 3 / 标签与分类 2 / 摘要 1.5 / 摘录 1 / 正文 0.7）；索引全语言，按 `doc.lang` 筛。
`loadSearchIndex()` 在「HTTP 不 ok / 形状不对 / `version` 不匹配」时返回 `null` → 退回本页字段（`INLINE_SEARCH_FIELDS`）
并在页面上如实写明（**这条兜底是有意为之**：`/search-index.json` 的产物路径当时没验证过）；
fuse 加载失败是另一种红色提示。客户端**不能值导入** `lib/search-index.ts`（它 import 了 `node:fs`）→
版本号由服务端 props 传（`indexVersion`），`lib/list.ts` 只用 `import type`。
筛选：标签 / 分类多选（带篇数）、年份、排序、密度三档；**组内「或」、组间「且」**，唯一实现 `matchesFilters`
（搜索命中也要过 `applyFilters`）；`hideAI` 默认 true。**筛选进地址栏**（只写非默认项，可分享）、
**密度进 localStorage**（`tob:list-density`）；首帧按默认渲染、挂载后再应用（否则水合不一致）。
零文章不出工具栏；页头编号取 `decorate()`；打印不印工具条。

**11 卡片**：三档（紧凑 = 标题 + 日期与时长；适中 = 加摘要与标签；内容 = 元信息全展开并按阅读度量排摘要）+
只两处结构分支，其余交给 CSS；一份实现两处使用（列表页与首页第 2 栏，首页只覆盖两行）。
小字跟卡片走（`LIST_TEXT`）；标题可点与否读 `ARTICLE_ROUTE`（改 `ready` 后一行没改就变真链接）。
「内容」档**不重复正文**。后续新增 `data-kind`：文章 = 实线 + 面底色；笔记（在卡组目录里）= 虚线 + 画布底色 +
「笔记 · 卡组名」角标 + 标题小一档，悬停虚转实并染强调色。

**12 文章页**：正文构建期渲染；只有目录 / 进度 / 评论是客户端件。
**宽度唯一来源** `.article-page { max-width: calc(var(--reading-measure) + 3rem) }`（任何地方不写死 42rem）。
目录是**真锚点**（id 复用 `rehype-slug`），高亮用 IO 取「顶栏下方那一带里的第一条」，带里空着**保留上次高亮**（否则闪）；
缩进由 `tocIndent()` 换算；它会值导入 `lib/article.ts` → 那个文件对 `lib/markdown.ts` **只用 `import type`**
（否则整条 unified 管线进浏览器包）。
进度算**整页**比例（不是「正文读了多少」）；一次 passive `scroll` + rAF 节流同时管进度与回顶按钮出现
（`BACK_TO_TOP_AFTER = 600`）；按钮不可见时 `aria-hidden` + `tabIndex={-1}`；reduced-motion 瞬时跳。
上下篇无 hook、服务端直接渲染，`articleNeighbors()` 解释一次；只有一侧时另一格不留空框。
标签 / 分类片链到 `/zh/posts/?tag=…`，编解码只有 `lib/list.ts` 一处。
giscus：`COMMENTS` 四值留空 → 显示「编辑此处」+ 怎么配；四项都填才挂；滚到附近（`rootMargin: 600px`）才插脚本；
换外观走 `postMessage`（**不重载**，重载会丢读了一半的列表）；讨论映射用 `specific` + 站内路径；
被拦 / 断网给一行提示；frontmatter `comments: false` 可关单篇。
metadata：canonical 用 `post.href`、languages 用同 slug 配对，并把根布局的 RSS 发现表带回来。
`parseTypographyOption()`：**返回 `undefined`（没说）与 `false`（说了要关）是两件事**。
渲染 `warnings` 逐条 `console.warn` 带源文件路径。五线谱补配色：画完后只把**近黑**的 `stroke`/`fill` 换成 `--c-ink`
（`fill="none"` 与作者指定颜色不碰）。打印隐藏四件，上下篇留着。
**零文章**：动态路由 + `output: export` 至少要一条路径 → 保一条保留路径 `/<lang>/posts/__empty__/`
（`EMPTY_POST_SLUG`），`noindex`、不进 sitemap、写下第一篇后自动消失 —— **别当死链删掉**。

**13 其余页面**：主线是「不写第二份」—— 标签 / 分类共用 `FacetIndex`（服务端零状态，字号四档，虚线=标签实线=分类）；
归档是年 → 月 → 文章时间线（**月份只分组不筛选**，只有年有 `?year=`）；搜索页**整份复用** `PostList`
（只多 `autoFocusSearch`，读者已点到别处就不抢）；关于页渲染 `about: true` 的最新一篇（**没有**目录 / 进度 / 回顶 / 评论）；
友链读 `LINKS`（空则显示「编辑此处」）；设置页直接放 `SettingsCenter`（`noindex`、不进 sitemap），
同一份设置界面**四处**在用（顶栏按钮 / 首页两栏 / 抽屉 / 设置页）。文案与纯函数集中在 `lib/pages.ts`。
`facetHref()` 挪进 `lib/list.ts` 成为**唯一**的「跳到某一类文章」实现；页头统一用列表页那套类（`.list-head` 系）；
sitemap 加 `FACET_PAGES`（搜索 / 设置不进）；`ROUTES` 全部 `"ready"`；离线页清单补两个语言的列表页。

**14 交付**：README 只讲四件事（这是什么 / 怎么跑 / 怎么写第一篇 / 怎么部署），理由与坑全留在台账；
「需要你亲自填的地方」六行表（`SITE.description`、`CONTACT`、`COMMENTS`、`LINKS`、首页三处示范文字、文章本体），
每行写了留空会怎样；另列两处资源缺口（PNG 图标、缩略图）。README 第 7 节如实写「没验证过」。
后续补「本地部署」一节：本地 = 把 `out/` 交给任意静态服务器（不需要 Node 运行时 / 数据库 / 环境变量），
前置 Node ≥ 20.9；三条路径 —— 本机 `preview` / 交给 nginx（`try_files … =404` + `error_page 404 /404.html`，
注意尾斜杠、只能挂根路径、SW 需 HTTPS 或 localhost）/ 与 Cloudflare 的关系（同一份 `out/`，线上只能选一处）。
**⚠️ 锁文件仍然没有**：本环境无 shell，手写等于编造依赖解析结果 → 本机 `bun install` 后提交，
顺手可把 `wrangler` 写进 `devDependencies`，workflow 的 `bun install` 之后可加 `--frozen-lockfile`。
这条只影响版本是否被钉死，不影响功能。

---

## 5. 事故与部署（时间线）

**构建修复 · 首次云构建（2026-09-30）**：编译过，类型检查挂 2 处，都在 `lib/markdown.ts` 的插件选项。
根因：unified 的 `Processor#use` 形参是联合元组 `Parameters | [boolean]`，TS 对联合签名里的**新建字面量**只挑一支推导
（挑中了 `[boolean]`）→ `TS2345`；修法是把选项写成**显式标注插件 `Options` 类型的常量**。
另：`rehype-katex` 的 `Options` 是 `Omit<…, "displayMode" | "throwOnError">`，原来传的 `throwOnError` 属不存在属性 → 删掉
（写错公式不挂构建由插件自己保证）。顺手把插件记在 vfile 上的消息并进 `renderMarkdown` 的 `warnings`
（以前看不见）；`tsconfig` 的 `jsx` 改 `react-jsx` + 补 `.next/dev/types` 的 include（Next 16 的 mandatory changes）。

**第六次云构建**：`package.json` 的 `scripts` 末项留了**尾逗号** → `EJSONPARSE`，**页面构建根本没开始**。
JSON 不允许尾逗号。教训：改完 JSON 必须过真解析器
（`node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"`），`tsc` **不检查 JSON**。

**第七次云构建**：编译 42s 过，类型检查报 `PostList.tsx` 193 / 198 行两处 `TS7006`（`search` 形参隐式 any）。
根因：返回类型是**联合** `Promise<Engine | "error">` 且 `return` 的是**对象字面量** → 联合型返回类型不往下传给属性当上下文类型。
修法：形参显式标 `query: string`（不用 `as` 断言、不收窄返回类型）。同类写法仓库里没有第二处。

**第八次云构建**：编译 29.2s + **类型检查 5.4s 双双通过**（第 12 项以来第一次），挂在
`Collecting page data`：`Page "/[lang]/posts/[...slug]" returned an empty array from "generateStaticParams()"`。
根因：动态路由 + `output: export` **至少要生成一条路径**，而本站按约定一篇文章都没有 → 两者相撞。
修法：保一条保留路径（`EMPTY_POST_SLUG = "__empty__"`；空数组时 `generateStaticParams` 返回这一个；
页面渲染 `EmptyArticlePage`；metadata `noindex`；写下第一篇自动消失）。
为什么不用别的：`notFound()` 在静态导出下的表现**没实测**、赌不起；可选 catch-all 会与列表页路由冲突。

**部署失败 · 第二～五次云构建**（站点功能一直没问题，卡的全是部署这一步）：

1. 第二次：用了 Workers 的 `npx wrangler deploy`，但 `wrangler.toml` 当时写的是 **Pages** 的
   `pages_build_output_dir` → Workers 那条路径不读它 → 「Missing entry-point」。
   结论：**命令选错**，不是配置缺失。正确命令（当时）`npx wrangler pages deploy out --project-name=text-only-blog`。
2. 第三次：`wrangLer`（大写 L）→ npx 去 registry 找同名包 → 404（**npm 包名只允许小写**）。
3. 第四次：`deploy out--project-name=…` **少一个空格**（产物目录被拼成一个不存在的名字）
   + `Authentication error [code: 10000]`。后者来自 `GET /accounts/<id>/pages/projects/…`：
   **Workers Builds 自动生成的 token 没有任何 Pages 权限**，而 Pages API 要求 **`Cloudflare Pages: Edit`**。
   依据：Cloudflare 文档《Workers → CI/CD → Builds → configuration》（API token 小节）与
   《Pages → REST API》（Get an API token 小节）。顺带确认：Workers Builds 用 `package.json` 里的 wrangler 版本。
4. 第五次：命令已完全正确，`code 10000` **一字未变** → 判定实际使用的 token 仍无 Pages 权限（报错早于上传产物）。
   **怎么确认用的哪个 token**：① 看 token 列表的 *Last used*；② 把 Deploy command 临时改成
   `npx wrangler pages project list` 当探针；③ 本机 `curl -H "Authorization: Bearer $TOKEN" …/pages/projects`。
5. **路径 A（保留 Pages + 换 token）一度选定、后推翻**，留档：建一个带 Account · Cloudflare Pages · Edit 的
   自定义 token → 到 Worker 的 Settings → Build → API token 选中它（下次构建才生效）→ 确认 Pages 项目存在。
6. **最终采用路径 B：Workers 静态资源**（用该 token 本来就有的 Workers Scripts: Edit）——
   `wrangler.toml` 改 `[assets] directory = "./out"` + `not_found_handling = "404-page"`
   + `html_handling = "auto-trailing-slash"`；`package.json` 的 `deploy` 改 `npx --yes wrangler deploy`；
   workflow 改 `command: deploy`，并把必然失败的 `npm ci` + `cache: npm` 换成
   `oven-sh/setup-bun@v2`（bun 1.2.15）+ `bun install`；两处注释措辞同步。
   Cloudflare 侧 Deploy command 改回默认的 `npx wrangler deploy`，**不碰 token**。
   代价：站点从 Pages 项目变成同名 Worker（原域名要重新绑定）。
   ⚠️ 仍未验证：项目名与 `wrangler.toml` 的 `name` 不一致会不会报错；`not_found_handling` 是否真把 `out/404.html` 服务出来。
   另：`npx wrangler …` 每次现下载（日志里 `will be installed: wrangler@4.144.0`），仓库里**没有** wrangler 依赖。

**仓库无锁文件**（与部署报错无关，但迟早咬人）：`ls` 只有 `package.json`；云构建日志里 `Saved lockfile` 说明锁文件
在容器里现生成、随后丢弃。后果：① workflow 原来的 `npm ci` / `cache: npm` 必然失败；
② 依赖版本不受控（`^` 区间每次构建可能换小版本）；③ 修法要在有 shell 的机器上做 → 留给第 14 项。

---

## 6. 改版轮次

**顶栏改版（对齐 wunai-blog）**：`SiteHeader` 重写为**品牌 / 友链 / 图片位**三段，新增 `HeaderIntro`；
原先挂在顶栏的七项导航、语言切换与内容统计**搬到页脚第一块**（不搬就有四个页面失去入口），
统计那行复用 i18n 里已有的四条文案。图片位三个决定：留空画虚线空位且**尺寸与有图时一致**（顶栏固定高，补图不跳）；
用**原生 `<img>`**（静态导出不优化图片，且 `next/image` 会因构建期找不到文件而报错）；
`alt` 留空 = 装饰（整格 `aria-hidden`）。
新增令牌 `--header-h`（5.5 / 4.75 / 4.5rem），`--home-head-room` 由它推，**两档窄屏值必须留在未分层处**
（`@layer` 里的声明压不过未分层的 `:root`）；顺手把最后两处手写的顶栏偏移收进令牌；
`--frame-width` 只剩页脚与 `.page` 用。
入场动效**顺序不能反**：默认可见 → JS 就绪后加 `.fade-ready` 藏起来 → 下一帧 `.is-visible`（三段各错开 90ms）；
反过来会让禁 JS 的读者**顶栏永久不可见**。`RouteLink` 多一个可选 `title`（pending 时与「第 N 项落地」**拼起来**）。
打印：顶栏照印，**图片位不印**。

**背景改成纯色**：`lib/decor.ts` 新增 `DECOR_PATTERNS = false` → 每页 `data-decor="plain"`，
纸面只剩 `--c-canvas`；七套图案与两张表**一行没删**（改成 `true` 即整套恢复）；
CSS 补 `.blueprint[data-decor="plain"]::before { display: none }`。
顺手修掉一处被这次改动弄坏的判断：文章页「图签让给回顶按钮」原判 `data-decor="measure"`，
纯色下永不成立 → 改成 **`data-route="article"`**。

**首页改版 —— 一栏一屏**：`HOME_ROWS` → `HOME_ORDER`（一维数组，顺序即版面），去掉 `.home-row` 与并排，
`<section>` 不再带 `panel`（没有边框 / 圆角 / 阴影 / 面板底色）；吸附改 `y mandatory`，`.home-block` 自己就是吸附块。
**第二轮修三处**（第一轮 `min-height` + `scroll-snap-stop: always` 仍然「乱」）：
① 改成**定高 `height` + `overflow-y: auto`** —— 吸附区比视口高时中途没有合法停靠点，一松手就被拽回去，
这才是「吸附乱」的根；栏内滚动条不画。
② 去掉 `scroll-snap-stop: always`（吸附点已是整屏，留着只会把一次滑动锁成一栏）。
③ **页脚补一个吸附点**（`scroll-snap-align: end`），否则滑到页脚会被吸回最后一栏、永远读不到。
居中挪进内层 `.home-block-body`（在滚动区自身上写居中，溢出的那一头永远滚不到）；
`.home-flow` 去 gap 与内边距、顶部补与吸附让位同值的留白；删掉窄屏那档 `min-height: auto`；
`HOME_POST_LIMIT` 6 → 4；打印与 reduced-motion 都放开定高。

**卡组页 + 非 ASCII slug**（站长报「新文章打不开」「卡组只显示一篇」）：
根因 ① 线上卡片是 `/zh/posts/notes/笔记/`（frontmatter 没写 `slug`，slug 由路径推成中文）——
浏览器把 href 百分号编码，而静态产物是中文目录名，Cloudflare 查文件前又解码 → 必然 404（`/zh/posts/note-1/` 实测也是 404）。
修法：内容侧补 `slug = "note-1"`；代码侧 `lib/content.ts` 新增 **`assertUrlSafeSlug()`** —— 非 ASCII 的 slug 让
**构建当场失败**并给出「改文件名 / 补一行 slug」两种改法（报错分「写了 slug」与「没写 slug」两种说法）。
根因 ② 卡组分块显示的改动**只在工作区没提交**。同轮补：新增**卡组页** `/<lang>/posts/<group>/`
（与文章页**共用同一个 catch-all**，顺序「先文章、后卡组」，因为 `notes/index.md` 与目录 `notes/` 会落到同一地址）；
`getCardGroupRoutes()` 只推一次，`generateStaticParams` 与 sitemap 共用；列表页组头改成链接（`groupHref()`）；
**工具栏默认收起且不再自动展开**（只有 `/search/` 挂载后展开）。卡组封面固定 `max-height: 13rem` + `object-fit: cover`。
后续《微时序笔记1》补 `slug = "micro-timing-note-1"` + 13 处有序列表补空格（**这条渲染器不会替你补**，
已写进 `content/README.md` 第 9 节「写之前要知道的」）。

**文章页悬浮件补强**：新增 `ArticleStickyTitle`（零高 `sticky` 容器贴在 `<article>` **里面** —— 于是它随文章一起结束；
横条两端外扩 1.5rem 与正文列同宽、长标题省略号；判定线 `STICKY_TITLE_OFFSET` 与目录高亮同值；`aria-hidden`、不放可点元素；层序 17）。
目录面板第一行改成开关：**默认状态交给 CSS**（`data-open` 不写 = 宽屏展开、窄屏收起），读者点过才写死 ——
于是**没有 JS 的宽屏读者照旧看得到目录**；窄屏挂件在**左下角**（`bottom: 3.9rem`，叠在齿轮上面），点开是浮层、点一条顺势收起；
断点 `TOC_WIDE_QUERY`（78rem）与 CSS 同值，**改断点要改两处**。
进度细线变成 `role="slider"`：命中区 0.9rem（触屏 0.7rem）、轨道铺满视口高、`DRAG_THRESHOLD = 6px` 才算拖动
（手机右边缘常被拿来滚页，`touch-action: none`）、鼠标点轨道即跳、`setPointerCapture` 跟手、`seekTo` 立刻写、
键盘 `PROGRESS_KEY_STEP = 5` / Page 三步 / Home·End，并给它补了自己的焦点框。
回顶按钮 2.4 → **2.6rem** 并套一圈 `stroke-dashoffset` 进度环（36×36 viewBox、半径 16.5、周长算法在组件里），
环 / 百分比 / 右边那条线读**同一个 `progress`**。打印时四件一起不印。

**环境色大色块 + 换页渐入（第 8 项扩展）**：站长要「换页有不影响阅读的渐入 + 每页自己的大色块 + 图形丝滑变成另一种」，
中途追加**「不要任何格子背景」** → 第一版「结构覆盖」（同心环 / 交叉网 / 点阵 / 色带 / 弧）**整套删掉**，
⚠️ **别再往回加图案 / 网格 / 线**。
`lib/decor.ts` 新增 `AMBIENTS`（12 页：每页三块的颜料号 / 圆心 / 直径 / 椭圆朝向 / 浓度）+ `AMBIENT_SHIFT_MS` /
`AMBIENT_BASE_VMAX` / `PAGE_FADE_MS`；`AmbientBackdrop`（挂在蓝图层**前面** = 画在它下面，别往上挪）+
`PageIntro`，都挂在 `app/layout.tsx`。
色块：`fixed` 容器 + 三个 `span`，**宽高恒定（36vmax）、几何全在 `transform: translate/rotate/scale`** ——
换页时浏览器插值 transform 与 background-color，这才是「丝滑形变」；宽高按页变会因遮罩按尺寸栅格化而发涩。
软边用 `mask-image: radial-gradient(closest-side, …)` 而**不是** `filter: blur()`（手机上一大片 blur 每帧重栅格化）。
用不到的第三块写 `fade: 0.3`（**不删行**，否则换页会跳变）。
浓度只有一处 `--ambient-alpha`（纸 0.18 / 亮 0.14 / 暗 0.22），正文页整层再压六成、窄屏再压一档；不占文档流（无 CLS）。
渐入四个取舍：**只淡不位移**（`.site-main` 上出现 `transform` 会成为 fixed 后代的包含块 → 进度轨与目录挂件会跟着走）；
**首帧不播**且判定用「上次播过的路径」（开发模式 effect 跑两遍，布尔会被第一次跑掉）；
属性在**布局阶段**挂（否则新页先全亮一帧再变暗）；连换两页先摘属性 + 强制重算再挂回。
时长令牌两个：`--ambient-shift`（1100ms）、`--page-fade`（420ms），组件毫秒数必须对齐。
reduced-motion 下色块不做过渡也不写渐入属性；打印 `.ambient { display: none }`。

**全站加载动画 + 卡片动画 + 卡片细分 + 顶栏按钮去框**：新增 `RouteLoading`（静态导出没有 `loading.tsx`，
补一条画在**视口最上沿**的描线，`z-index: 60` 高于抽屉；三条触发路径 —— 捕获阶段 click（外链 / `target` /
`download` / 修饰键 / 点当前页都跳过）、popstate、首屏未 complete 的 `load`；「完成」信号是 `usePathname()` 变了，
所以进度不是假定时器编的：CSS 爬到 88% 停住等，收尾 12% 由换页触发；reduced-motion 不爬升）。
新增 `CardIntro`（给 `.post-card` 加 `data-card-ready` 与 `--card-delay`；卡片**默认可见**，被观察器认领的才先藏再揭
—— 禁 JS 也不会「内容永远隐形」；同屏最多 8 张 × 45ms；用 `backwards` 填充而**不用 forwards**
（否则 `:hover` 的抬升被压死）；只对当前页首次出现生效；悬停抬 2px + 描边加深 + 淡投影）。
`PostCard` 新增 `data-kind`（见 §4 第 11 项）。顶栏外观按钮去掉边框（`border-color: transparent`，
只对顶栏那一颗；尺寸不变，删 width/height 会让顶栏高度跳）。

**首页更新日志对齐 wunai-Blog**：一列「等宽日期 + 主题 + 最新一枚「新」标记」，默认只有透明描边、悬停浮出，
**整行点开提交页面**（新标签 + `rel="noopener noreferrer"`），`title` 挂完整哈希；`HomeChangelog` 重写。
同轮把数据来源改成参考项目那套（先 GitHub API 再 `git log`，每条带 `url`），`/changelog.json` 多 `source` 字段。

---

## 7. 约定（当时的 11 条；第 5 条已被 §15 替代）

1. **仓库不含任何文章**；`content/**/posts/` 只放 `README.md`（加载器显式跳过）；不写测试 / 示例文。
2. **需要作者补内容处统一标「编辑此处」**（含顶栏图片位 `HEADER_IMAGE`）；关于页与友链页的数据来源分别是
   「`about: true` 的文章」与 `LINKS`（八个已填），空的时候才显示说明。
3. **UI 文案不算文章**，由 `lib/site.ts` 的 i18n 表维护（中英各一份，缺一边会出现 `undefined`）。
4. **零文章、零配置时必须仍能构建与浏览**，所有页面要有空状态；⚠️ 静态导出的「动态路由至少一条路径」硬规则 →
   文章页保留路径 `__empty__`，**别当死链删掉**。
5. ~~动效一律尊重 `prefers-reduced-motion`；背景装饰层只许纯色与大色块（否掉图案 / 网格 / 线）；
   换页渐入只许改 opacity（`.site-main` 上不许有 transform）。~~ **→ 由 §15 替代**（细线可加，但只跟几何实体、不许满页网格）。
6. **开发态自检不是内容**：`PipelineCheck` 只为在文章页之前验证渲染器，第 12 项已删。
7. **外观只有一个落点**：颜色只在 `globals.css` 令牌里定义；不写 `dark:`、不写死色值、不动 `<html data-theme>`。
   唯一例外是设置中心的外观预览色块。
8. **链接可用性只有一个事实来源**：站内链接一律走 `RouteLink`，读 `ROUTES[id].status`；
   阅读偏好只写 `--reading-*` 令牌。
9. **列表与卡片各只有一份实现**：卡片一律 `PostCard` 三档；「只显示某一类文章」一律用查询串，编解码只在 `lib/list.ts`；
   **筛选进地址栏、偏好进 localStorage**。
10. **每页的版面、文案与阈值都在自己的 `lib/*.ts` 里**；被客户端组件引入的那几个只用 `import type`。
11. **顶栏只放三段**（品牌 / 友链 / 图片位），站内入口挂页脚；顶栏高度只有一个来源 `--header-h`，
    「停在顶栏下沿」的东西一律读 `--home-head-room`；顶栏动效只由 `HeaderIntro` 驱动且顺序不能反。

---

## 8. 本地命令与部署

```bash
npm install / npm run dev / npm run typecheck / npm run build / npm run preview / npm run deploy
```

- 外观调试参数：`/zh/?theme=paper|light|dark`（不写 localStorage、刷新即失效）；读者路径是左下角齿轮。
- 图纸对照表（图案现默认关掉，`DECOR_PATTERNS = true` 才看得见）：首页整幅图纸、列表页分栏线、正文页刻度尺、
  标签页密格、分类页剖面线、归档页分栏线、搜索页点阵、关于页密格、友链页剖面线、设置页分栏线、离线页空纸；
  `/zh/nope/` 落到 404 按 `unknown` 画、图签印 `TOB-ZH-00`（预期行为）。
- dev 下也能直接访问构建产物：`/feed.xml`、`/zh/feed.xml`、`/search-index.json`、`/changelog.json`、
  `/sitemap.xml`、`/robots.txt`；零文章时应返回**合法但为空**的内容。
- 部署：Cloudflare **Workers 静态资源**（`wrangler.toml` 的 `[assets] directory = "./out"`、
  `not_found_handling = "404-page"`、`html_handling = "auto-trailing-slash"`；`name = "text-only-blog"` 与云构建项目名必须一致）。
  云构建 Deploy command 用默认的 `npx wrangler deploy`（无参数）。CI：push `main` → workflow，
  Secrets 需要 `CLOUDFLARE_API_TOKEN`（Workers Scripts: Edit 即可）与 `CLOUDFLARE_ACCOUNT_ID`；
  `fetch-depth: 0` 只是兜底（云构建是浅克隆，更新日志优先 API）。改自定义域名：
  Workers & Pages → 该 Worker → Settings → Domains & Routes。部署前本地跑一遍 `build && preview`。
- `wrangler` **不在 devDependencies**（`npx --yes` 现下载）；要钉版本得同锁文件一起提交。

---

## 9. 验证状态（已压缩）

**总说明**：所有代码都在**无 shell 环境**下书写，没在本机跑过 `npm install` / `npm run build` / 任何测试；
实际结果以你本地执行为准，**构建日志是这个项目唯一的集成测试**，有报错直接贴日志。

**真跑过的只有云构建**：首次（TS2345 ×2）→ 二 / 三次（类型 + 静态导出 14/14 过，部署命令错）→
四次（构建过；部署「少空格 + token 无 Pages 权限」）→ 五次（命令正确仍 `code 10000`）→
改 Workers 静态资源后：六次（`package.json` 尾逗号）→ 七次（编译 42s 过、TS7006 ×2）→
八次（编译 29.2s + **类型检查通过**，挂在 `generateStaticParams()` 空数组）。
⚠️ 到归档为止，**`wrangler deploy` 从未真跑通过一次**。

**最要紧的几条待你确认**（其余细节见各轮原文）：

- **产物路径**：`ls out` —— `out/zh/posts/index.html` 在；**`out/search-index.json` 是文件**（不是目录形式的 index.html）；
  `out/sitemap.xml` 里有列表 / 标签 / 归档 / 关于 / 友链，**不该**有 `/zh/search/`、`/zh/settings/`；
  `out/zh` 下七个页面目录在；每篇文章一个 `<slug>/index.html`。②若不对，搜索页会显示「索引没读到…」，把 `ls out` 发我。
- **无 JS 可读**：首页 / 列表 / 文章 / 标签 / 归档都要照常可读可点，文章页只有目录（宽屏）、进度、回顶、评论不见。
- **三套外观**：纸 / 亮 / 暗各看一遍；选暗色硬刷新不闪白；`<html data-theme=… data-theme-choice=…>`；
  head 只有一个 `meta[name="theme-color"]`；五类图表随外观重绘；五线谱暗色下看得清。
- **顶栏 / 首页**：1024/768/480/320px 都看；`.navbar` 高度 88 / 76 / 72px；**禁 JS 顶栏必须一直在**；
  首页一次滑动正好换一栏、栏里没有框、手机第 2/6 栏在栏内滚、滚到底能读到页脚；打印是一条连续文档。
- **列表 / 文章**：工具栏默认一行、点开才展开（`/zh/search/` 展开）；筛选组内或、组间且，地址栏可分享；
  首次输入才请求索引与 fuse；文章页滑块**手感**、目录开关、回顶环、粘性标题、打印不印四件。
  三颗旋钮：`DRAG_THRESHOLD`、`PROGRESS_KEY_STEP`、`TOC_WIDE_QUERY`。
- **背景 / 动效**：背景是一整块纯色（无网格、无图框、边缘无渐隐）；`view-source` 里 `data-decor="plain"`；
  换页大色块是挪过去 / 变形 / 换色；换页渐入只淡不位移、首屏不播；打印无色块。
- **离线 / SW**（`npm run preview` 后）：SW 注册成功、断网刷新看到离线页、第二次访问文章走 `(ServiceWorker)`。
- **教训（2026-10-01 线上实测）**：报「打不开 / 显示不对」时**先抓线上 HTML 与地址再动代码** ——
  那一次本地代码看着完全正常（工作区早补了 `slug`），问题在「没提交」与「产物规则」。

---

## 10. 变更记录（一行一轮）

建立台账 → 第 2/3 项（内容管线 + Markdown 渲染 + 自检）→ 第 4 项（中文排版）→ 第 5 项（构建产物，删失效 prebuild）→
第 6 项（设计系统 + 图表跟主题）→ 首次云构建修复（TS2345 / throwOnError / tsconfig）→ 二、三次（部署命令错 / `wrangLer`）→
四次（少空格 + token 无 Pages 权限 + 发现无锁文件）→ 五次（命令对了仍 10000）→ **部署改 Workers 静态资源** →
六次（JSON 尾逗号）→ 七次（TS7006 ×2）→ 八次（类型过，`generateStaticParams` 空数组 → 保留路径）→
第 7 项（框架 UI）→ 第 8 项（装饰与动效）→ 第 10/11 项（列表页 + 卡片三档）→ 第 12 项（文章页 + abc 配色 + 删自检）→
第 13 项（其余七页）→ 第 14 项（README + 提交，锁文件仍缺）→ 顶栏改版 → 背景改纯色 →
环境色大色块 + 换页渐入 → 卡组页 + 非 ASCII slug 拦截 + 工具栏收起 → 首页改版（一栏一屏，两轮）→
文章页悬浮件补强 → 友链页填八个友链 → 加载动画 + 卡片动画 + 卡片细分 + 顶栏按钮去框 → 首页更新日志对齐参考项目 →
README 补本地部署 → 中文 `**`/`~~` 修正（remark-cjk-friendly）→ 新笔记补 slug + 有序列表空格 →
台账状态变更（§1~§9 转历史，新增【现行】第 15 项）→ **台账拆分（本次）**。
