# PROJECTS —— 项目实施与进度台账

> 本文件是**开发进度台账**，不是站点内容。随着每项推进而更新。
> 站点本身的说明文档在 [README.md](./README.md)（第 14 项完成）。
>
> 文件名沿用你给的名字，按英文习惯补全为 `PROJECTS.md`（原请求写作 `PROGECTS.md`）。
> 如果你要的正是那个拼写，说一声我改名。

---

## 1. 项目定位

**Text-only-blog** —— 纯文字博客。核心诉求：

- 内容以 Markdown 手写，**作者本人亲自写**，仓库不预置任何文章（含测试文章）；
- 面向**阅读优化**：护眼纸质底色、中文排版自动优化、可控阅读宽度/字号/行距、阅读进度与目录；
- 拥有 `wunai-Blog` 的全部写作与渲染能力（双 frontmatter、GFM、公式、五类图表、参考文献、搜索、RSS/PWA）；
- 视觉上是一套「设计图纸 / 蓝图草稿」气质，动效克制、不干扰阅读。

所有需要作者补内容的位置，统一以 **「编辑此处」** 标注。

---

## 2. 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Next.js 16.3（App Router，`output: "export"` 静态导出） |
| UI | React 19.2、Tailwind CSS 4（`@tailwindcss/postcss`）+ 自定义 `app/globals.css` |
| 语言 | TypeScript 5 |
| Markdown | unified / remark（`parse`、`gfm`、`math`、`breaks`）+ rehype（`raw`、`highlight`、`katex`、`slug`、`autolink`、`stringify`） |
| 公式 | KaTeX 0.16 + `katex/contrib/mhchem`（含自定义宏） |
| 检索 | Fuse.js 7（构建期预生成索引，零运行时后端） |
| 图表 | Mermaid、ECharts、Graphviz（`@hpcc-js/wasm-graphviz`）、abc.js、SmilesDrawer —— 全部按需动态加载 |
| 图标 | Iconify（`@iconify/react/offline` + `@iconify/icons-mdi`，离线打包，无运行时请求） |
| 评论 | giscus（GitHub Discussions） |
| 部署 | Cloudflare Pages（wrangler + GitHub Actions） |

形态：**纯静态**。无后端、无数据库、无运行时服务端接口；所有数据在构建期生成。

---

## 3. 目录结构（当前）

```
.
├─ app/
│  ├─ globals.css            样式入口（Tailwind 4 + KaTeX + monokai + 第 3 项渲染样式）
│  ├─ layout.tsx             根布局 / metadata / viewport
│  ├─ page.tsx               根路径语言分流
│  ├─ not-found.tsx          404（导出为 out/404.html）
│  └─ [lang]/
│     ├─ layout.tsx          zh | en 静态参数 + 纠正 <html lang>
│     └─ page.tsx            占位首页（第 9 项替换为八栏吸附）+ 开发态渲染自检
├─ components/
│  ├─ ArticleBody.tsx        正文容器：注入 HTML 并按需动态加载五类图表
│  ├─ charts/
│  │  ├─ mermaid.ts          Mermaid 渲染器（只在有图表时才进包）
│  │  ├─ echarts.ts          ECharts（代码块是 JSON option）
│  │  ├─ graphviz.ts         Graphviz（@hpcc-js/wasm-graphviz）
│  │  ├─ abc.ts              五线谱（abcjs）
│  │  └─ smiles.ts           化学结构式（SmilesDrawer）
│  ├─ dev/PipelineCheck.tsx  开发态渲染自检（生产构建里不出现，可删）
│  ├─ LangRedirect.tsx       浏览器端语言跳转
│  ├─ HtmlLang.tsx           客户端纠正 <html lang>
│  └─ ServiceWorkerRegistrar.tsx  注册 /sw.js（生产构建才注册，dev 下只清旧 SW）
├─ content/
│  ├─ README.md              写作规范
│  └─ {zh,en}/posts/README.md 各语言的目录提示（加载器跳过 README.md）
├─ lib/
│  ├─ site.ts                站点配置（第 6 项扩全）
│  ├─ toml.ts                自写 TOML 解析器（`+++` frontmatter 用）
│  ├─ frontmatter.ts         双格式识别与字段归一化
│  ├─ content.ts             内容加载 / 查询 API（只读盘，不渲染）
│  ├─ charts.ts              图表语言名登记表（服务端与浏览器共用，零依赖）
│  ├─ typography.ts          中文排版优化（第 4 项，纯字符串函数 + remark 插件，零依赖）
│  ├─ markdown.ts            Markdown → HTML 管线（第 3 项）
│  ├─ search-index.ts        搜索索引条目构建（第 5 项，Fuse.js 字段约定在这里）
│  ├─ feeds.ts               RSS 2.0 生成（第 5 项）
│  └─ changelog.ts           构建期读 git log 生成更新日志（第 5 项，无 git 时降级为空）
├─ types/
│  └─ iconify.d.ts           icons-mdi 深路径导入兜底声明
├─ .github/workflows/deploy.yml
├─ wrangler.toml
├─ next.config.ts  postcss.config.mjs  tsconfig.json  package.json
├─ .gitignore
└─ PROJECTS.md   ← 本文件
```

第 5 项新增的产物路由（都在构建期生成纯静态文件，见第 4 节第 5 项）：

```
app/feed.xml/route.ts           /feed.xml          默认语言的 RSS
app/[lang]/feed.xml/route.ts    /zh/feed.xml 等    每语言 RSS
app/search-index.json/route.ts  /search-index.json 搜索索引
app/changelog.json/route.ts     /changelog.json    更新日志
app/sitemap.ts                  /sitemap.xml
app/robots.ts                   /robots.txt
app/manifest.ts                 /manifest.webmanifest
app/offline/page.tsx            /offline/          离线兜底页（被 sw.js 预缓存）
public/sw.js                    /sw.js             Service Worker
public/favicon.svg              /favicon.svg       站点图标（favicon + manifest 图标）
```

规划中（尚未创建）的目录：

```
content/{zh,en}/pages/*.md      关于等独立页面
public/thumbnails/、public/covers/  文章缩略图（可选）
public/icon-192.png 等          PNG 图标（可选，见第 4 节第 5 项「PWA」）
```

---

## 4. 进度清单（14 项）

图例：`[x]` 已完成 · `[~]` 进行中 · `[ ]` 未开始

| # | 项目 | 状态 | 交付物 |
| --- | --- | --- | --- |
| 1 | 脚手架 | `[x]` | Next 16.3 静态导出、React 19.2、Tailwind 4、TS 5、wrangler + GitHub Actions |
| 2 | 内容管线 | `[x]` | YAML(`---`) / TOML(`+++`) 双 frontmatter、卡组、references、AI/draft/pinned |
| 3 | Markdown 渲染 | `[x]` | GFM、highlight.js(monokai)、KaTeX + mhchem + 自定义宏、五类图表、`[reference:N]` 角标 |
| 4 | 中文排版优化 | `[x]` | `lib/typography.ts`：中英之间补空格、半角标点/成对括号转全角、`...`→`……`，代码/公式/链接地址自动跳过；四条规则可单独开关 |
| 5 | 构建产物 | `[x]` | 搜索索引 `/search-index.json`、RSS（`/feed.xml` + 每语言）、sitemap、robots、PWA（`sw.js` + 离线页 + manifest + 图标）、更新日志 `/changelog.json`；全部在 `next build` 里生成 |
| 6 | 设计系统 | `[ ]` | 护眼纸质底色、蓝图草图背景层、亮/暗/纸三套令牌 |
| 7 | 框架 UI | `[ ]` | 顶栏（对齐 wunai-blog）、Footer（左下角设置图标）、设置中心 |
| 8 | 装饰与动效 | `[ ]` | 全站低干扰图形，随路由切换而变化 |
| 9 | 首页 | `[ ]` | 八栏吸附固定 + 侧边指示器（含顺序优化与并排排版） |
| 10 | 列表页 | `[ ]` | 搜索、筛选（标签/时间/分类）、语言切换、密度切换、AI 筛选默认开启 |
| 11 | 文章卡片 | `[ ]` | 紧凑 / 适中 / 内容 三档 |
| 12 | 文章页 | `[ ]` | 悬浮 TOC（含上下篇）、右侧细进度条带百分比、圆形回顶、giscus 评论 |
| 13 | 其余页面 | `[ ]` | 关于/友链/标签/分类/归档/搜索/设置/404/离线 |
| 14 | 交付 | `[ ]` | README + 编辑指南、git 提交推送 |

### 1. 脚手架 —— 已完成 ✅

- `next.config.ts`：`output: "export"`、`trailingSlash: true`、`images.unoptimized`。
  静态导出下不可用 rewrites / redirects / 服务端图片优化，故根路径语言分流放在浏览器端（`components/LangRedirect.tsx`），并保留 `<a>` 兜底。
- `app/globals.css`：Tailwind 4 用 `@import "tailwindcss"` + CSS 变量（`@theme`）配置，不生成 `tailwind.config.js`；一并引入 KaTeX 样式与 monokai 代码高亮主题。
- 依赖版本策略：`next 16.3.1` / `react 19.2.8` 与 `wunai-Blog` 对齐；其余用宽松主版本区间（`^11`、`^5` 等），避免锁到不存在的版本号导致安装失败。`overrides` 把 katex 钉在 `^0.16`。
- 图表库（mermaid / echarts / graphviz / abcjs / smiles-drawer）**不进入首屏包**，只在文章真的出现对应代码块时动态 `import`，为此保留了 PWA 离线可用性。
- 图标走 `@iconify/react/offline` + `@iconify/icons-mdi`，构建期打包，运行时不发请求。

### 2. 内容管线 —— 已完成 ✅

- `lib/toml.ts`：自写 TOML 解析器（frontmatter 子集：字符串 / 多行串 / 整数 / 浮点 / 布尔 / 数组 / 内联表 / 表 / 表数组 / 日期），
  支持 `\uXXXX` 转义与十六进制 / 八进制 / 二进制字面量，报错带**行号列号**；只为实现 `+++` 单独装一个包不划算。
- `lib/frontmatter.ts`：开头 `---` 走 YAML（gray-matter → js-yaml），`+++` 走自写 TOML，都没有就当无 frontmatter。
  归一化层把两种写法揉成同一份语义：日期统一 ISO 字符串、`tags` 数组/分隔字符串都吃、
  布尔容忍 `"true"` / `1` / `"是"`、缩略图别名（`thumbnail` / `image` / `banner`）等。
- `lib/content.ts`：只读盘不渲染。扫描 `content/<lang>/posts/**`，识别卡组（`_index.md` + 无 `_index.md` 的目录）、
  `references`、`pinned` / `draft` / `about` / `hiddenInHomeList` / `isAI`、字数与阅读时长（中日韩按字、西文按词）、
  缩略图三级推断（frontmatter → `public/thumbnails|covers` → 正文第一张图）；**跳过 `README.md` 与下划线开头的文件**；
  `目录/index.md` 代表目录本身；slug 冲突直接抛错；`draft` 只在非生产环境出现。
- `content/README.md` + `content/{zh,en}/posts/README.md`：写作规范（目录约定、两种 frontmatter 示例、字段表、
  日期口径、卡组、参考文献、缩略图、图表语言名、常见报错）。
- **零文章可构建**：目录不存在、一篇没有、`public/` 不存在，查询一律返回空数组 / `null`，不抛错；
  首页顺手读一次 `getContentStats()` 当作管线探针。

### 3. Markdown 渲染 —— 已完成 ✅

- `lib/markdown.ts` 一条 unified 管线（全部在构建期跑，客户端只收 HTML 字符串）：
  `remark-parse → gfm → breaks → math → 图表块 → 引用角标 → remark-rehype → rehype-raw → slug →
  目录收集 → autolink-headings → katex → highlight → stringify`。
- 公式：KaTeX + `katex/contrib/mhchem`（`\ce` / `\pu`）+ `KATEX_MACROS` 自定义宏（`\RR`、`\dd`、`\abs`、`\E`…）。
  `throwOnError: false`：写错公式把错误画在原文位置并着色，而不是让整站构建失败；`trust: false`：不允许 `\href` 之类发请求。
- 代码高亮：highlight.js + monokai（主题在 `app/globals.css` 里 `@import`），未知语言不报错。
- 五类图表：`lib/charts.ts` 是语言名登记表，构建期把 ```` ```mermaid ```` 之类的代码块换成占位 `<figure>`
  （`data-chart` + 隐藏的源码 `<pre class="chart-source">`），客户端 `components/ArticleBody.tsx` 见到才
  **动态 import** 对应渲染器（`components/charts/*.ts`）：mermaid / echarts / graphviz(wasm) / abcjs / smiles-drawer。
  文章里没有图表时，这五个库一个字节都不进客户端包。渲染失败在原位显示红色报错并打到 console。
- 参考文献：正文 `[reference:N]` → 角标链接（`#reference-<slug>`），文末 `renderReferenceList()` 出参考列表。
  排序规则是「纯数字 id 升序在前，其余按书写顺序」，角标数字与列表序号同源；
  id 找不到时渲染成红色 `cite-missing` 并记一条 warning（不中断构建），且给出「首次引用」才有的返回锚点。
- 目录：`rehype-slug` 生成的 id 直接复用（不再自己造 slug），返回**嵌套** `toc` 与 `flattenToc()`；
  标题末尾的 `#` 锚点由 `rehype-autolink-headings` 追加。
- 开发态自检：`components/dev/PipelineCheck.tsx` 内置一段样例（GFM / 公式 / 五类图表 / 角标 / 目录统计），
  只有 `next dev` 的首页会挂它，生产构建里不渲染、也不进产物；确认第 12 项（文章页）之后可以直接删掉这个文件。

### 4. 中文排版优化 —— 已完成 ✅

- `lib/typography.ts`：**零依赖**（不 import 任何包），纯字符串函数 + 一个 remark 插件。
  四条规则，都能单独关掉：
  1. **空隙**：汉字/假名/谚文 与**半角**字母数字紧挨着时补一个空格（`中文English` → `中文 English`、
     `2024年` → `2024 年`）。补的是普通空格 U+0020（与 pangu.js 一致，不用窄空格 —— 免得
     「看起来有空格却选不中」）；两边本来就有空白的不动，尊重作者自己排的版。
  2. **标点**：**前一个字符是中文语境**时，半角 `, . ; : ! ?` 转 `，。；：！？`。
  3. **省略号**：中文语境的 `...` 转 `……`，整串点一次吃掉（`....` 也只出一个）。
  4. **括号**（跟随第 2 条的开关）：半角括号**必须成对**且有一侧贴着中文语境才换
     （`中文(test)` → `中文（test）`；`f(x)` 不动）。用栈配对，落单的括号一律不碰 ——
     换半个会得到 `中文（test）` 这种错配。
- **防误伤是这块的主要工作量**，靠的是两条：
  - 只处理 mdast 的 `text` 节点 —— 代码块/行内代码/公式/链接地址/内联 HTML 的字符串分别在
    `code` / `inlineCode` / `math` / `inlineMath` / `html` 节点或属性里，天生不在处理范围内；
  - 标点规则只看「前一个字符是不是中文」，于是 `1,000`、`3.14`、`v1.2.3`、`example.com`、
    `a.ts`、`http://` 全部自动免疫（又对 `.` 补了「后面跟字母数字或 `/` 就不换」的兜底）。
  - 引号（半角 `"` `'`）**刻意不转**：英文引号与代码里的引号误伤率太高，中文引号请直接写 `“ ”`。
  - 已知不处理：跨节点的相邻（`**中文**English`）看起来没关系，需要作者自己补一个空格。
- 接入 `lib/markdown.ts`：排在 `remarkMath` 之后、`remarkCitations` 之前。
  角标语法不会被碰坏是**推演出来的**而不是碰巧：`[reference:1]` 里 `:` 的左边是字母 `e`，
  规则 2 要求左边是中文语境；`[` 左边虽是中文，但规则 1 只认「中文↔字母数字」。
- 开关：`renderMarkdown(body, { typography: false | { spacing, punctuation, parentheses } })`；
  返回值多了 `typography: { texts, spaces, punctuation, parentheses, ellipses }`，供构建日志与自检显示。
  frontmatter 的 `typography` 字段接到这里属于第 12 项（文章页）的活，规范已在
  `content/README.md` 第 9 节写明。
- 自检：`components/dev/PipelineCheck.tsx` 新增两段样例 —— 一段故意写得很糙的中英混排
  （应当被收拾干净），一段是对照组（`typography: false`，应当原样输出），并在页面上打印改动计数。

### 5. 构建产物 —— 已完成 ✅

**先记一个方案变更（重要）**：原计划是 `scripts/*.mjs` + `prebuild` 生成搜索索引 / RSS / 更新日志。
实际动手时发现那样必须**把 frontmatter 解析与内容扫描在 .mjs 里再写一遍**（Node 跑不了 `.ts`，
除非加 `tsx` 之类的运行时依赖，而 `lib/content.ts` 又只认 node:fs）——两份实现必然漂移。
于是改成：**全部在 `next build` 里生成**，产物路径交给 Next 自己的约定。
依据是 Next 官方文档里的两句话（Static Exports 页）：Route Handler 在 `next build` 时渲染静态响应、
只支持 GET、**必须显式标 `export const dynamic = "force-static"`**；且 `sitemap.xml` / `robots.txt` /
`manifest.json` 这些元数据文件「有内建支持」。所以：

| 产物 | 文件 | 公开地址 |
| --- | --- | --- |
| RSS（默认语言） | `app/feed.xml/route.ts` | `/feed.xml` |
| RSS（每语言） | `app/[lang]/feed.xml/route.ts`（配 `generateStaticParams` + `dynamicParams = false`） | `/zh/feed.xml`、`/en/feed.xml` |
| 搜索索引 | `app/search-index.json/route.ts` | `/search-index.json` |
| 更新日志 | `app/changelog.json/route.ts` | `/changelog.json` |
| sitemap | `app/sitemap.ts` | `/sitemap.xml` |
| robots | `app/robots.ts` | `/robots.txt` |
| manifest | `app/manifest.ts` | `/manifest.webmanifest` |

- `package.json` 里**删掉了 `prebuild` / `predev`**：它们指向的 `scripts/*.mjs` 从来没创建过，
  也就是说这两个钩子一直在让 `npm run build` / `npm run dev` 直接失败（台账旧版里那句
  「build 尚不可用」说的就是它）。现在 dev / build 都能跑，产物在构建期生成。
- **搜索索引**（`lib/search-index.ts`）：每篇一条 `SearchDoc`，字段
  `lang / slug / href / title / description / excerpt / body / tags / categories / group /
  date / updated / pinned / isAI / words / readingMinutes / cover`；
  `fields` 数组（`SEARCH_FIELDS`）与 `version` 一起写进索引，列表页（第 10 项）直接照它配 Fuse.js，
  别在页面里写死字段名。全文检索有意义，所以正文也进索引，但每篇只取前
  `SEARCH_BODY_LIMIT = 1200` 个字符（去 Markdown 标记之后），避免索引膨胀到几百 KB 拖累离线预缓存；
  想改这个折中只改一个常量。**索引格式变了就 +1 `SEARCH_INDEX_VERSION`**。
- **RSS**（`lib/feeds.ts`）：RSS 2.0（不做 Atom / JSON Feed），`atom:link rel="self"` 自指，
  `pubDate` 用 RFC 822、`lastBuildDate` 取最新一篇文章的时间；每条只给**摘要 + 链接**，不带全文
  （全文要把每篇都渲染一遍，与「让人来站点读书」相反）；标签进 `<category>`；
  控制字符会被清掉（XML 1.0 不允许，留着会让阅读器整份订阅报错）。
  最多 `FEED_LIMIT = 30` 条，零文章时输出合法的空 channel。
- **更新日志**（`lib/changelog.ts`）：`git log --no-merges --date=short`，字段用 ASCII 的
  Unit Separator 分隔（正文里不可能出现，不会和 `|` 撞车）；结果按 `includeMerges` 缓存两份，
  首页栏与 JSON 路由不会各跑一次 git。**拿不到 git 时返回空数组 + 一条 console.warn，绝不让构建失败**
  （产物目录、tarball 解压、机器没装 git 都属于这种情况）。CI 里依旧需要 `fetch-depth: 0`。
- **sitemap**：`/`、`/{zh,en}/` 与文章页；语言之间用 `alternates.languages` 配 hreflang
  （文章按 slug 跨语言配对，另给 `x-default`）。
  ⚠️ 文章 URL 依赖第 12 项的文章页 —— 落地前它们会 404，这条记进了第 12 项的待办。
  第 10 / 13 项新增页面（标签、归档、关于、搜索）时，在 `pageRoutes()` 里补一行。
- **robots**：只禁止三类非内容路径 —— `/offline/`、`/search-index.json`、`/changelog.json`；
  正文与归档一律允许；附带 `sitemap` 与 `host`。
- **PWA**：
  - `app/manifest.ts` 生成 `/manifest.webmanifest`（`app/layout.tsx` 早就指着这个地址）；
    `start_url` 是默认语言首页，`display: standalone`，配色先用亮色令牌
    （`#f4f1e8` / `#0e1416`，第 6 项做设计系统时再换）。
  - `public/sw.js`（**不打包**，浏览器直接跑，所以是普通 JS、不能 import）：
    install 预缓存外壳（`/`、`/zh/`、`/en/`、`/offline/`、manifest、favicon，逐条 try/catch，
    单条失败不影响整体）；activate 清掉旧版本缓存并 `clients.claim()`；
    fetch 策略分两类 —— 导航请求**网络优先**（失败 → 该地址缓存 → 离线页），
    同源静态资源**缓存优先 + 后台更新**（`/_next/*` 等要么带内容哈希、要么可再生）。
    跨源、非 GET、Range 请求一律不插手。改了策略或外壳清单就 +1 `CACHE_VERSION`。
  - `app/offline/page.tsx`（`/offline/`）：纯静态、零联网依赖，列出几个「已缓存、断网也能打开」的入口；
    `metadata.robots = noindex`，同时被 robots.txt 排除（双保险）。
  - `components/ServiceWorkerRegistrar.tsx`：挂在根布局，**只在生产构建注册**；
    `next dev` 下反向注销已有的 SW（否则热更新会被旧缓存糊住，是这类站点的经典坑）。
  - `public/favicon.svg`：「设计图纸」风格（图框 + 三行字），内联 `prefers-color-scheme`
    让亮/暗主题各一套颜色；它同时是 favicon 与 manifest 的图标。
  - **编辑此处**：PNG 图标（192 / 512）还没做 —— 本仓库生成不了二进制图片。
    想「加到主屏幕」更稳，就把 PNG 放进 `public/`，再到 `app/manifest.ts` 的 `icons` 里补两条。
- 订阅源自动发现：`app/layout.tsx` 的 `metadata.alternates.types` 里登记了两个语言的 RSS，
  浏览器 / 阅读器不用手输地址。**注意**：Next 的 metadata 是浅合并 ——
  文章页（第 12 项）如果自己写了 `alternates`，这条 `types` 会被整体覆盖掉，要在文章页里补回来。

### 跨项待办（做到对应项时顺手勾掉）

- **第 12 项（文章页）**：
  1. 把 frontmatter 的 `typography` 字段接到 `renderMarkdown` 的 `RenderOptions.typography`
     （渲染层已经支持，规范写在 `content/README.md` 第 9 节）；
  2. 文章页如果写了 `alternates`，记得把根布局里那两条 RSS `types` 补回去（见上）；
  3. 文章页落地后，sitemap 与 RSS 里的文章 URL 才是真的可访问（在那之前它们指向 404）；
  4. 顺手删掉 `components/dev/PipelineCheck.tsx` 与 `app/[lang]/page.tsx` 里的那三行。
- **第 10 项（列表页）**：搜索直接读 `/search-index.json` 的 `fields` / `version`
  （`lib/search-index.ts` 的 `SEARCH_INDEX_VERSION` 与 `SEARCH_FIELDS` 是唯一事实来源）。
- **第 13 项（其余页面）**：新页面加到 `app/sitemap.ts` 的 `pageRoutes()`；
  离线页的文案也归这一项。
- **第 14 项（交付）**：把 `wrangler` 写进 devDependencies（`npm run deploy` 现在要靠本机已装的 wrangler）；
  PNG 图标（192 / 512）如果不打算做，就在 README 里写明「只提供 SVG 图标」。
- `content/README.md` 新增第 9 节（原文第 9 节「常见报错」顺延为第 10 节），
  `content/{zh,en}/posts/README.md` 各加了一行指路。

---

## 5. 约定与规则（重要）

1. **仓库不含任何文章。** `content/**/posts/` 只放 `README.md`（写作规范），加载器显式跳过该文件名；不写测试文章、不写示例文章。
2. **需要作者补内容的地方统一标「编辑此处」**，包括：站点标语/描述、首页各栏文案、关于页、友链、演示段落、头像与 favicon 资源位。
3. **UI 文案不算文章**，由 `lib/site.ts` 的 i18n 表统一维护（中英各一份，缺一边会出现 `undefined`）。
4. 零文章、零配置时站点必须仍能构建与浏览，所有页面要有空状态。
5. 动效一律尊重 `prefers-reduced-motion`，且背景/装饰层不得影响正文可读性（`aria-hidden`、`pointer-events: none`）。
6. **开发态自检不是内容**：`components/dev/PipelineCheck.tsx` 只为在文章页之前验证渲染器而存在，
   生产构建里不渲染、不进产物；第 12 项落地后删掉它和 `app/[lang]/page.tsx` 里那三行即可。

---

## 6. 本地命令

```bash
npm install          # 安装依赖
npm run dev          # 开发服务器，访问 / 会自动分流到 /zh/
npm run typecheck    # tsc --noEmit：只查类型，不产出（比 build 快，改完代码先跑它）
npm run build        # 生产构建：搜索索引 / RSS / sitemap / robots / manifest / 更新日志都在这一步生成
npm run preview      # 本地预览 out/ 静态产物（Service Worker 只在这里能用上）
npm run deploy       # wrangler 部署到 Cloudflare Pages
```

> 第 5 项之前，`build` 会因为 `prebuild` 指向不存在的 `scripts/*.mjs` 直接失败；
> 现在那个钩子已经删掉，`dev` 与 `build` 都可以跑。
> 另注：`npm run deploy` 用的 `wrangler` 目前**没有写进 devDependencies**，
> 本机部署前先 `npx wrangler --version` 或全局装一个（这事留给第 14 项一并处理）。

`npm run dev` 后打开 `/zh/`：除了首页占位，还会看到一块「渲染管线自检」，
里面把第 3 项的 GFM、公式、代码高亮、五类图表、参考文献角标、目录抽取，
以及第 4 项的中文排版（含 `typography: false` 的对照组）全跑一遍，
用来在还没有文章的时候确认渲染器是通的。

构建产物（第 5 项）在 dev 下也能直接访问，它们是按需求值的 Route Handler：
`/feed.xml`、`/zh/feed.xml`、`/search-index.json`、`/changelog.json`、`/sitemap.xml`、`/robots.txt`。
零文章时每个都应返回**合法但为空**的内容（空 channel、`docs: []`、只有首页的 sitemap）。

---

## 7. 部署

- 平台：Cloudflare Pages，产物目录 `out/`（见 `wrangler.toml`）。
- CI：`.github/workflows/deploy.yml`，push 到 `main` 触发；`fetch-depth: 0` 是必须的
  （更新日志在 `next build` 期间读 `git log`，浅克隆会让记录不全 —— 拿不到 git 时构建不会失败，
  但那份 `changelog.json` 会是空的）。
- 需要在仓库 Secrets 配置：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。
- `wrangler.toml` 里的 `name`、workflow 里的 `--project-name` 均为 `text-only-blog`，改名请同步两处。
- 部署前值得自己在本地跑一遍 `npm run build && npm run preview`：静态导出有多少坑（路由产物路径、
  Service Worker、离线页）只有真跑一次才看得见。

---

## 8. 验证状态说明（如实）

构建期脚本与依赖均在**无 shell 环境**下书写，未在本机执行 `npm install` / `npm run build` / 测试。
因此：

- 已完成的代码属于「写完即交付」，实际编译与运行结果以你本地执行为准；
- 有报错直接把日志贴给我，我按证据修；
- 每次交付后本文件的进度表与「已完成 / 进行中」小节会同步更新。

已经做过、但只有你本地能确认的事：

- `katex/contrib/mhchem` 的导入路径对着 katex 0.16.22 的 `exports` 字段核对过
  （`./contrib/mhchem` → `dist/contrib/mhchem.mjs`，是副作用模块，`\ce` 会注册到同一个 katex 实例上）；
- 图表库（mermaid 11 / echarts 5 / @hpcc-js/wasm-graphviz 1 / abcjs 6 / smiles-drawer 2）都只在本仓库里
  **动态 import**，没有做「先跑一遍」的验证；它们的导出形状（默认导出 vs 具名导出）在代码里两种都试，
  真的不匹配会在图的位置上打印明确的报错；
- Graphviz 的 `.wasm` 由 `@hpcc-js/wasm-graphviz` 自己加载，若首次打开报 wasm 404，把那句报错贴给我；
- 第 3 项的外观目前只有 `app/globals.css` 里的**最小可读样式**（含一条明确的注释说明这一节会被第 6 项替换），
  图表主题暂时跟随 `prefers-color-scheme`，第 6 项加主题开关后改读 `<html data-theme>`（`ArticleBody.tsx` 里已预留）；
- 第 4 项（中文排版优化）已接进 `lib/markdown.ts` 的管线，位置在 `remarkCitations` 之前；
  规则与「为什么不会误伤代码/公式/数字」写在 `lib/typography.ts` 的头部注释里，
  但那套字符分类与配对逻辑**只在本机跑过一次就交付**，边界情况（尤其括号配对、中日文混排）
  请用 `npm run dev` 的首页自检对照着看。
- 第 5 项（构建产物）**有一处方案变更**：改成在 `next build` 里生成，而不是 `scripts/*.mjs` + `prebuild`
  （理由见第 4 节第 5 项开头）。依据是 Next 16 官方文档《Static Exports》里关于 GET Route Handler 与
  `sitemap.xml` / `robots.txt` / `manifest.json` 的说法，文档是现查的、**代码本身没跑过构建**。
  需要你本机确认的三件事，按怀疑程度排序：
  1. **`/feed.xml`、`/search-index.json`、`/changelog.json` 的产物路径**。文档示例是
     `app/data.json/route.ts` → `data.json`，但本仓库开了 `trailingSlash: true`，
     我**没能从文档里确认** Route Handler 会不会也被加上尾斜杠（变成 `out/feed.xml/index.html` 之类）。
     `npm run build` 后看一眼 `ls out` 就知道；真有问题最省事的修法是把这三个文件改成
     `public/` 下的静态文件、由一个 script 生成 —— 告诉我，我来改。
  2. **sitemap / robots / manifest 是否真的落到 `out/` 根目录**（同样只有 `ls out` 才知道）。
  3. **`app/manifest.ts` 的字段是否都在 Next 的 `MetadataRoute.Manifest` 类型里**
     （我用了 `lang` / `dir` / `id` / `categories` 这些规范里的字段；`npm run typecheck` 会直接指出哪个不在）。
- Service Worker（`public/sw.js`）与离线页只做了「逻辑上自洽」，没在任何浏览器里跑过。
  `npm run preview` 之后确认三件事：Application → Service Workers 里注册成功；
  断网（DevTools → Network → Offline）刷新仍能看到离线页；
  第二次访问同一篇文章时 Network 里该页面走的是 `(ServiceWorker)` 而不是 `(Disk cache)`/网络。

---

## 9. 变更记录（台账自身）

| 日期 | 变更 |
| --- | --- |
| 本次提交 | 建立台账；第 1 项脚手架完成；第 2 项内容管线开工 |
| 本次提交 | 第 2 项内容管线完成（TOML/YAML 双 frontmatter、内容加载与查询、写作规范）；第 3 项 Markdown 渲染完成（GFM/KaTeX+宏/高亮/五类图表按需加载/参考文献角标/目录）；新增开发态渲染自检 |
| 本次提交 | 第 4 项中文排版优化完成（`lib/typography.ts`：补空格 / 标点与成对括号转全角 / `...`→`……`，四条规则可开关，代码与公式与链接地址自动跳过）；自检加两组对照；写作规范新增第 9 节 |
| 本次提交 | 第 5 项构建产物完成（方案改为在 `next build` 内生成：`/search-index.json`、`/feed.xml` + 每语言 RSS、`/sitemap.xml`、`/robots.txt`、`/manifest.webmanifest`、`/changelog.json`；PWA：`public/sw.js` + `/offline/` + 注册组件 + `favicon.svg`）；删除失效的 `prebuild`/`predev`（它们一直是 `build` 失败的根因）并新增 `typecheck`；新增「跨项待办」小节 |
